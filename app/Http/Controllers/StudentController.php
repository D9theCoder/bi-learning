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

        if ($studentIds->isNotEmpty()) {
            $query->whereIn('id', $studentIds);
        } else {
            $query->role('student');
        }

        if (! empty($filters['search'])) {
            $query->where('name', 'like', "%{$filters['search']}%");
        }

        $students = $query->paginate(12)->withQueryString();

        $students = $students->through(function ($student) {
            return [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'avatar' => $student->avatar,
            ];
        });

        return Inertia::render('students/index', [
            'filters' => $filters,
            'students' => $students,
        ]);
    }
}
