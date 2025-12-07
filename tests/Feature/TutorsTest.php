<?php

use App\Models\Cohort;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Database\Seeders\RolesAndPermissionsSeeder;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

it('requires authentication', function () {
    $response = $this->get(route('tutors'));
    $response->assertRedirect(route('login'));
});

it('shows all tutors when user has no enrollments', function () {
    $user = User::factory()->create();
    User::factory()->count(3)->create()->each(function (User $tutor) {
        $tutor->assignRole('tutor');
    });

    $response = $this->actingAs($user)->get(route('tutors'));

    $response->assertSuccessful();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('tutors/index')
        ->has('tutors.data', 3)
    );
});

it('shows only tutors for the user enrolled courses', function () {
    $user = User::factory()->create();

    $enrolledTutor = User::factory()->create();
    $enrolledTutor->assignRole('tutor');

    $otherTutor = User::factory()->create();
    $otherTutor->assignRole('tutor');

    $enrolledCourse = Course::factory()->for($enrolledTutor, 'instructor')->create();
    Course::factory()->for($otherTutor, 'instructor')->create();

    Enrollment::factory()->for($user)->for($enrolledCourse)->create();

    $response = $this->actingAs($user)->get(route('tutors'));

    $response->assertSuccessful();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('tutors/index')
        ->has('tutors.data', 1)
        ->where('tutors.data.0.id', $enrolledTutor->id)
    );
});

it('shows course instructors even without tutor role', function () {
    $user = User::factory()->create();

    $instructor = User::factory()->create(); // no tutor role
    $otherTutor = User::factory()->create()->assignRole('tutor');

    $courseWithInstructor = Course::factory()->for($instructor, 'instructor')->create();
    Enrollment::factory()->for($user)->for($courseWithInstructor)->create();

    $response = $this->actingAs($user)->get(route('tutors'));

    $response->assertSuccessful();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('tutors/index')
        ->has('tutors.data', 1)
        ->where('tutors.data.0.id', $instructor->id)
    );
});

it('respects cohort filter within enrolled tutors', function () {
    $user = User::factory()->create();
    $cohort1 = Cohort::factory()->create();
    $cohort2 = Cohort::factory()->create();

    $cohortTutor = User::factory()->create(['cohort_id' => $cohort1->id]);
    $cohortTutor->assignRole('tutor');

    $otherTutor = User::factory()->create(['cohort_id' => $cohort2->id]);
    $otherTutor->assignRole('tutor');

    $courseWithCohortTutor = Course::factory()->for($cohortTutor, 'instructor')->create();
    $courseWithOtherTutor = Course::factory()->for($otherTutor, 'instructor')->create();

    Enrollment::factory()->for($user)->for($courseWithCohortTutor)->create();
    Enrollment::factory()->for($user)->for($courseWithOtherTutor)->create();

    $response = $this->actingAs($user)->get(route('tutors', ['cohort_id' => $cohort1->id]));

    $response->assertInertia(fn (Assert $page) => $page
        ->has('tutors.data', 1)
        ->where('tutors.data.0.id', $cohortTutor->id)
    );
});

it('includes course instructors even if they lack tutor role', function () {
    $user = User::factory()->create();

    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');

    $nonTutorInstructor = User::factory()->create();

    $tutorCourse = Course::factory()->for($tutor, 'instructor')->create();
    $nonTutorCourse = Course::factory()->for($nonTutorInstructor, 'instructor')->create();

    Enrollment::factory()->for($user)->for($tutorCourse)->create();
    Enrollment::factory()->for($user)->for($nonTutorCourse)->create();

    $response = $this->actingAs($user)->get(route('tutors'));

    $response->assertInertia(fn (Assert $page) => $page
        ->has('tutors.data', 2)
        ->where('tutors.data', function ($data) use ($tutor, $nonTutorInstructor) {
            $ids = collect($data)->pluck('id')->sort()->values()->all();
            $expected = collect([$tutor->id, $nonTutorInstructor->id])->sort()->values()->all();

            return $ids === $expected;
        })
    );
});
