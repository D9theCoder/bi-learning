<?php

namespace Database\Seeders;

use App\CourseCategory;
use App\Models\Assessment;
use App\Models\Course;
use App\Models\CourseContent;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class FixedScenarioSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create fixed users
        $student = User::firstOrCreate(
            ['email' => 'student@gmail.com'],
            [
                'name' => 'Fixed Student',
                'password' => 'password', // Mutator usually hashes this, or UserFactory does
                'email_verified_at' => now(),
                'points_balance' => 100000,
            ]
        );
        $student->syncRoles('student');

        $tutor = User::firstOrCreate(
            ['email' => 'tutor@gmail.com'],
            [
                'name' => 'Fixed Tutor',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );
        $tutor->syncRoles('tutor');

        // 2. Create Course assigned to Tutor
        $course = Course::firstOrCreate(
            ['instructor_id' => $tutor->id, 'title' => 'Fixed Scenario Course'],
            [
                'description' => 'A course for testing fixed scenarios.',
                'thumbnail' => 'https://placehold.co/600x400',
                'difficulty' => 'intermediate',
                'category' => CourseCategory::BasicMathematics->value,
                'is_published' => true,
            ]
        );

        // 3. Enroll Student
        Enrollment::firstOrCreate(
            ['user_id' => $student->id, 'course_id' => $course->id],
            [
                'status' => 'active',
                'enrolled_at' => now(),
                'progress_percentage' => 0,
            ]
        );

        // 4. Create 6 Sessions with specific content
        // Ensure we don't duplicate if re-run
        if ($course->lessons()->count() < 6) {
            $this->createSessions($course);
        }
    }

    private function createSessions(Course $course)
    {
        // Session 1: Link
        $lesson1 = Lesson::create([
            'course_id' => $course->id,
            'title' => 'Session 1: Link Resource',
            'order' => 1,
            'meeting_url' => 'https://zoom.us/j/1234567891',
            'meeting_start_time' => now()->addDays(1)->setHour(10)->setMinute(0),
            'meeting_end_time' => now()->addDays(1)->setHour(11)->setMinute(0),
            'duration_minutes' => 60,
        ]);
        CourseContent::create([
            'lesson_id' => $lesson1->id,
            'title' => 'Important Link',
            'type' => 'link',
            'url' => 'https://laravel.com',
            'is_required' => true,
        ]);

        // Session 2: Video
        $lesson2 = Lesson::create([
            'course_id' => $course->id,
            'title' => 'Session 2: Video Resource',
            'order' => 2,
            'meeting_url' => 'https://zoom.us/j/1234567892',
            'meeting_start_time' => now()->addDays(2)->setHour(10)->setMinute(0),
            'meeting_end_time' => now()->addDays(2)->setHour(11)->setMinute(0),
            'duration_minutes' => 60,
        ]);
        CourseContent::create([
            'lesson_id' => $lesson2->id,
            'title' => 'Intro Video',
            'type' => 'video',
            'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
            'is_required' => true,
        ]);

        // Session 3: Real File (logo.svg)
        $lesson3 = Lesson::create([
            'course_id' => $course->id,
            'title' => 'Session 3: File Resource',
            'order' => 3,
            'meeting_url' => 'https://zoom.us/j/1234567893',
            'meeting_start_time' => now()->addDays(3)->setHour(10)->setMinute(0),
            'meeting_end_time' => now()->addDays(3)->setHour(11)->setMinute(0),
            'duration_minutes' => 60,
        ]);

        // Handle physical file copy
        $sourceFile = public_path('logo.svg');
        $storagePath = 'course-content/logo-copy.svg';

        if (File::exists($sourceFile)) {
            // Ensure directory exists
            if (! Storage::disk('public')->exists('course-content')) {
                Storage::disk('public')->makeDirectory('course-content');
            }
            Storage::disk('public')->put($storagePath, File::get($sourceFile));
        }

        CourseContent::create([
            'lesson_id' => $lesson3->id,
            'title' => 'Course Material',
            'type' => 'file',
            'file_path' => $storagePath,
            'is_required' => true,
        ]);

        // Session 4: Quiz
        $lesson4 = Lesson::create([
            'course_id' => $course->id,
            'title' => 'Session 4: Final Quiz',
            'order' => 4,
            'meeting_url' => 'https://zoom.us/j/1234567894',
            'meeting_start_time' => now()->addDays(4)->setHour(10)->setMinute(0),
            'meeting_end_time' => now()->addDays(4)->setHour(11)->setMinute(0),
            'duration_minutes' => 60,
        ]);

        // Sync Assessment with Questions
        $assessment = Assessment::create([
            'course_id' => $course->id,
            'lesson_id' => $lesson4->id,
            'type' => 'quiz',
            'title' => 'Final Knowledge Check',
            'description' => 'Please complete this quiz to finish the course.',
            'due_date' => now()->addDays(5),
            'max_score' => 100,
            'allow_retakes' => true,
            'time_limit_minutes' => 30,
            'is_published' => true,
        ]);

        // Add quiz questions
        $assessment->questions()->createMany([
            [
                'type' => 'multiple_choice',
                'question' => 'What is the primary purpose of Laravel migrations?',
                'answer_config' => [
                    'type' => 'multiple_choice',
                    'options' => [
                        'To deploy applications to production',
                        'To manage database schema changes',
                        'To handle user authentication',
                        'To create API endpoints',
                    ],
                    'correct_index' => 1,
                ],
                'points' => 10,
                'order' => 1,
            ],
            [
                'type' => 'multiple_choice',
                'question' => 'Which command is used to create a new Laravel controller?',
                'answer_config' => [
                    'type' => 'multiple_choice',
                    'options' => [
                        'php artisan create:controller',
                        'php artisan new controller',
                        'php artisan make:controller',
                        'php artisan generate:controller',
                    ],
                    'correct_index' => 2,
                ],
                'points' => 10,
                'order' => 2,
            ],
            [
                'type' => 'fill_blank',
                'question' => 'In Laravel, the ___ file is the entry point for all HTTP requests.',
                'answer_config' => [
                    'type' => 'fill_blank',
                    'accepted_answers' => ['index.php'],
                ],
                'points' => 10,
                'order' => 3,
            ],
            [
                'type' => 'fill_blank',
                'question' => 'The ___ pattern in Laravel helps to avoid tight coupling between classes.',
                'answer_config' => [
                    'type' => 'fill_blank',
                    'accepted_answers' => ['dependency injection'],
                ],
                'points' => 10,
                'order' => 4,
            ],
            [
                'type' => 'essay',
                'question' => 'Explain the MVC (Model-View-Controller) architecture and how it is implemented in Laravel. Provide examples of each component.',
                'answer_config' => [
                    'type' => 'essay',
                ],
                'points' => 30,
                'order' => 5,
            ],
            [
                'type' => 'essay',
                'question' => 'Describe the benefits of using Eloquent ORM over raw SQL queries. When would you choose one approach over the other?',
                'answer_config' => [
                    'type' => 'essay',
                ],
                'points' => 30,
                'order' => 6,
            ],
        ]);

        // Recalculate max score based on questions
        $totalScore = $assessment->questions()->sum('points');
        $assessment->update(['max_score' => $totalScore]);

        // Session 5: Practice Assessment
        $lesson5 = Lesson::create([
            'course_id' => $course->id,
            'title' => 'Session 5: Practice Assessment',
            'order' => 5,
            'meeting_url' => 'https://zoom.us/j/1234567895',
            'meeting_start_time' => now()->addDays(5)->setHour(10)->setMinute(0),
            'meeting_end_time' => now()->addDays(5)->setHour(11)->setMinute(0),
            'duration_minutes' => 60,
        ]);

        $practiceAssessment = Assessment::create([
            'course_id' => $course->id,
            'lesson_id' => $lesson5->id,
            'type' => 'practice',
            'title' => 'Practice Drill',
            'description' => 'Practice assessment to build confidence.',
            'due_date' => now()->addDays(6),
            'max_score' => 50,
            'allow_retakes' => true,
            'time_limit_minutes' => 20,
            'is_published' => true,
        ]);

        $practiceAssessment->questions()->createMany([
            [
                'type' => 'multiple_choice',
                'question' => 'Which Artisan command generates a model?',
                'answer_config' => [
                    'type' => 'multiple_choice',
                    'options' => [
                        'php artisan make:model',
                        'php artisan create:model',
                        'php artisan new:model',
                        'php artisan build:model',
                    ],
                    'correct_index' => 0,
                ],
                'points' => 10,
                'order' => 1,
            ],
            [
                'type' => 'fill_blank',
                'question' => 'Laravel uses ___ for dependency injection.',
                'answer_config' => [
                    'type' => 'fill_blank',
                    'accepted_answers' => ['service container', 'container'],
                ],
                'points' => 10,
                'order' => 2,
            ],
            [
                'type' => 'multiple_choice',
                'question' => 'Which file defines web routes?',
                'answer_config' => [
                    'type' => 'multiple_choice',
                    'options' => [
                        'routes/api.php',
                        'routes/web.php',
                        'routes/console.php',
                        'routes/channels.php',
                    ],
                    'correct_index' => 1,
                ],
                'points' => 10,
                'order' => 3,
            ],
            [
                'type' => 'fill_blank',
                'question' => 'Eloquent relationships are defined as ___ methods.',
                'answer_config' => [
                    'type' => 'fill_blank',
                    'accepted_answers' => ['relationship', 'public'],
                ],
                'points' => 10,
                'order' => 4,
            ],
            [
                'type' => 'multiple_choice',
                'question' => 'Which command runs the test suite?',
                'answer_config' => [
                    'type' => 'multiple_choice',
                    'options' => [
                        'php artisan tests',
                        'php artisan test',
                        'php artisan run:tests',
                        'php artisan pest',
                    ],
                    'correct_index' => 1,
                ],
                'points' => 10,
                'order' => 5,
            ],
        ]);

        $totalScorePractice = $practiceAssessment->questions()->sum('points');
        $practiceAssessment->update(['max_score' => $totalScorePractice]);

        // Session 6: Final Exam
        $lesson6 = Lesson::create([
            'course_id' => $course->id,
            'title' => 'Session 6: Final Exam',
            'order' => 6,
            'meeting_url' => 'https://zoom.us/j/1234567896',
            'meeting_start_time' => now()->addDays(6)->setHour(10)->setMinute(0),
            'meeting_end_time' => now()->addDays(6)->setHour(11)->setMinute(0),
            'duration_minutes' => 60,
        ]);

        $finalExam = Assessment::create([
            'course_id' => $course->id,
            'lesson_id' => $lesson6->id,
            'type' => 'final_exam',
            'title' => 'Final Exam',
            'description' => 'Comprehensive final exam with mixed question types.',
            'due_date' => now()->addDays(7),
            'max_score' => 100,
            'allow_retakes' => false,
            'time_limit_minutes' => 45,
            'is_published' => true,
            'weight_percentage' => 80, // Final exam counts for 80% of final score
        ]);

        $finalExam->questions()->createMany([
            [
                'type' => 'multiple_choice',
                'question' => 'Which statement about migrations is true?',
                'answer_config' => [
                    'type' => 'multiple_choice',
                    'options' => [
                        'They are used to seed data only.',
                        'They define database schema changes.',
                        'They replace model factories.',
                        'They are only for production.',
                    ],
                    'correct_index' => 1,
                ],
                'points' => 10,
                'order' => 1,
            ],
            [
                'type' => 'fill_blank',
                'question' => 'The __ method is used to render Inertia pages on the server.',
                'answer_config' => [
                    'type' => 'fill_blank',
                    'accepted_answers' => ['Inertia::render', 'render'],
                ],
                'points' => 10,
                'order' => 2,
            ],
            [
                'type' => 'essay',
                'question' => 'Explain how Laravel handles request validation and why Form Requests are useful.',
                'answer_config' => [
                    'type' => 'essay',
                ],
                'points' => 30,
                'order' => 3,
            ],
            [
                'type' => 'essay',
                'question' => 'Describe a strategy to prevent N+1 queries in a Laravel application.',
                'answer_config' => [
                    'type' => 'essay',
                ],
                'points' => 30,
                'order' => 4,
            ],
            [
                'type' => 'multiple_choice',
                'question' => 'Which command runs queued jobs?',
                'answer_config' => [
                    'type' => 'multiple_choice',
                    'options' => [
                        'php artisan queue:listen',
                        'php artisan queue:work',
                        'php artisan queue:run',
                        'php artisan queue:start',
                    ],
                    'correct_index' => 1,
                ],
                'points' => 20,
                'order' => 5,
            ],
        ]);

        $totalScoreFinal = $finalExam->questions()->sum('points');
        $finalExam->update(['max_score' => $totalScoreFinal]);
    }
}
