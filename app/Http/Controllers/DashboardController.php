<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Course;
use App\Models\CourseContentCompletion;
use App\Models\QuizAttempt;
use App\Models\Reward;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isTutor = $user->hasRole('tutor');
        $isAdmin = $user->hasRole('admin');

        // Load all relationships needed for dashboard
        $user->load([
            'cohort',
        ]);

        // Get recent achievements separately to avoid ambiguous column issues
        $recentAchievements = $user->achievements()
            ->orderByDesc('achievement_user.earned_at')
            ->limit(3)
            ->get();

        // Get enrolled courses with relationships and compute next_lesson per enrollment
        // Returns arrays preserving nested `course` while adding computed `next_lesson`
        $enrolledCourses = $user->enrollments()
            ->with(['course.lessons', 'course.instructor', 'course.assessments'])
            ->where('status', 'active')
            ->latest('last_activity_at')
            ->get()
            ->map(function ($enrollment) use ($user) {
                $data = $enrollment->toArray();
                $nextLesson = $user->nextLessonForEnrollment($enrollment);
                $data['next_lesson'] = $nextLesson ? $nextLesson->toArray() : null;
                // Ensure numeric type on progress_percentage for frontend typings
                $data['progress_percentage'] = (float) ($enrollment->progress_percentage ?? 0);

                return $data;
            });

        // Build student calendar with upcoming meetings and assessments from enrolled courses
        $studentCalendar = [];

        foreach ($user->enrollments()->with(['course.lessons', 'course.assessments'])->where('status', 'active')->get() as $enrollment) {
            $course = $enrollment->course;

            // Add upcoming lesson meetings
            $upcomingMeetings = $course->lessons
                ->filter(fn ($lesson) => $lesson->meeting_start_time !== null && $lesson->meeting_start_time->isFuture())
                ->map(fn ($lesson) => [
                    'id' => $lesson->id,
                    'title' => $lesson->title,
                    'course_title' => $course->title,
                    'date' => $lesson->meeting_start_time?->toDateString(),
                    'time' => $lesson->meeting_start_time?->format('H:i'),
                    'type' => 'meeting',
                    'category' => 'meeting',
                ]);

            $studentCalendar = array_merge($studentCalendar, $upcomingMeetings->all());

            // Add upcoming assessment due dates
            $upcomingAssessments = $course->assessments
                ->filter(fn ($assessment) => $assessment->due_date !== null && $assessment->due_date->isFuture() && $assessment->is_published)
                ->map(fn ($assessment) => [
                    'id' => $assessment->id,
                    'title' => $assessment->title,
                    'course_title' => $course->title,
                    'date' => $assessment->due_date?->toDateString(),
                    'time' => $assessment->due_date?->format('H:i'),
                    'type' => $assessment->type,
                    'category' => 'assessment',
                ]);

            $studentCalendar = array_merge($studentCalendar, $upcomingAssessments->all());
        }

        // Sort by date and limit to 8 items
        usort($studentCalendar, fn ($a, $b) => strcmp($a['date'], $b['date']));
        $studentCalendar = array_slice($studentCalendar, 0, 8);

        // Get today's tasks
        $todayTasks = $user->dailyTasks()
            ->with('lesson')
            ->whereDate('due_date', today())
            ->orderBy('is_completed')
            ->orderBy('estimated_minutes')
            ->get();

        // Get tutor messages
        $tutorMessages = $user->tutorMessages()
            ->with('tutor')
            ->where('is_read', false)
            ->latest('sent_at')
            ->limit(5)
            ->get();

        // Get recent activity
        $recentActivity = $user->activities()
            ->latest()
            ->limit(10)
            ->get();

        // Get cohort leaderboard
        $cohortLeaderboard = [];
        $currentUserRank = null;

        if ($user->cohort_id) {
            $cohortLeaderboard = User::where('cohort_id', $user->cohort_id)
                ->orderByDesc('total_xp')
                ->limit(10)
                ->get()
                ->map(function ($u, $index) use ($user) {
                    return [
                        'id' => $u->id,
                        'name' => $u->name,
                        'avatar' => $u->avatar,
                        'xp' => $u->total_xp,
                        'level' => $u->level ?? 1,
                        'rank' => $index + 1,
                        'isCurrentUser' => $u->id === $user->id,
                    ];
                });

            $currentUserRank = $user->cohortRank();
        }

        $tutorData = null;

        if ($isTutor || $isAdmin) {
            $taughtCourses = Course::with([
                'lessons.contents',
                'enrollments.user',
                'assessments',
            ])
                ->where('instructor_id', $user->id)
                ->get();

            $courseIds = $taughtCourses->pluck('id');
            $contentIds = $taughtCourses
                ->flatMap(fn (Course $course) => $course->lessons->flatMap(fn ($lesson) => $lesson->contents))
                ->pluck('id');

            $completions = CourseContentCompletion::whereIn('course_content_id', $contentIds)
                ->get()
                ->groupBy('course_content_id');

            $lessonIds = $taughtCourses->flatMap(fn (Course $course) => $course->lessons->pluck('id'));
            $attendanceRecords = Attendance::whereIn('lesson_id', $lessonIds)->get();

            $assessmentIds = $taughtCourses->flatMap(fn (Course $course) => $course->assessments->pluck('id'));
            $completedQuizAttempts = QuizAttempt::whereIn('assessment_id', $assessmentIds)
                ->whereNotNull('completed_at')
                ->get();

            $courseSnapshots = [];
            $chartSeries = [];
            $upcomingItems = [];
            $studentAggregates = [];

            foreach ($taughtCourses as $course) {
                $enrollments = $course->enrollments;
                $studentCount = $enrollments->count();
                $activeStudents = $enrollments->where('status', 'active')->count();
                $avgProgress = round((float) ($enrollments->avg('progress_percentage') ?? 0), 1);

                $courseLessonIds = $course->lessons->pluck('id');
                $lessonCount = $courseLessonIds->count();

                $attendanceCount = $attendanceRecords
                    ->whereIn('lesson_id', $courseLessonIds)
                    ->count();

                $attendancePossible = max(1, $lessonCount * max(1, $studentCount));
                $attendanceRate = round(($attendanceCount / $attendancePossible) * 100, 1);

                $courseAssessmentIds = $course->assessments->pluck('id');
                $assessmentCount = $courseAssessmentIds->count();

                $quizCompletedCount = $completedQuizAttempts
                    ->whereIn('assessment_id', $courseAssessmentIds)
                    ->unique(fn ($attempt) => $attempt->user_id.'-'.$attempt->assessment_id)
                    ->count();

                $quizPossible = max(1, $assessmentCount * max(1, $studentCount));
                $quizRate = round(($quizCompletedCount / $quizPossible) * 100, 1);

                $nextMeeting = $course->lessons
                    ->filter(fn ($lesson) => $lesson->meeting_start_time !== null && $lesson->meeting_start_time->isFuture())
                    ->sortBy('meeting_start_time')
                    ->first();

                $courseSnapshots[] = [
                    'id' => $course->id,
                    'title' => $course->title,
                    'thumbnail' => $course->thumbnail,
                    'student_count' => $studentCount,
                    'active_students' => $activeStudents,
                    'next_meeting_date' => $nextMeeting?->meeting_start_time?->toDateString(),
                    'next_meeting_time' => $nextMeeting?->meeting_start_time?->format('H:i'),
                    'is_published' => $course->is_published,
                ];

                $chartSeries[] = [
                    'course' => $course->title,
                    'attendance' => $attendanceRate,
                    'quiz' => $quizRate,
                    'students' => $studentCount,
                ];

                // Add upcoming lesson meetings
                $upcomingMeetings = $course->lessons
                    ->filter(fn ($lesson) => $lesson->meeting_start_time !== null && $lesson->meeting_start_time->isFuture())
                    ->sortBy('meeting_start_time')
                    ->map(fn ($lesson) => [
                        'id' => $lesson->id,
                        'title' => $lesson->title,
                        'course_title' => $course->title,
                        'due_date' => $lesson->meeting_start_time?->toDateString(),
                        'time' => $lesson->meeting_start_time?->format('H:i'),
                        'type' => 'meeting',
                        'category' => 'meeting',
                    ]);

                $upcomingItems = array_merge($upcomingItems, $upcomingMeetings->all());

                // Add upcoming assessment due dates
                $upcomingAssessments = $course->assessments
                    ->filter(fn ($assessment) => $assessment->due_date !== null && $assessment->due_date->isFuture() && $assessment->is_published)
                    ->sortBy('due_date')
                    ->map(fn ($assessment) => [
                        'id' => $assessment->id,
                        'title' => $assessment->title,
                        'course_title' => $course->title,
                        'due_date' => $assessment->due_date?->toDateString(),
                        'time' => $assessment->due_date?->format('H:i'),
                        'type' => $assessment->type,
                        'category' => 'assessment',
                    ]);

                $upcomingItems = array_merge($upcomingItems, $upcomingAssessments->all());

                foreach ($enrollments as $enrollment) {
                    $student = $enrollment->user;

                    if (! $student) {
                        continue;
                    }

                    if (! isset($studentAggregates[$student->id])) {
                        $studentAggregates[$student->id] = [
                            'id' => $student->id,
                            'name' => $student->name,
                            'avatar' => $student->avatar,
                            'courses' => 0,
                            'progress_values' => [],
                        ];
                    }

                    $studentAggregates[$student->id]['courses']++;
                    $studentAggregates[$student->id]['progress_values'][] = (float) ($enrollment->progress_percentage ?? 0);
                }
            }

            usort($upcomingItems, fn ($a, $b) => strcmp($a['due_date'], $b['due_date']));
            $upcomingItems = array_slice($upcomingItems, 0, 8);

            $roster = collect($studentAggregates)
                ->map(function ($entry) {
                    $avg = count($entry['progress_values']) > 0
                        ? round(array_sum($entry['progress_values']) / count($entry['progress_values']), 1)
                        : 0;

                    return [
                        'id' => $entry['id'],
                        'name' => $entry['name'],
                        'avatar' => $entry['avatar'],
                        'courses' => $entry['courses'],
                        'average_progress' => $avg,
                    ];
                })
                ->sortByDesc('average_progress')
                ->values()
                ->take(10)
                ->all();

            $tutorData = [
                'courses' => $courseSnapshots,
                'chart' => $chartSeries,
                'calendar' => $upcomingItems,
                'roster' => $roster,
                'summary' => [
                    'course_count' => $courseSnapshots ? count($courseSnapshots) : 0,
                    'student_count' => collect($courseSnapshots)->sum('student_count'),
                    'average_progress' => round(
                        collect($courseSnapshots)->avg('average_progress') ?? 0,
                        1
                    ),
                ],
            ];
        }

        return Inertia::render('dashboard', [
            'stats' => [
                'streak' => $user->currentStreak(),
                'xp_this_week' => $user->xpThisWeek(),
                'hours_learned' => $user->hoursThisWeek(),
                'active_courses' => $user->enrollments()->where('status', 'active')->count(),
                'total_xp' => $user->total_xp ?? 0,
                'level' => $user->level ?? 1,
                'points_balance' => $user->points_balance ?? 0,
            ],
            'today_tasks' => $todayTasks,
            'enrolled_courses' => $enrolledCourses,
            'student_calendar' => $studentCalendar,
            'recent_achievements' => $recentAchievements,
            'next_milestone' => $user->nextAchievementMilestone(),
            'recent_activity' => $recentActivity,
            'tutor_messages' => $tutorMessages,
            'unread_message_count' => $user->tutorMessages()->where('is_read', false)->count(),
            'cohort_leaderboard' => $cohortLeaderboard,
            'current_user_rank' => $currentUserRank,
            'weekly_activity_data' => collect($user->weeklyActivityChartData())->map(fn ($item) => [
                'name' => $item['day'],
                'value' => $item['xp'],
            ])->toArray(),
            'available_rewards' => Reward::where('is_active', true)
                ->orderBy('cost')
                ->limit(6)
                ->get(),
            'tutor_dashboard' => $tutorData,
        ]);
    }
}
