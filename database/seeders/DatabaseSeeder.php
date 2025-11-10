<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            CohortSeeder::class,
            AchievementSeeder::class,
            RewardSeeder::class,
            TutorsSeeder::class,
            CourseSeeder::class,
            TestUserSeeder::class,
            StudentSeeder::class,
        ]);
    }
}
