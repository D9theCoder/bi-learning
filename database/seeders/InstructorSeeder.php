<?php

namespace Database\Seeders;

use App\Models\Cohort;
use App\Models\User;
use Illuminate\Database\Seeder;

class InstructorSeeder extends Seeder
{
    /** 
     * Run the database seeds.
     */
    public function run(): void
    {
        $cohorts = Cohort::all();

        User::factory(10)->withoutTwoFactor()->create()->each(function ($user) use ($cohorts) {
            $user->update([
                'cohort_id' => $cohorts->random()->id,
                'total_xp' => fake()->numberBetween(1000, 50000),
                'level' => fake()->numberBetween(5, 30),
                'points_balance' => fake()->numberBetween(0, 5000),
                'current_streak' => fake()->numberBetween(0, 30),
                'longest_streak' => fake()->numberBetween(0, 100),
                'last_activity_date' => fake()->dateTimeBetween('-7 days', 'now'),
            ]);

            $user->assignRole('tutor');
        });
    }
}
