<?php

use App\Models\DailyTask;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
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

it('can toggle a task to completed', function () {
    $user = User::factory()->create();
    $user->assignRole('student');
    $task = DailyTask::factory()->for($user)->create([
        'is_completed' => false,
        'xp_reward' => 10,
    ]);

    $response = $this->actingAs($user)
        ->patch(route('tasks.toggle', $task), [
            'completed' => true,
        ]);

    $response->assertRedirect();
    expect($task->fresh()->is_completed)->toBeTrue();
    expect($task->fresh()->completed_at)->not->toBeNull();
});

it('can toggle a task to incomplete', function () {
    $user = User::factory()->create();
    $user->assignRole('student');
    $task = DailyTask::factory()->for($user)->create([
        'is_completed' => true,
        'completed_at' => now(),
    ]);

    $response = $this->actingAs($user)
        ->patch(route('tasks.toggle', $task), [
            'completed' => false,
        ]);

    $response->assertRedirect();
    expect($task->fresh()->is_completed)->toBeFalse();
    expect($task->fresh()->completed_at)->toBeNull();
});

it('prevents unauthorized users from toggling another users task', function () {
    $user1 = User::factory()->create();
    $user1->assignRole('student');
    $user2 = User::factory()->create();
    $user2->assignRole('student');
    $task = DailyTask::factory()->for($user1)->create(['is_completed' => false]);

    $response = $this->actingAs($user2)
        ->patch(route('tasks.toggle', $task), [
            'completed' => true,
        ]);

    $response->assertForbidden();
    expect($task->fresh()->is_completed)->toBeFalse();
});

it('requires authentication to toggle task', function () {
    $user = User::factory()->create();
    $user->assignRole('student');
    $task = DailyTask::factory()->for($user)->create(['is_completed' => false]);

    $response = $this->patch(route('tasks.toggle', $task), [
        'completed' => true,
    ]);

    $response->assertRedirect(route('login'));
});

it('requires completed field in request', function () {
    $user = User::factory()->create();
    $user->assignRole('student');
    $task = DailyTask::factory()->for($user)->create(['is_completed' => false]);

    $response = $this->actingAs($user)
        ->patch(route('tasks.toggle', $task), []);

    $response->assertSessionHasErrors('completed');
});

it('awards xp when completing a task', function () {
    $user = User::factory()->create(['total_xp' => 100]);
    $user->assignRole('student');
    $task = DailyTask::factory()->for($user)->create([
        'is_completed' => false,
        'xp_reward' => 25,
    ]);

    $this->actingAs($user)
        ->patch(route('tasks.toggle', $task), [
            'completed' => true,
        ]);

    $user->refresh();
    expect($user->total_xp)->toBe(125);
});

it('does not award xp when marking task incomplete', function () {
    $user = User::factory()->create(['total_xp' => 100]);
    $user->assignRole('student');
    $task = DailyTask::factory()->for($user)->create([
        'is_completed' => true,
        'completed_at' => now(),
        'xp_reward' => 25,
    ]);

    $this->actingAs($user)
        ->patch(route('tasks.toggle', $task), [
            'completed' => false,
        ]);

    $user->refresh();
    expect($user->total_xp)->toBe(100);
});

it('does not double award xp for already completed task', function () {
    $user = User::factory()->create(['total_xp' => 100]);
    $user->assignRole('student');
    $task = DailyTask::factory()->for($user)->create([
        'is_completed' => true,
        'completed_at' => now(),
        'xp_reward' => 25,
    ]);

    $this->actingAs($user)
        ->patch(route('tasks.toggle', $task), [
            'completed' => true,
        ]);

    $user->refresh();
    expect($user->total_xp)->toBe(100);
});

it('creates activity when completing task', function () {
    $user = User::factory()->create();
    $user->assignRole('student');
    $task = DailyTask::factory()->for($user)->create([
        'is_completed' => false,
        'xp_reward' => 15,
    ]);

    $this->actingAs($user)
        ->patch(route('tasks.toggle', $task), [
            'completed' => true,
        ]);

    $this->assertDatabaseHas('activities', [
        'user_id' => $user->id,
        'type' => 'task_completed',
        'xp_earned' => 15,
    ]);
});

it('allows tutors to toggle their own tasks', function () {
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');
    $task = DailyTask::factory()->for($tutor)->create(['is_completed' => false]);

    $response = $this->actingAs($tutor)
        ->patch(route('tasks.toggle', $task), [
            'completed' => true,
        ]);

    $response->assertRedirect();
    expect($task->fresh()->is_completed)->toBeTrue();
});

it('allows admins to toggle their own tasks', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $task = DailyTask::factory()->for($admin)->create(['is_completed' => false]);

    $response = $this->actingAs($admin)
        ->patch(route('tasks.toggle', $task), [
            'completed' => true,
        ]);

    $response->assertRedirect();
    expect($task->fresh()->is_completed)->toBeTrue();
});
