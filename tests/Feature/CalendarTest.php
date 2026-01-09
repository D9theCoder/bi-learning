<?php

use App\Models\Assessment;
use App\Models\Course;
use App\Models\DailyTask;
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
    $response = $this->get(route('calendar'));
    $response->assertRedirect(route('login'));
});

it('renders calendar index page', function () {
    $user = User::factory()->create();
    $user->assignRole('student');
    DailyTask::factory()->for($user)->create(['due_date' => today()]);

    $response = $this->actingAs($user)->get(route('calendar'));

    $response->assertSuccessful();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('calendar/index')
        ->has('tasksByDate')
        ->has('stats')
    );
});

it('groups tasks by date', function () {
    $user = User::factory()->create();
    $user->assignRole('student');
    DailyTask::factory()->for($user)->count(3)->create(['due_date' => today()]);
    DailyTask::factory()->for($user)->count(2)->create(['due_date' => today()->addDay()]);

    $response = $this->actingAs($user)->get(route('calendar'));

    $response->assertInertia(fn (Assert $page) => $page
        ->has('tasksByDate.'.today()->format('Y-m-d'), 3)
        ->has('tasksByDate.'.today()->addDay()->format('Y-m-d'), 2)
    );
});

it('includes course metadata for meetings and assessments', function () {
    $user = User::factory()->create();
    $user->assignRole('student');

    $course = Course::factory()->create();

    Enrollment::factory()->create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => 'active',
    ]);

    $meetingDate = now()->addDay();
    $assessmentDate = now()->addDays(2);

    $lesson = Lesson::factory()->create([
        'course_id' => $course->id,
        'meeting_start_time' => $meetingDate,
        'meeting_url' => 'https://example.com/meet',
    ]);

    Assessment::factory()->published()->create([
        'course_id' => $course->id,
        'lesson_id' => $lesson->id,
        'due_date' => $assessmentDate,
    ]);

    $response = $this->actingAs($user)->get(route('calendar'));

    $response->assertInertia(fn (Assert $page) => $page
        ->where('tasksByDate.'.$meetingDate->format('Y-m-d').'.0.course_id', $course->id)
        ->where('tasksByDate.'.$meetingDate->format('Y-m-d').'.0.lesson_id', $lesson->id)
        ->where('tasksByDate.'.$meetingDate->format('Y-m-d').'.0.meeting_url', $lesson->meeting_url)
        ->where('tasksByDate.'.$assessmentDate->format('Y-m-d').'.0.course_id', $course->id)
        ->where('tasksByDate.'.$assessmentDate->format('Y-m-d').'.0.lesson_id', $lesson->id)
    );
});

it('toggles task completion', function () {
    $user = User::factory()->create();
    $user->assignRole('student');
    $task = DailyTask::factory()->for($user)->create(['is_completed' => false]);

    $response = $this->actingAs($user)
        ->patch(route('tasks.toggle', $task), [
            '_token' => csrf_token(),
            'completed' => true,
        ]);

    $response->assertRedirect();
    expect($task->fresh()->is_completed)->toBeTrue();
});

it('prevents unauthorized task toggle', function () {
    $user1 = User::factory()->create();
    $user1->assignRole('student');
    $user2 = User::factory()->create();
    $user2->assignRole('student');
    $task = DailyTask::factory()->for($user1)->create();

    $response = $this->actingAs($user2)
        ->patch(route('tasks.toggle', $task), [
            '_token' => csrf_token(),
            'completed' => true,
        ]);

    $response->assertForbidden();
});

it('allows tutors to view calendar', function () {
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');

    $response = $this->actingAs($tutor)->get(route('calendar'));

    $response->assertSuccessful();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('calendar/index')
    );
});
