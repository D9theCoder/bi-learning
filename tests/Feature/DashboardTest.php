<?php

use App\Models\Achievement;
use App\Models\Cohort;
use App\Models\Course;
use App\Models\CourseContent;
use App\Models\CourseContentCompletion;
use App\Models\DailyTask;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    foreach (['admin', 'tutor', 'student'] as $role) {
        Role::firstOrCreate(['name' => $role]);
    }
});

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $user->assignRole('student');

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('stats')
            ->has('today_tasks')
            ->has('enrolled_courses')
            ->has('weekly_activity_data')
        );
});

test('tutors can visit the dashboard', function () {
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');

    $this->actingAs($tutor)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
        );
});

test('dashboard displays user statistics', function () {
    $cohort = Cohort::factory()->create();
    $user = User::factory()->create([
        'cohort_id' => $cohort->id,
        'total_xp' => 2500,
        'level' => 8,
        'points_balance' => 850,
        'current_streak' => 5,
    ]);
    $user->assignRole('student');

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('stats.streak', 5)
            ->where('stats.level', 8)
            ->where('stats.points_balance', 850)
        );
});

test('dashboard shows enrolled courses', function () {
    $user = User::factory()->create();
    $user->assignRole('student');
    $course = Course::factory()->create();
    $enrollment = Enrollment::factory()->create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => 'active',
        'progress_percentage' => 45,
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('enrolled_courses', 1)
            ->where('enrolled_courses.0.progress_percentage', 45)
        );
});

test('dashboard displays today tasks', function () {
    $user = User::factory()->create();
    $user->assignRole('student');
    DailyTask::factory()->create([
        'user_id' => $user->id,
        'due_date' => today(),
        'is_completed' => false,
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('today_tasks', 1)
        );
});

test('dashboard shows cohort leaderboard when user is in cohort', function () {
    $cohort = Cohort::factory()->create();
    $user = User::factory()->create([
        'cohort_id' => $cohort->id,
        'total_xp' => 1000,
    ]);
    $user->assignRole('student');

    // Create other users in cohort
    User::factory(5)->create([
        'cohort_id' => $cohort->id,
        'total_xp' => fake()->numberBetween(500, 2000),
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('cohort_leaderboard')
            ->has('current_user_rank')
        );
});

test('dashboard shows recent achievements', function () {
    $user = User::factory()->create();
    $user->assignRole('student');
    $achievement = Achievement::factory()->create();
    $user->achievements()->attach($achievement->id, ['earned_at' => now()]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('recent_achievements', 1)
        );
});

test('tutor dashboard includes tutor data and chart metrics', function () {
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');

    $student = User::factory()->create();
    $student->assignRole('student');

    $course = Course::factory()->create([
        'instructor_id' => $tutor->id,
    ]);

    $lesson = Lesson::factory()->create([
        'course_id' => $course->id,
        'order' => 1,
    ]);

    $attendanceContent = CourseContent::factory()->create([
        'lesson_id' => $lesson->id,
        'type' => 'attendance',
        'due_date' => now()->addDays(2),
        'order' => 1,
    ]);

    $assignmentContent = CourseContent::factory()->create([
        'lesson_id' => $lesson->id,
        'type' => 'quiz',
        'due_date' => now()->addDays(3),
        'order' => 2,
    ]);

    Enrollment::factory()->create([
        'user_id' => $student->id,
        'course_id' => $course->id,
        'status' => 'active',
        'progress_percentage' => 60,
    ]);

    CourseContentCompletion::factory()->create([
        'course_content_id' => $attendanceContent->id,
        'user_id' => $student->id,
    ]);

    CourseContentCompletion::factory()->create([
        'course_content_id' => $assignmentContent->id,
        'user_id' => $student->id,
    ]);

    $this->actingAs($tutor)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('tutor_dashboard')
            ->where('tutor_dashboard.summary.course_count', 1)
            ->has('tutor_dashboard.chart', 1)
            ->has('tutor_dashboard.calendar', 2)
            ->has('tutor_dashboard.courses', 1)
        );
});
