<?php

namespace App\Http\Controllers;

use App\Http\Requests\FilterTutorsRequest;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class TutorController extends Controller
{
    public function index(FilterTutorsRequest $request): Response
    {
        $filters = $request->validated();

        // Query tutors using Spatie Laravel Permission
        $query = User::role('tutor')
            ->with('cohort');

        // Apply filters
        if (! empty($filters['search'])) {
            $query->where('name', 'like', "%{$filters['search']}%");
        }

        if (! empty($filters['cohort_id'])) {
            $query->where('cohort_id', $filters['cohort_id']);
        }

        if (! empty($filters['expertise'])) {
            // Assuming expertise is stored as JSON or similar
            $query->whereJsonContains('expertise', $filters['expertise']);
        }

        $tutors = $query->paginate(12)->withQueryString();

        $tutors->through(function ($tutor) {
            return [
                'id' => $tutor->id,
                'name' => $tutor->name,
                'avatar' => $tutor->avatar,
                'cohort' => $tutor->cohort ? [
                    'id' => $tutor->cohort->id,
                    'name' => $tutor->cohort->name,
                ] : null,
                'expertise' => $tutor->expertise ?? [],
                'rating' => $tutor->rating ?? null,
            ];
        });

        return Inertia::render('tutors/index', [
            'filters' => $filters,
            'tutors' => $tutors,
        ]);
    }
}
