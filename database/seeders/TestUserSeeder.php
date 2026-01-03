<?php

namespace Database\Seeders;

use App\Models\Achievement;
use App\Models\Activity;
use App\Models\Course;
use App\Models\DailyTask;
use App\Models\Enrollment;
use App\Models\TutorMessage;
use App\Models\User;
use Illuminate\Database\Seeder;

class TestUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $achievements = Achievement::all();
        $courses = Course::all();
        $instructors = User::all();

        // Create admin user
        $testUser = User::factory()->withoutTwoFactor()->create([
            'name' => 'Super Admin',
            'email' => 'superadmin@gmail.com',
            'password' => 'password',
            'total_xp' => 10000,
            'level' => 20,
            'points_balance' => 5000,
            'current_streak' => 30,
            'longest_streak' => 100,
            'last_activity_date' => today(),
        ]);

        $testUser->assignRole('admin');

        // Award some achievements to test user
        $testUser->achievements()->attach(
            $achievements->random(3)->pluck('id'),
            ['earned_at' => now()]
        );

        // Create enrollments for test user
        $enrolledCourses = $courses->random(4);
        $enrolledCourses->each(function ($course) use ($testUser) {
            Enrollment::factory()->create([
                'user_id' => $testUser->id,
                'course_id' => $course->id,
                'progress_percentage' => fake()->numberBetween(10, 85),
                'status' => 'active',
            ]);
        });

        // Create daily tasks for test user (today)
        DailyTask::factory(5)->create([
            'user_id' => $testUser->id,
            'due_date' => today(),
        ]);

        // Create some completed tasks this week to drive hoursThisWeek()
        DailyTask::factory(3)->create([
            'user_id' => $testUser->id,
            'is_completed' => true,
            'completed_at' => now()->subDays(fake()->numberBetween(0, 6)),
            'due_date' => now()->subDays(fake()->numberBetween(0, 6)),
        ]);

        // Create tutor messages for test user
        TutorMessage::factory(8)->create([
            'user_id' => $testUser->id,
            'tutor_id' => $instructors->random()->id,
        ]);

        // Create mixed activities for test user
        Activity::factory(15)->create([
            'user_id' => $testUser->id,
        ]);

        // Ensure some lesson_completed activities this week to drive xpThisWeek()
        for ($i = 0; $i < 5; $i++) {
            Activity::factory()->create([
                'user_id' => $testUser->id,
                'type' => 'lesson_completed',
                'created_at' => now()->subDays($i),
            ]);
        }
    }
}
