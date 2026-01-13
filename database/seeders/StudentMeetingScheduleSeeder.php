<?php

namespace Database\Seeders;

use App\Models\StudentMeetingSchedule;
use Illuminate\Database\Seeder;

class StudentMeetingScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        StudentMeetingSchedule::factory()->count(10)->create();
    }
}
