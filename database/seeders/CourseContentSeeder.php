<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CourseContent;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourseContentSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure we have an instructor
        $instructor = User::factory()->create([
            'name' => 'Dr. Devi Fitrianah',
            'email' => 'devi@example.com',
            'avatar' => 'https://ui-avatars.com/api/?name=Devi+Fitrianah&background=random',
        ]);

        // Create the IT Research Methodology Course
        $course = Course::create([
            'title' => 'IT Research Methodology',
            'description' => 'Learn the fundamentals of research methodology in Information Technology. This course covers thesis guidelines, research goals, and appropriate methodologies.',
            'thumbnail' => 'https://placehold.co/600x400/png?text=IT+Research',
            'instructor_id' => $instructor->id,
            'duration_minutes' => 240, // 4 hours
            'difficulty' => 'intermediate',
            'category' => 'Research',
            'is_published' => true,
        ]);

        // Session 3 Data (Matching the screenshot)
        $session3 = Lesson::create([
            'course_id' => $course->id,
            'title' => 'Thesis Guidelines',
            'description' => '<p><strong>Learning Outcome</strong><br>(C3) Application : Apply appropriate research methodology to achieve research goals</p><p><strong>Sub Topic</strong><ul><li>List of Topics</li><li>Progress Evaluations</li><li>Stream of Thesis</li><li>Thesis Defense</li><li>Thesis Outline</li><li>Thesis Proposal</li></ul></p>',
            'duration_minutes' => 180,
            'order' => 3,
        ]);

        // Contents for Session 3
        CourseContent::create([
            'lesson_id' => $session3->id,
            'title' => 'Wifi Attendance',
            'type' => 'attendance',
            'duration_minutes' => 180, // 3h
            'is_required' => true,
            'order' => 1,
        ]);

        CourseContent::create([
            'lesson_id' => $session3->id,
            'title' => 'PPT - Thesis Guidelines',
            'type' => 'file',
            'file_path' => '/materials/thesis-guidelines.pdf',
            'duration_minutes' => 10,
            'order' => 2,
        ]);

        CourseContent::create([
            'lesson_id' => $session3->id,
            'title' => 'SM3-S3-R0',
            'type' => 'file',
            'duration_minutes' => 10,
            'order' => 3,
        ]);

        CourseContent::create([
            'lesson_id' => $session3->id,
            'title' => 'SM3-S3-R0_2',
            'type' => 'link',
            'url' => 'https://example.com/resource',
            'duration_minutes' => 10,
            'order' => 4,
        ]);

        CourseContent::create([
            'lesson_id' => $session3->id,
            'title' => 'LN3-Thesis Guidelines-R0',
            'type' => 'file',
            'duration_minutes' => 10,
            'order' => 5,
        ]);


        // Create other sessions (1, 2, 4, 5...) just placeholders
        for ($i = 1; $i <= 10; $i++) {
            if ($i === 3) continue;

            $lesson = Lesson::create([
                'course_id' => $course->id,
                'title' => "Session $i: Topic Placeholder",
                'description' => "Content for session $i.",
                'duration_minutes' => 90,
                'order' => $i,
            ]);

            CourseContent::create([
                'lesson_id' => $lesson->id,
                'title' => "Session $i Materials",
                'type' => 'file',
                'duration_minutes' => 15,
                'order' => 1,
            ]);
        }
    }
}
