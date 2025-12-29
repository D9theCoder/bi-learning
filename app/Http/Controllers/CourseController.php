<?php

namespace App\Http\Controllers;

use App\Http\Requests\FilterCoursesRequest;
use App\Models\Assessment;
use App\Models\AssessmentSubmission;
use App\Models\Attendance;
use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Http\Request;
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
        $isAdmin = $user?->hasRole('admin') ?? false;
        $hasTutorRole = $user?->hasRole('tutor') ?? false;
        $isInstructor = $user && $course->instructor_id === $user->id;
        $isTutor = $isAdmin || ($hasTutorRole && $isInstructor) || $isInstructor;

        if ($user && $hasTutorRole && ! $isAdmin && ! $isInstructor) {
            abort(403);
        }

        $isEnrolled = false;
        $students = [];
        $assessments = [];
        $submissions = [];

        if ($user) {
            if (! $isInstructor) {
                $isEnrolled = $user->enrollments()->where('course_id', $course->id)->exists();
            }

            if ($isTutor) {
                // Fetch enrolled students with attendance
                $students = \App\Models\Enrollment::where('course_id', $course->id)
                    ->with(['user', 'user.attendances' => function ($q) use ($course) {
                        $q->whereIn('lesson_id', $course->lessons->pluck('id'));
                    }])
                    ->get()
                    ->map(function ($enrollment) use ($course) {
                        $userData = $enrollment->user->toArray();
                        $userData['enrollment_status'] = $enrollment->status;
                        $userData['attendances'] = $enrollment->user->attendances;
                        // Add submissions
                        $userData['submissions'] = AssessmentSubmission::whereHas('assessment', function ($q) use ($course) {
                            $q->where('course_id', $course->id);
                        })->where('user_id', $enrollment->user->id)->get();

                        return $userData;
                    });

                $assessments = Assessment::where('course_id', $course->id)
                    ->with(['submissions.user'])
                    ->get();
            } else {
                $attendedLessonIds = $user->attendances()
                    ->whereIn('lesson_id', $course->lessons->pluck('id'))
                    ->pluck('lesson_id')
                    ->toArray();

                $course->lessons->each(function ($lesson) use ($attendedLessonIds) {
                    $lesson->has_attended = in_array($lesson->id, $attendedLessonIds);
                });

                if ($isEnrolled) {
                    $assessments = Assessment::where('course_id', $course->id)->get();
                    $submissions = AssessmentSubmission::whereIn('assessment_id', $assessments->pluck('id'))
                        ->where('user_id', $user->id)
                        ->get();
                }
            }
        }

        return Inertia::render('courses/show', [
            'course' => $course,
            'isEnrolled' => $isEnrolled,
            'isTutor' => $isTutor,
            'students' => $students,
            'assessments' => $assessments,
            'submissions' => $submissions,
        ]);
    }

    public function markAttendance(Lesson $lesson)
    {
        $user = auth()->user();

        if (! $user) {
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

    public function updateScore(Request $request, Assessment $assessment)
    {
        $user = auth()->user();
        if (! $user) {
            abort(401);
        }

        $course = $assessment->course;
        if (! $user->hasRole('admin') && $course->instructor_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'score' => 'required|integer|min:0|max:'.$assessment->max_score,
            'feedback' => 'nullable|string',
        ]);

        AssessmentSubmission::updateOrCreate(
            [
                'assessment_id' => $assessment->id,
                'user_id' => $validated['user_id'],
            ],
            [
                'score' => $validated['score'],
                'feedback' => $validated['feedback'],
                'submitted_at' => now(),
            ]
        );

        return back()->with('message', 'Score updated.');
    }
}
