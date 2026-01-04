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

        $content4 = CourseContent::create([
            'lesson_id' => $lesson4->id,
            'title' => 'Final Knowledge Check',
            'type' => 'assessment',
            'assessment_type' => 'quiz',
            'is_required' => true,
            'due_date' => now()->addDays(5),
            'description' => 'Please complete this quiz to finish the course.',
            'max_score' => 100,
            'allow_powerups' => true,
        ]);

        // Sync Assessment with Questions
        $assessment = Assessment::create([
            'course_id' => $course->id,
            'lesson_id' => $lesson4->id,
            'type' => 'quiz',
            'title' => $content4->title,
            'description' => $content4->description,
            'due_date' => $content4->due_date,
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
                'options' => [
                    'To deploy applications to production',
                    'To manage database schema changes',
                    'To handle user authentication',
                    'To create API endpoints',
                ],
                'correct_answer' => '1',
                'points' => 10,
                'order' => 1,
            ],
            [
                'type' => 'multiple_choice',
                'question' => 'Which command is used to create a new Laravel controller?',
                'options' => [
                    'php artisan create:controller',
                    'php artisan new controller',
                    'php artisan make:controller',
                    'php artisan generate:controller',
                ],
                'correct_answer' => '2',
                'points' => 10,
                'order' => 2,
            ],
            [
                'type' => 'fill_blank',
                'question' => 'In Laravel, the ___ file is the entry point for all HTTP requests.',
                'options' => ['index.php'],
                'correct_answer' => 'index.php',
                'points' => 10,
                'order' => 3,
            ],
            [
                'type' => 'fill_blank',
                'question' => 'The ___ pattern in Laravel helps to avoid tight coupling between classes.',
                'options' => ['dependency injection'],
                'correct_answer' => 'dependency injection',
                'points' => 10,
                'order' => 4,
            ],
            [
                'type' => 'essay',
                'question' => 'Explain the MVC (Model-View-Controller) architecture and how it is implemented in Laravel. Provide examples of each component.',
                'options' => null,
                'correct_answer' => null,
                'points' => 30,
                'order' => 5,
            ],
            [
                'type' => 'essay',
                'question' => 'Describe the benefits of using Eloquent ORM over raw SQL queries. When would you choose one approach over the other?',
                'options' => null,
                'correct_answer' => null,
                'points' => 30,
                'order' => 6,
            ],
        ]);

        // Recalculate max score based on questions
        $totalScore = $assessment->questions()->sum('points');
        $assessment->update(['max_score' => $totalScore]);

        // Update content with assessment reference
        $content4->update([
            'assessment_id' => $assessment->id,
            'max_score' => $totalScore,
        ]);

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

        $content5 = CourseContent::create([
            'lesson_id' => $lesson5->id,
            'title' => 'Practice Drill',
            'type' => 'assessment',
            'assessment_type' => 'practice',
            'is_required' => true,
            'due_date' => now()->addDays(6),
            'description' => 'Practice assessment to build confidence.',
            'max_score' => 50,
            'allow_powerups' => true,
        ]);

        $practiceAssessment = Assessment::create([
            'course_id' => $course->id,
            'lesson_id' => $lesson5->id,
            'type' => 'practice',
            'title' => $content5->title,
            'description' => $content5->description,
            'due_date' => $content5->due_date,
            'max_score' => 50,
            'allow_retakes' => true,
            'time_limit_minutes' => 20,
            'is_published' => true,
        ]);

        $practiceAssessment->questions()->createMany([
            [
                'type' => 'multiple_choice',
                'question' => 'Which Artisan command generates a model?',
                'options' => [
                    'php artisan make:model',
                    'php artisan create:model',
                    'php artisan new:model',
                    'php artisan build:model',
                ],
                'correct_answer' => '0',
                'points' => 10,
                'order' => 1,
            ],
            [
                'type' => 'fill_blank',
                'question' => 'Laravel uses ___ for dependency injection.',
                'options' => ['service container', 'container'],
                'correct_answer' => 'service container',
                'points' => 10,
                'order' => 2,
            ],
            [
                'type' => 'multiple_choice',
                'question' => 'Which file defines web routes?',
                'options' => [
                    'routes/api.php',
                    'routes/web.php',
                    'routes/console.php',
                    'routes/channels.php',
                ],
                'correct_answer' => '1',
                'points' => 10,
                'order' => 3,
            ],
            [
                'type' => 'fill_blank',
                'question' => 'Eloquent relationships are defined as ___ methods.',
                'options' => ['relationship', 'public'],
                'correct_answer' => 'relationship',
                'points' => 10,
                'order' => 4,
            ],
            [
                'type' => 'multiple_choice',
                'question' => 'Which command runs the test suite?',
                'options' => [
                    'php artisan tests',
                    'php artisan test',
                    'php artisan run:tests',
                    'php artisan pest',
                ],
                'correct_answer' => '1',
                'points' => 10,
                'order' => 5,
            ],
        ]);

        $totalScorePractice = $practiceAssessment->questions()->sum('points');
        $practiceAssessment->update(['max_score' => $totalScorePractice]);

        // Update content with assessment reference
        $content5->update([
            'assessment_id' => $practiceAssessment->id,
            'max_score' => $totalScorePractice,
        ]);

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

        $content6 = CourseContent::create([
            'lesson_id' => $lesson6->id,
            'title' => 'Final Exam',
            'type' => 'assessment',
            'assessment_type' => 'final_exam',
            'is_required' => true,
            'due_date' => now()->addDays(7),
            'description' => 'Comprehensive final exam with mixed question types.',
            'max_score' => 100,
            'allow_powerups' => false, // Final exams don't allow powerups
        ]);

        $finalExam = Assessment::create([
            'course_id' => $course->id,
            'lesson_id' => $lesson6->id,
            'type' => 'final_exam',
            'title' => $content6->title,
            'description' => $content6->description,
            'due_date' => $content6->due_date,
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
                'options' => [
                    'They are used to seed data only.',
                    'They define database schema changes.',
                    'They replace model factories.',
                    'They are only for production.',
                ],
                'correct_answer' => '1',
                'points' => 10,
                'order' => 1,
            ],
            [
                'type' => 'fill_blank',
                'question' => 'The __ method is used to render Inertia pages on the server.',
                'options' => ['Inertia::render', 'render'],
                'correct_answer' => 'Inertia::render',
                'points' => 10,
                'order' => 2,
            ],
            [
                'type' => 'essay',
                'question' => 'Explain how Laravel handles request validation and why Form Requests are useful.',
                'options' => null,
                'correct_answer' => null,
                'points' => 30,
                'order' => 3,
            ],
            [
                'type' => 'essay',
                'question' => 'Describe a strategy to prevent N+1 queries in a Laravel application.',
                'options' => null,
                'correct_answer' => null,
                'points' => 30,
                'order' => 4,
            ],
            [
                'type' => 'multiple_choice',
                'question' => 'Which command runs queued jobs?',
                'options' => [
                    'php artisan queue:listen',
                    'php artisan queue:work',
                    'php artisan queue:run',
                    'php artisan queue:start',
                ],
                'correct_answer' => '1',
                'points' => 20,
                'order' => 5,
            ],
        ]);

        $totalScoreFinal = $finalExam->questions()->sum('points');
        $finalExam->update(['max_score' => $totalScoreFinal]);

        // Update content with assessment reference
        $content6->update([
            'assessment_id' => $finalExam->id,
            'max_score' => $totalScoreFinal,
        ]);
    }
}
