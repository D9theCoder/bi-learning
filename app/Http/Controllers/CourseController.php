<?php

namespace App\Http\Controllers;

use App\Http\Requests\FilterCoursesRequest;
use App\Models\Course;
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
            ->withCount('lessons');

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
        $courses = $query->paginate(12)->withQueryString();

        // Get user enrollments to compute progress
        $enrollments = $user->enrollments()
            ->with('course.lessons')
            ->get()
            ->keyBy('course_id');

        // Add user progress to courses
        $courses->through(function ($course) use ($enrollments, $user) {
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
}
