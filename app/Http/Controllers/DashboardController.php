<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseContent;
use App\Models\CourseContentCompletion;
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
            ->with(['course.lessons', 'course.instructor'])
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

            $courseSnapshots = [];
            $chartSeries = [];
            $upcomingItems = [];
            $studentAggregates = [];

            foreach ($taughtCourses as $course) {
                $enrollments = $course->enrollments;
                $studentCount = $enrollments->count();
                $activeStudents = $enrollments->where('status', 'active')->count();
                $avgProgress = round((float) ($enrollments->avg('progress_percentage') ?? 0), 1);

                $attendanceContents = $course->lessons->flatMap(
                    fn ($lesson) => $lesson->contents->where('type', 'attendance')
                );
                $assignmentContents = $course->lessons->flatMap(
                    fn ($lesson) => $lesson->contents->reject(fn ($content) => $content->type === 'attendance')
                );

                $attendanceCompleted = $attendanceContents->sum(
                    fn (CourseContent $content) => $completions->get($content->id)?->count() ?? 0
                );
                $assignmentCompleted = $assignmentContents->sum(
                    fn (CourseContent $content) => $completions->get($content->id)?->count() ?? 0
                );

                $attendancePossible = max(1, $attendanceContents->count() * max(1, $studentCount));
                $assignmentPossible = max(1, $assignmentContents->count() * max(1, $studentCount));

                $attendanceRate = round(($attendanceCompleted / $attendancePossible) * 100, 1);
                $assignmentRate = round(($assignmentCompleted / $assignmentPossible) * 100, 1);

                $nextDue = $course->lessons
                    ->flatMap(fn ($lesson) => $lesson->contents)
                    ->filter(fn (CourseContent $content) => $content->due_date !== null)
                    ->sortBy('due_date')
                    ->first();

                $courseSnapshots[] = [
                    'id' => $course->id,
                    'title' => $course->title,
                    'student_count' => $studentCount,
                    'active_students' => $activeStudents,
                    'average_progress' => $avgProgress,
                    'attendance_rate' => $attendanceRate,
                    'assignment_rate' => $assignmentRate,
                    'next_due_date' => $nextDue?->due_date?->toDateString(),
                    'is_published' => $course->is_published,
                ];

                $chartSeries[] = [
                    'course' => $course->title,
                    'attendance' => $attendanceRate,
                    'assignments' => $assignmentRate,
                    'students' => $studentCount,
                ];

                $dueContents = $course->lessons
                    ->flatMap(fn ($lesson) => $lesson->contents)
                    ->filter(fn (CourseContent $content) => $content->due_date !== null)
                    ->sortBy('due_date')
                    ->map(fn (CourseContent $content) => [
                        'id' => $content->id,
                        'title' => $content->title,
                        'course_title' => $course->title,
                        'due_date' => $content->due_date?->toDateString(),
                        'type' => $content->type,
                    ]);

                $upcomingItems = array_merge($upcomingItems, $dueContents->all());

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
