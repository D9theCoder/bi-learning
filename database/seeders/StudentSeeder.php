<?php

namespace Database\Seeders;

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

        // Create some random students for leaderboard
        User::factory(20)->withoutTwoFactor()->create()->each(function ($user) use ($cohorts) {
            $user->update([
                'cohort_id' => $cohorts->random()->id,
                'total_xp' => fake()->numberBetween(500, 8000),
                'level' => fake()->numberBetween(1, 15),
                'points_balance' => fake()->numberBetween(0, 3000),
            ]);
            
            $user->assignRole('student');
        });
    }
}
