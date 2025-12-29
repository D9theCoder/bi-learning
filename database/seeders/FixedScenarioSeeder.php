<?php

namespace Database\Seeders;

use App\Models\Assessment;
use App\Models\Cohort;
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
        $cohort = Cohort::first() ?? Cohort::factory()->create();

        $student = User::firstOrCreate(
            ['email' => 'student@gmail.com'],
            [
                'name' => 'Fixed Student',
                'password' => 'password', // Mutator usually hashes this, or UserFactory does
                'cohort_id' => $cohort->id,
                'email_verified_at' => now(),
            ]
        );
        $student->syncRoles('student');

        $tutor = User::firstOrCreate(
            ['email' => 'tutor@gmail.com'],
            [
                'name' => 'Fixed Tutor',
                'password' => 'password',
                'cohort_id' => $cohort->id,
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
                'category' => 'General',
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

        // 4. Create 4 Sessions with specific content
        // Ensure we don't duplicate if re-run
        if ($course->lessons()->count() < 4) {
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
            'type' => 'quiz',
            'is_required' => true,
            'due_date' => now()->addDays(5),
            'description' => 'Please complete this quiz to finish the course.',
        ]);

        // Sync Assessment
        Assessment::create([
            'course_id' => $course->id,
            'lesson_id' => $lesson4->id,
            'type' => 'quiz',
            'title' => $content4->title,
            'description' => $content4->description,
            'due_date' => $content4->due_date,
            'max_score' => 100,
        ]);
    }
}
