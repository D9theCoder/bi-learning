<?php

use App\Models\Course;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;

use function Pest\Laravel\get;
use function Pest\Laravel\post;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

it('allows admins to view management and create courses', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin);

    get('/courses/manage')->assertSuccessful();

    $response = post('/courses/manage', [
        '_token' => csrf_token(),
        'title' => 'Admin Course',
        'description' => 'Admin created course',
        'difficulty' => 'beginner',
        'category' => 'Testing',
        'is_published' => true,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('courses', [
        'title' => 'Admin Course',
        'instructor_id' => $admin->id,
    ]);
});

it('restricts students from course management', function () {
    $student = User::factory()->create();
    $student->assignRole('student');

    $this->actingAs($student);

    get('/courses/manage')->assertForbidden();
    post('/courses/manage', [
        '_token' => csrf_token(),
        'title' => 'Should not work',
        'description' => 'Blocked',
    ])->assertForbidden();
});

it('allows tutors to manage only their courses', function () {
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');

    $otherTutor = User::factory()->create();
    $otherTutor->assignRole('tutor');

    $ownCourse = Course::factory()->create(['instructor_id' => $tutor->id]);
    $otherCourse = Course::factory()->create(['instructor_id' => $otherTutor->id]);

    $this->actingAs($tutor);

    get('/courses/manage')->assertSuccessful();

    get("/courses/manage/{$otherCourse->id}/edit")->assertForbidden();

    post("/courses/manage/{$ownCourse->id}", [
        '_method' => 'put',
        '_token' => csrf_token(),
        'title' => 'Updated Title',
        'description' => $ownCourse->description,
        'difficulty' => 'intermediate',
        'is_published' => true,
    ])->assertRedirect();

    $this->assertDatabaseHas('courses', [
        'id' => $ownCourse->id,
        'title' => 'Updated Title',
        'instructor_id' => $tutor->id,
    ]);
});
