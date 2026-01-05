<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isTutor = $user->hasRole('tutor');
        $isAdmin = $user->hasRole('admin');

        // Parse date from query or default to now
        $date = $request->input('date')
            ? Carbon::parse($request->input('date'))
            : now();

        // Get date range for the full calendar view (start of first week to end of last week)
        $start = $date->copy()->startOfMonth()->startOfWeek();
        $end = $date->copy()->endOfMonth()->endOfWeek();

        $calendarItems = collect();

        if ($isTutor || $isAdmin) {
            // Tutor/Admin: Get courses they teach
            $courses = Course::with(['lessons', 'assessments'])
                ->where('instructor_id', $user->id)
                ->get();

            foreach ($courses as $course) {
                // Add lesson meetings (past and future)
                $meetings = $course->lessons
                    ->filter(fn (Lesson $lesson) => $lesson->meeting_start_time !== null)
                    ->filter(fn (Lesson $lesson) => $lesson->meeting_start_time->between($start, $end))
                    ->map(fn (Lesson $lesson) => [
                        'id' => $lesson->id,
                        'course_id' => $course->id,
                        'lesson_id' => $lesson->id,
                        'title' => $lesson->title,
                        'due_date' => $lesson->meeting_start_time->format('Y-m-d'),
                        'time' => $lesson->meeting_start_time->format('H:i'),
                        'completed' => $lesson->meeting_start_time->isPast(),
                        'course_title' => $course->title,
                        'type' => 'meeting',
                        'meeting_url' => $lesson->meeting_url,
                        'category' => 'meeting',
                    ]);

                $calendarItems = $calendarItems->merge($meetings);

                // Add assessments (past and future)
                $assessments = $course->assessments
                    ->filter(fn (Assessment $assessment) => $assessment->due_date !== null && $assessment->is_published)
                    ->filter(fn (Assessment $assessment) => $assessment->due_date->between($start, $end))
                    ->map(fn (Assessment $assessment) => [
                        'id' => $assessment->id,
                        'course_id' => $course->id,
                        'lesson_id' => $assessment->lesson_id,
                        'title' => $assessment->title,
                        'due_date' => $assessment->due_date->format('Y-m-d'),
                        'time' => $assessment->due_date->format('H:i'),
                        'completed' => $assessment->due_date->isPast(),
                        'course_title' => $course->title,
                        'type' => $assessment->type,
                        'meeting_url' => null,
                        'category' => 'assessment',
                    ]);

                $calendarItems = $calendarItems->merge($assessments);
            }
        } else {
            // Student: Get enrolled courses
            $enrollments = $user->enrollments()
                ->with(['course.lessons', 'course.assessments'])
                ->where('status', 'active')
                ->get();

            foreach ($enrollments as $enrollment) {
                $course = $enrollment->course;

                // Add lesson meetings (past and future)
                $meetings = $course->lessons
                    ->filter(fn (Lesson $lesson) => $lesson->meeting_start_time !== null)
                    ->filter(fn (Lesson $lesson) => $lesson->meeting_start_time->between($start, $end))
                    ->map(fn (Lesson $lesson) => [
                        'id' => $lesson->id,
                        'course_id' => $course->id,
                        'lesson_id' => $lesson->id,
                        'title' => $lesson->title,
                        'due_date' => $lesson->meeting_start_time->format('Y-m-d'),
                        'time' => $lesson->meeting_start_time->format('H:i'),
                        'completed' => $lesson->meeting_start_time->isPast(),
                        'course_title' => $course->title,
                        'type' => 'meeting',
                        'meeting_url' => $lesson->meeting_url,
                        'category' => 'meeting',
                    ]);

                $calendarItems = $calendarItems->merge($meetings);

                // Add assessments (past and future)
                $assessments = $course->assessments
                    ->filter(fn (Assessment $assessment) => $assessment->due_date !== null && $assessment->is_published)
                    ->filter(fn (Assessment $assessment) => $assessment->due_date->between($start, $end))
                    ->map(fn (Assessment $assessment) => [
                        'id' => $assessment->id,
                        'course_id' => $course->id,
                        'lesson_id' => $assessment->lesson_id,
                        'title' => $assessment->title,
                        'due_date' => $assessment->due_date->format('Y-m-d'),
                        'time' => $assessment->due_date->format('H:i'),
                        'completed' => $assessment->due_date->isPast(),
                        'course_title' => $course->title,
                        'type' => $assessment->type,
                        'meeting_url' => null,
                        'category' => 'assessment',
                    ]);

                $calendarItems = $calendarItems->merge($assessments);
            }

            // Also add daily tasks for students
            $tasks = $user->dailyTasks()
                ->with('lesson.course')
                ->whereBetween('due_date', [$start, $end])
                ->get()
                ->map(fn ($task) => [
                    'id' => $task->id,
                    'course_id' => $task->lesson?->course_id,
                    'lesson_id' => $task->lesson_id,
                    'title' => $task->title,
                    'due_date' => $task->due_date->format('Y-m-d'),
                    'time' => null,
                    'completed' => (bool) $task->is_completed,
                    'xp_reward' => $task->xp_reward,
                    'course_title' => $task->lesson?->course?->title ?? 'General',
                    'type' => 'task',
                    'meeting_url' => null,
                    'category' => 'task',
                ]);

            $calendarItems = $calendarItems->merge($tasks);
        }

        // Group by date
        $tasksByDate = $calendarItems
            ->groupBy('due_date')
            ->map(fn ($items) => $items->values()->all())
            ->all();

        // Compute stats
        $meetingsCount = $calendarItems->where('category', 'meeting')->count();
        $assessmentsCount = $calendarItems->where('category', 'assessment')->count();
        $completedCount = $calendarItems->where('completed', true)->count();
        $overdueCount = $calendarItems->filter(fn ($item) => ! $item['completed'] && Carbon::parse($item['due_date'])->isPast())->count();

        return Inertia::render('calendar/index', [
            'tasksByDate' => $tasksByDate,
            'stats' => [
                'total' => $calendarItems->count(),
                'completed' => $completedCount,
                'overdue' => $overdueCount,
                'meetings' => $meetingsCount,
                'assessments' => $assessmentsCount,
            ],
            'currentDate' => $date->format('Y-m-d'),
        ]);
    }
}
