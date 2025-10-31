<?php

use App\Models\Cohort;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('requires authentication', function () {
    $response = $this->get(route('tutors'));
    $response->assertRedirect(route('login'));
});

it('renders tutors index page', function () {
    $user = User::factory()->create();
    User::factory()->count(5)->create(['role' => 'tutor']);

    $response = $this->actingAs($user)->get(route('tutors'));

    $response->assertSuccessful();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('tutors/index')
        ->has('tutors.data', 5)
    );
});

it('filters tutors by cohort', function () {
    $user = User::factory()->create();
    $cohort1 = Cohort::factory()->create();
    $cohort2 = Cohort::factory()->create();

    User::factory()->create(['role' => 'tutor', 'cohort_id' => $cohort1->id]);
    User::factory()->create(['role' => 'tutor', 'cohort_id' => $cohort2->id]);

    $response = $this->actingAs($user)->get(route('tutors', ['cohort_id' => $cohort1->id]));

    $response->assertInertia(fn (Assert $page) => $page
        ->has('tutors.data', 1)
    );
});

it('only shows users with tutor role', function () {
    $user = User::factory()->create();
    User::factory()->count(3)->create(['role' => 'tutor']);
    User::factory()->count(5)->create(['role' => 'student']);

    $response = $this->actingAs($user)->get(route('tutors'));

    $response->assertInertia(fn (Assert $page) => $page
        ->has('tutors.data', 3)
    );
});
