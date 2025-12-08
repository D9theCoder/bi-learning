<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCourseRequest;
use App\Http\Requests\UpdateCourseRequest;
use App\Models\Course;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CourseManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = Course::query()->with('instructor');

        if (! $user->hasRole('admin')) {
            $query->where('instructor_id', $user->id);
        }

        $courses = $query
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(function (Course $course) {
                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'category' => $course->category,
                    'difficulty' => $course->difficulty,
                    'is_published' => $course->is_published,
                    'updated_at' => $course->updated_at?->toIsoString(),
                    'instructor' => $course->instructor ? [
                        'id' => $course->instructor->id,
                        'name' => $course->instructor->name,
                    ] : null,
                ];
            });

        return Inertia::render('courses/manage/index', [
            'courses' => $courses,
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();

        if (! $user->hasAnyRole(['admin', 'tutor'])) {
            abort(403);
        }

        return Inertia::render('courses/manage/edit', [
            'course' => null,
            'mode' => 'create',
        ]);
    }

    public function store(StoreCourseRequest $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validated();

        if ($user->hasRole('admin')) {
            $data['instructor_id'] = $data['instructor_id'] ?? $user->id;
        } else {
            $data['instructor_id'] = $user->id;
        }

        $data['difficulty'] = $data['difficulty'] ?? 'beginner';
        $data['is_published'] = $request->boolean('is_published');

        $course = Course::create($data);

        return redirect()
            ->route('courses.manage.edit', $course)
            ->with('message', 'Course created.');
    }

    public function edit(Request $request, Course $course): Response
    {
        $user = $request->user();

        if ($user->hasRole('tutor') && ! $user->hasRole('admin') && $course->instructor_id !== $user->id) {
            abort(403);
        }

        return Inertia::render('courses/manage/edit', [
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'description' => $course->description,
                'thumbnail' => $course->thumbnail,
                'duration_minutes' => $course->duration_minutes,
                'difficulty' => $course->difficulty,
                'category' => $course->category,
                'is_published' => $course->is_published,
                'instructor_id' => $course->instructor_id,
            ],
            'mode' => 'edit',
        ]);
    }

    public function update(UpdateCourseRequest $request, Course $course): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validated();

        if ($user->hasRole('admin')) {
            $data['instructor_id'] = $data['instructor_id'] ?? $course->instructor_id;
        } else {
            $data['instructor_id'] = $user->id;
        }

        $data['difficulty'] = $data['difficulty'] ?? $course->difficulty ?? 'beginner';
        $data['is_published'] = $request->boolean('is_published');

        $course->update($data);

        return redirect()
            ->route('courses.manage.edit', $course)
            ->with('message', 'Course updated.');
    }
}
