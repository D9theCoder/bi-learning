<?php

namespace App\Http\Controllers;

use App\Http\Requests\FilterStudentsRequest;
use App\Models\Course;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(FilterStudentsRequest $request): Response
    {
        $filters = $request->validated();
        $user = Auth::user();
        $isAdmin = $user?->hasRole('admin');

        $courseIds = Course::query()
            ->where('instructor_id', $user?->id)
            ->pluck('id');

        $studentIds = User::query()
            ->whereHas('enrollments', function ($query) use ($courseIds) {
                $query->whereIn('course_id', $courseIds);
            })
            ->pluck('id')
            ->unique()
            ->values();

        $query = User::query();

        if ($isAdmin) {
            $query->role('student')
                ->withCount(['enrollments', 'activeEnrollments']);
        } else {
            $query->whereIn('id', $studentIds);
        }

        if (! empty($filters['search'])) {
            $query->where('name', 'like', "%{$filters['search']}%");
        }

        $students = $query->paginate(12)->withQueryString();

        $students = $students->through(function ($student) use ($isAdmin) {
            return [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'avatar' => $student->avatar,
                'level' => $isAdmin ? ($student->level ?? 1) : null,
                'points_balance' => $isAdmin ? ($student->points_balance ?? 0) : null,
                'total_xp' => $isAdmin ? ($student->total_xp ?? 0) : null,
                'enrollments_count' => $isAdmin ? ($student->enrollments_count ?? 0) : null,
                'active_enrollments_count' => $isAdmin ? ($student->active_enrollments_count ?? 0) : null,
            ];
        });

        return Inertia::render('students/index', [
            'filters' => $filters,
            'students' => $students,
        ]);
    }
}
