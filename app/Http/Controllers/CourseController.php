<?php

namespace App\Http\Controllers;

use App\Http\Requests\FilterCoursesRequest;
use App\Models\Attendance;
use App\Models\Course;
use App\Models\Lesson;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(FilterCoursesRequest $request): Response
    {
        $user = $request->user();

        // Get validated filters
        $filters = $request->validated();

        // Build query with eager loading
        $query = Course::query()
            ->with(['instructor'])
            ->withCount(['lessons', 'enrollments']);

        // Apply filters
        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('title', 'like', "%{$filters['search']}%")
                    ->orWhere('description', 'like', "%{$filters['search']}%");
            });
        }

        if (! empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (! empty($filters['difficulty'])) {
            $query->where('difficulty', $filters['difficulty']);
        }

        // Apply sorting
        $sort = $filters['sort'] ?? 'latest';
        match ($sort) {
            'popular' => $query->orderByDesc('enrollments_count'),
            'latest' => $query->latest(),
            'progress' => $query->orderByDesc('updated_at'),
            default => $query->latest(),
        };

        // Paginate
        if ($user->hasRole('tutor') && ! $user->hasRole('admin')) {
            $query->where('instructor_id', $user->id);
        } elseif (! $user->hasAnyRole(['admin', 'tutor'])) {
            // Students can only see published courses
            $query->where('is_published', true);
        }

        $courses = $query->paginate(12)->withQueryString();

        // Get user enrollments to compute progress
        $enrollments = $user->enrollments()
            ->with('course.lessons')
            ->get()
            ->keyBy('course_id');

        // Add user progress to courses
        $courses = $courses->through(function ($course) use ($enrollments, $user) {
            $courseData = $course->toArray();

            if ($enrollments->has($course->id)) {
                $enrollment = $enrollments[$course->id];
                $courseData['user_progress'] = [
                    'progress_percentage' => (float) ($enrollment->progress_percentage ?? 0),
                    'next_lesson' => $user->nextLessonForEnrollment($enrollment)?->toArray(),
                ];
            }

            return $courseData;
        });

        return Inertia::render('courses/index', [
            'filters' => $filters,
            'courses' => $courses,
        ]);
    }

    public function show(Course $course): Response
    {
        $course->load(['instructor', 'lessons.contents']);

        $user = auth()->user();
        if ($user && $user->hasRole('tutor') && ! $user->hasRole('admin') && $course->instructor_id !== $user->id) {
            abort(403);
        }
        $isEnrolled = false;

        if ($user) {
            $isEnrolled = $user->enrollments()->where('course_id', $course->id)->exists();
            
            // Load user's attendance for each lesson
            $attendedLessonIds = $user->attendances()
                ->whereIn('lesson_id', $course->lessons->pluck('id'))
                ->pluck('lesson_id')
                ->toArray();
                
            // Add attendance status to each lesson
            $course->lessons->each(function ($lesson) use ($attendedLessonIds) {
                $lesson->has_attended = in_array($lesson->id, $attendedLessonIds);
            });
        }

        return Inertia::render('courses/show', [
            'course' => $course,
            'isEnrolled' => $isEnrolled,
        ]);
    }

    public function markAttendance(Lesson $lesson)
    {
        $user = auth()->user();
        
        if (!$user) {
            return back()->withErrors(['error' => 'Unauthorized']);
        }

        // Check if meeting is currently active (optional time validation)
        // Commented out for debug mode - uncomment in production
        // $now = now();
        // if ($lesson->meeting_start_time && $lesson->meeting_end_time) {
        //     if ($now < $lesson->meeting_start_time || $now > $lesson->meeting_end_time) {
        //         return back()->withErrors(['error' => 'Meeting is not active']);
        //     }
        // }

        // Mark or update attendance
        Attendance::updateOrCreate(
            [
                'user_id' => $user->id,
                'lesson_id' => $lesson->id,
            ],
            [
                'attended_at' => now(),
            ]
        );

        return back();
    }


}
