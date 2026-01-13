<?php

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

it('admin sees all students', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    User::factory()->count(5)->create()->each(fn ($u) => $u->assignRole('student'));

    $response = $this->actingAs($admin)->get(route('students'));

    $response->assertSuccessful();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('students/index')
        ->has('students.data', 5)
    );
});

it('admin sees student gamification stats in payload', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $student = User::factory()->create([
        'name' => 'Stat Student',
        'level' => 7,
        'points_balance' => 240,
        'total_xp' => 1800,
    ]);
    $student->assignRole('student');

    $response = $this->actingAs($admin)->get(route('students', [
        'search' => 'Stat Student',
    ]));

    $response->assertSuccessful();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('students/index')
        ->has('students.data', 1)
        ->where('students.data.0.id', $student->id)
        ->where('students.data.0.level', 7)
        ->where('students.data.0.points_balance', 240)
        ->where('students.data.0.total_xp', 1800)
        ->where('students.data.0.enrollments_count', 0)
        ->where('students.data.0.active_enrollments_count', 0)
    );
});

it('tutor with no enrollments should see NO students', function () {
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');

    // Create some students that exist in the system
    User::factory()->count(5)->create()->each(fn ($u) => $u->assignRole('student'));

    $response = $this->actingAs($tutor)->get(route('students'));

    $response->assertSuccessful();
    // VULNERABILITY CHECK: Currently this will likely show 5 students
    // We expect 0 students for a tutor with no courses/enrollments
    $response->assertInertia(fn (Assert $page) => $page
        ->component('students/index')
        ->has('students.data', 0)
    );
});

it('tutor sees only enrolled students', function () {
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');
    $course = Course::factory()->for($tutor, 'instructor')->create();

    $myStudent = User::factory()->create();
    $myStudent->assignRole('student');
    Enrollment::factory()->for($myStudent)->for($course)->create();

    $otherStudent = User::factory()->create();
    $otherStudent->assignRole('student');

    $response = $this->actingAs($tutor)->get(route('students'));

    $response->assertSuccessful();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('students/index')
        ->has('students.data', 1)
        ->where('students.data.0.id', $myStudent->id)
    );
});
