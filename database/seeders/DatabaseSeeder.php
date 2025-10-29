<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create cohorts
        $cohorts = \App\Models\Cohort::factory(5)->create();

        // Create instructors
        $instructors = User::factory(10)->create()->each(function ($user) use ($cohorts) {
            $user->update([
                'cohort_id' => $cohorts->random()->id,
                'total_xp' => fake()->numberBetween(1000, 50000),
                'level' => fake()->numberBetween(5, 30),
                'points_balance' => fake()->numberBetween(0, 5000),
                'current_streak' => fake()->numberBetween(0, 30),
                'longest_streak' => fake()->numberBetween(0, 100),
                'last_activity_date' => fake()->dateTimeBetween('-7 days', 'now'),
            ]);
        });

        // Create main test user (without 2FA for easier testing)
        $testUser = User::factory()->withoutTwoFactor()->create([
            'name' => 'Test Student',
            'email' => 'student@example.com',
            'cohort_id' => $cohorts->first()->id,
            'total_xp' => 2500,
            'level' => 8,
            'points_balance' => 850,
            'current_streak' => 5,
            'longest_streak' => 12,
            'last_activity_date' => today(),
        ]);

        // Create achievements
        $achievements = \App\Models\Achievement::factory(12)->create();

        // Award some achievements to test user
        $testUser->achievements()->attach(
            $achievements->random(3)->pluck('id'),
            ['earned_at' => now()]
        );

        // Create courses
        $courses = \App\Models\Course::factory(15)->create([
            'instructor_id' => $instructors->random()->id,
        ]);

        // Create lessons for each course
        $courses->each(function ($course) {
            \App\Models\Lesson::factory(fake()->numberBetween(5, 15))->create([
                'course_id' => $course->id,
            ])->each(function ($lesson, $index) {
                $lesson->update(['order' => $index + 1]);
            });
        });

        // Create enrollments for test user
        $enrolledCourses = $courses->random(4);
        $enrolledCourses->each(function ($course) use ($testUser) {
            \App\Models\Enrollment::factory()->create([
                'user_id' => $testUser->id,
                'course_id' => $course->id,
                'progress_percentage' => fake()->numberBetween(10, 85),
                'status' => 'active',
            ]);
        });

        // Create daily tasks for test user (today)
        \App\Models\DailyTask::factory(5)->create([
            'user_id' => $testUser->id,
            'due_date' => today(),
        ]);

        // Create some completed tasks this week to drive hoursThisWeek()
        \App\Models\DailyTask::factory(3)->create([
            'user_id' => $testUser->id,
            'is_completed' => true,
            'completed_at' => now()->subDays(fake()->numberBetween(0, 6)),
            'due_date' => now()->subDays(fake()->numberBetween(0, 6)),
        ]);

        // Create tutor messages for test user
        \App\Models\TutorMessage::factory(8)->create([
            'user_id' => $testUser->id,
            'tutor_id' => $instructors->random()->id,
        ]);

        // Create rewards
        $rewards = \App\Models\Reward::factory(12)->create();

        // Create mixed activities for test user
        \App\Models\Activity::factory(15)->create([
            'user_id' => $testUser->id,
        ]);

        // Ensure some lesson_completed activities this week to drive xpThisWeek()
        for ($i = 0; $i < 5; $i++) {
            \App\Models\Activity::factory()->create([
                'user_id' => $testUser->id,
                'type' => 'lesson_completed',
                'created_at' => now()->subDays($i),
            ]);
        }

        // Create some random students for leaderboard
        User::factory(20)->create()->each(function ($user) use ($cohorts) {
            $user->update([
                'cohort_id' => $cohorts->random()->id,
                'total_xp' => fake()->numberBetween(500, 8000),
                'level' => fake()->numberBetween(1, 15),
                'points_balance' => fake()->numberBetween(0, 3000),
            ]);
        });
    }
}
