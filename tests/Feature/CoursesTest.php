<?php

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('requires authentication', function () {
    $response = $this->get(route('courses'));
    $response->assertRedirect(route('login'));
});

it('renders courses index page', function () {
    $user = User::factory()->create();
    Course::factory()->count(5)->create();

    $response = $this->actingAs($user)->get(route('courses'));

    $response->assertSuccessful();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('courses/index')
        ->has('courses.data', 5)
    );
});

it('filters courses by difficulty', function () {
    $user = User::factory()->create();
    Course::factory()->create(['difficulty' => 'beginner']);
    Course::factory()->create(['difficulty' => 'advanced']);

    $response = $this->actingAs($user)->get(route('courses', ['difficulty' => 'beginner']));

    $response->assertInertia(fn (Assert $page) => $page
        ->has('courses.data', 1)
    );
});

it('shows user progress for enrolled courses', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create();
    Enrollment::factory()->for($user)->for($course)->create(['progress_percentage' => 50]);

    $response = $this->actingAs($user)->get(route('courses'));

    $response->assertInertia(fn (Assert $page) => $page
        ->where('courses.data.0.user_progress.progress_percentage', 50.0)
    );
});

it('allows enrollment in a course', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create();

    $response = $this->actingAs($user)
        ->post(route('courses.enroll', $course));

    $response->assertRedirect();
    expect(Enrollment::where('user_id', $user->id)->where('course_id', $course->id)->exists())->toBeTrue();
});

it('prevents duplicate enrollment', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create();
    Enrollment::factory()->for($user)->for($course)->create();

    $response = $this->actingAs($user)
        ->post(route('courses.enroll', $course));

    expect(Enrollment::where('user_id', $user->id)->where('course_id', $course->id)->count())->toBe(1);
});
