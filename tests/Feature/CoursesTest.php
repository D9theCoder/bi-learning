<?php

use App\Models\Attendance;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    $this->withoutMiddleware([
        ValidateCsrfToken::class,
        VerifyCsrfToken::class,
    ]);

    app(PermissionRegistrar::class)->forgetCachedPermissions();

    foreach (['admin', 'tutor', 'student'] as $role) {
        Role::firstOrCreate(['name' => $role]);
    }
});

it('requires authentication', function () {
    $response = $this->get(route('courses'));
    $response->assertRedirect(route('login'));
});

it('renders courses index page', function () {
    $user = User::factory()->create();
    $user->assignRole('student');
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
    $user->assignRole('student');
    Course::factory()->create(['difficulty' => 'beginner']);
    Course::factory()->create(['difficulty' => 'advanced']);

    $response = $this->actingAs($user)->get(route('courses', ['difficulty' => 'beginner']));

    $response->assertInertia(fn (Assert $page) => $page
        ->has('courses.data', 1)
    );
});

it('shows user progress for enrolled courses', function () {
    $user = User::factory()->create();
    $user->assignRole('student');
    $course = Course::factory()->create();
    Enrollment::factory()->for($user)->for($course)->create(['progress_percentage' => 50]);

    $response = $this->actingAs($user)->get(route('courses'));

    $response->assertInertia(fn (Assert $page) => $page
        ->where('courses.data.0.user_progress.progress_percentage', 50)
    );
});

it('allows enrollment in a course', function () {
    $user = User::factory()->create();
    $user->assignRole('student');
    $course = Course::factory()->create();

    $response = $this->actingAs($user)
        ->post(route('courses.enroll', $course));

    $response->assertRedirect();
    expect(Enrollment::where('user_id', $user->id)->where('course_id', $course->id)->exists())->toBeTrue();
});

it('prevents duplicate enrollment', function () {
    $user = User::factory()->create();
    $user->assignRole('student');
    $course = Course::factory()->create();
    Enrollment::factory()->for($user)->for($course)->create();

    $response = $this->actingAs($user)
        ->post(route('courses.enroll', $course));

    expect(Enrollment::where('user_id', $user->id)->where('course_id', $course->id)->count())->toBe(1);
});

it('hides other tutors courses from tutors', function () {
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');

    $ownCourse = Course::factory()->create(['instructor_id' => $tutor->id]);
    Course::factory()->create(); // other tutor course

    $response = $this->actingAs($tutor)->get(route('courses'));

    $response->assertSuccessful();
    $response->assertInertia(fn (Assert $page) => $page
        ->where('courses.data.0.id', $ownCourse->id)
        ->has('courses.data', 1)
    );
});

it('prevents tutors from viewing another tutor course detail', function () {
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');

    $otherCourse = Course::factory()->create(); // no instructor or another tutor

    $this->actingAs($tutor)
        ->get(route('courses.show', $otherCourse))
        ->assertForbidden();
});

it('allows tutors to view their own course detail', function () {
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');

    $ownCourse = Course::factory()->create(['instructor_id' => $tutor->id]);

    $this->actingAs($tutor)
        ->get(route('courses.show', $ownCourse))
        ->assertSuccessful();
});

it('prevents tutors from enrolling in courses', function () {
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');
    $course = Course::factory()->create();

    $this->actingAs($tutor)
        ->post(route('courses.enroll', $course))
        ->assertForbidden();
});

it('shows student attendance to the course tutor', function () {
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');

    $student = User::factory()->create();
    $student->assignRole('student');

    $course = Course::factory()->create(['instructor_id' => $tutor->id]);
    $lessons = Lesson::factory()->for($course)->count(2)->create();

    Enrollment::factory()->for($student)->for($course)->create(['status' => 'active']);

    $attendedLesson = $lessons->first();

    Attendance::create([
        'user_id' => $student->id,
        'lesson_id' => $attendedLesson->id,
        'attended_at' => now(),
    ]);

    $response = $this->actingAs($tutor)->get(route('courses.show', $course));

    $response->assertSuccessful();

    $response->assertInertia(fn (Assert $page) => $page
        ->where('isTutor', true)
        ->has('students', 1)
        ->where('students.0.id', $student->id)
        ->where('students.0.attendances.0.lesson_id', $attendedLesson->id)
    );
});
