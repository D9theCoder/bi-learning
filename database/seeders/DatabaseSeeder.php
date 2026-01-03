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
            AchievementSeeder::class,
            RewardSeeder::class,
            PowerupSeeder::class,
            InstructorSeeder::class,
            CourseSeeder::class,
            FixedScenarioSeeder::class,
            CourseContentSeeder::class,
            TestUserSeeder::class,
            StudentSeeder::class,
        ]);
    }
}
