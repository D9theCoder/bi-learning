<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $instructors = User::all();

        $courses = Course::factory(15)->create([
            'instructor_id' => $instructors->random()->id,
        ]);

        // Create lessons for each course
        $courses->each(function ($course) {
            Lesson::factory(fake()->numberBetween(5, 15))->create([
                'course_id' => $course->id,
            ])->each(function ($lesson, $index) {
                $lesson->update(['order' => $index + 1]);
            });
        });
    }
}
