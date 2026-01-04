<?php

namespace Database\Seeders;

use App\CourseCategory;
use App\Models\Course;
use App\Models\CourseContent;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourseContentSeeder extends Seeder
{
    /**
     * Seed a curated course with the same structure as the dummy courses UI.
     */
    public function run(): void
    {
        $instructor = User::role('tutor')->inRandomOrder()->first();

        if ($instructor === null) {
            $instructor = User::factory()->create([
                'name' => 'Dr. Devi Fitrianah',
                'email' => 'devi@example.com',
                'avatar' => 'https://ui-avatars.com/api/?name=Devi+Fitrianah&background=random',
            ]);

            $instructor->assignRole('tutor');
        }

        $courseDefinition = [
            'title' => 'Advanced Physics Research',
            'description' => 'Learn the fundamentals of physics research methodology, from defining topics to preparing for defense.',
            'thumbnail' => 'https://placehold.co/800x480/png?text=IT+Research',
            'duration_minutes' => 720,
            'difficulty' => 'intermediate',
            'category' => CourseCategory::Physics->value,
            'is_published' => true,
            'lessons' => [
                [
                    'title' => 'Session 1: Physics Research Foundations',
                    'description' => 'Overview of the physics research lifecycle, expectations, and milestone planning.',
                    'duration_minutes' => 90,
                    'contents' => [
                        ['title' => 'Wifi Attendance', 'type' => 'attendance', 'duration_minutes' => 10, 'is_required' => true],
                        ['title' => 'PPT - Research Foundations', 'type' => 'file', 'file_path' => '/materials/research-foundations.pdf', 'duration_minutes' => 25],
                        ['title' => 'Kick-off Video', 'type' => 'video', 'url' => 'https://www.youtube.com/watch?v=43w7rUHl8cE', 'duration_minutes' => 30],
                    ],
                ],
                [
                    'title' => 'Session 2: Literature Review Strategy',
                    'description' => 'Structuring research questions and building a reading tracker.',
                    'duration_minutes' => 90,
                    'contents' => [
                        ['title' => 'Attendance Check', 'type' => 'attendance', 'duration_minutes' => 5, 'is_required' => true],
                        ['title' => 'Journal Databases Walkthrough', 'type' => 'video', 'url' => 'https://www.youtube.com/watch?v=9l8w2oqImQA', 'duration_minutes' => 20],
                        ['title' => 'Reading Tracker Template', 'type' => 'file', 'file_path' => '/templates/reading-tracker.xlsx', 'duration_minutes' => 10],
                    ],
                ],
                [
                    'title' => 'Thesis Guidelines',
                    'description' => '<p><strong>Learning Outcome</strong><br>(C3) Application : Apply appropriate research methodology to achieve research goals</p><p><strong>Sub Topic</strong><ul><li>List of Topics</li><li>Progress Evaluations</li><li>Stream of Thesis</li><li>Thesis Defense</li><li>Thesis Outline</li><li>Thesis Proposal</li></ul></p>',
                    'duration_minutes' => 180,
                    'contents' => [
                        ['title' => 'Wifi Attendance', 'type' => 'attendance', 'duration_minutes' => 180, 'is_required' => true],
                        ['title' => 'PPT - Thesis Guidelines', 'type' => 'file', 'file_path' => '/materials/thesis-guidelines.pdf', 'duration_minutes' => 10],
                        ['title' => 'SM3-S3-R0', 'type' => 'file', 'duration_minutes' => 10],
                        ['title' => 'SM3-S3-R0_2', 'type' => 'link', 'url' => 'https://example.com/resource', 'duration_minutes' => 10],
                        ['title' => 'LN3-Thesis Guidelines-R0', 'type' => 'file', 'duration_minutes' => 10],
                    ],
                ],
                [
                    'title' => 'Session 4: Method Selection',
                    'description' => 'Match research questions to methods and define instruments.',
                    'duration_minutes' => 90,
                    'contents' => [
                        ['title' => 'Research Onion Reading', 'type' => 'file', 'file_path' => '/materials/research-onion.pdf', 'duration_minutes' => 20],
                        ['title' => 'Instrument Draft', 'type' => 'file', 'file_path' => '/templates/instrument-draft.docx', 'duration_minutes' => 25],
                        ['title' => 'Method Match Quiz', 'type' => 'assessment', 'assessment_type' => 'quiz', 'duration_minutes' => 15, 'max_score' => 100, 'allow_powerups' => true],
                    ],
                ],
                [
                    'title' => 'Session 5: Data Collection & Ethics',
                    'description' => 'Plan data collection schedule, ethics, and risk mitigation.',
                    'duration_minutes' => 120,
                    'contents' => [
                        ['title' => 'Attendance', 'type' => 'attendance', 'duration_minutes' => 5, 'is_required' => true],
                        ['title' => 'Consent Form Template', 'type' => 'file', 'file_path' => '/templates/consent-form.pdf', 'duration_minutes' => 10],
                        ['title' => 'Field Guide', 'type' => 'file', 'file_path' => '/materials/field-guide.pdf', 'duration_minutes' => 15],
                        ['title' => 'Pilot Dataset Upload', 'type' => 'link', 'url' => 'https://example.com/pilot-upload', 'duration_minutes' => 10],
                    ],
                ],
                [
                    'title' => 'Session 6: Final Examination',
                    'description' => 'Comprehensive final exam covering all course material.',
                    'duration_minutes' => 120,
                    'contents' => [
                        ['title' => 'Final Exam', 'type' => 'assessment', 'assessment_type' => 'final_exam', 'duration_minutes' => 120, 'max_score' => 100, 'allow_powerups' => false, 'is_required' => true],
                    ],
                ],
            ],
        ];

        $course = Course::updateOrCreate(
            ['title' => $courseDefinition['title']],
            [
                'description' => $courseDefinition['description'],
                'thumbnail' => $courseDefinition['thumbnail'],
                'instructor_id' => $instructor->id,
                'duration_minutes' => $courseDefinition['duration_minutes'],
                'difficulty' => $courseDefinition['difficulty'],
                'category' => $courseDefinition['category'],
                'is_published' => $courseDefinition['is_published'],
            ],
        );

        $course->lessons()->each(static function (Lesson $lesson): void {
            $lesson->contents()->delete();
        });

        $course->lessons()->delete();

        foreach ($courseDefinition['lessons'] as $lessonIndex => $lessonData) {
            $lesson = Lesson::create([
                'course_id' => $course->id,
                'title' => $lessonData['title'],
                'description' => $lessonData['description'],
                'duration_minutes' => $lessonData['duration_minutes'],
                'order' => $lessonIndex + 1,
            ]);

            foreach ($lessonData['contents'] as $contentIndex => $contentData) {
                CourseContent::create([
                    'lesson_id' => $lesson->id,
                    'title' => $contentData['title'],
                    'type' => $contentData['type'],
                    'file_path' => $contentData['file_path'] ?? null,
                    'url' => $contentData['url'] ?? null,
                    'description' => $contentData['description'] ?? null,
                    'duration_minutes' => $contentData['duration_minutes'] ?? null,
                    'is_required' => $contentData['is_required'] ?? false,
                    'order' => $contentData['order'] ?? $contentIndex + 1,
                    // Assessment-specific fields
                    'assessment_type' => $contentData['assessment_type'] ?? null,
                    'max_score' => $contentData['max_score'] ?? null,
                    'allow_powerups' => $contentData['allow_powerups'] ?? true,
                ]);
            }
        }
    }
}
