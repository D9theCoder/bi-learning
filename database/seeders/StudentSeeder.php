<?php

namespace Database\Seeders;

use App\Models\Achievement;
use App\Models\DailyTask;
use App\Models\Cohort;
use App\Models\User;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cohorts = Cohort::all();
        $achievements = Achievement::all();

        // Create some random students for leaderboard
        User::factory(20)->withoutTwoFactor()->create()->each(function ($user) use ($cohorts, $achievements) {
            $user->update([
                'cohort_id' => $cohorts->random()->id,
                'total_xp' => fake()->numberBetween(500, 8000),
                'level' => fake()->numberBetween(1, 15),
                'points_balance' => fake()->numberBetween(0, 3000),
            ]);
            
            $user->assignRole('student');

            // Seed a couple of daily quests for the dashboard (today-focused)
            DailyTask::factory(2)->create([
                'user_id' => $user->id,
                'due_date' => today(),
                'is_completed' => false,
                'xp_reward' => fake()->numberBetween(10, 75),
            ]);

            // Add a completed task to provide progress context
            DailyTask::factory()->create([
                'user_id' => $user->id,
                'due_date' => today(),
                'is_completed' => true,
                'completed_at' => now()->subHours(fake()->numberBetween(1, 12)),
                'xp_reward' => fake()->numberBetween(10, 75),
            ]);

            // Attach a recent achievement if available to populate the dashboard
            if ($achievements->isNotEmpty()) {
                $user->achievements()->attach(
                    $achievements->random(min(2, $achievements->count()))->pluck('id'),
                    ['earned_at' => now()->subDays(fake()->numberBetween(0, 7))]
                );
            }
        });
    }
}
