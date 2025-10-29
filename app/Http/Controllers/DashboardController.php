<?php

namespace App\Http\Controllers;

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

        // Load all relationships needed for dashboard
        $user->load([
            'cohort',
        ]);

        // Get recent achievements separately to avoid ambiguous column issues
        $recentAchievements = $user->achievements()
            ->orderByDesc('achievement_user.earned_at')
            ->limit(3)
            ->get();

        // Get enrolled courses with relationships
        $enrolledCourses = $user->enrollments()
            ->with(['course.lessons', 'course.instructor'])
            ->where('status', 'active')
            ->latest('last_activity_at')
            ->get()
            ->map(function ($enrollment) use ($user) {
                return [
                    'id' => $enrollment->id,
                    'course_id' => $enrollment->course->id,
                    'title' => $enrollment->course->title,
                    'thumbnail' => $enrollment->course->thumbnail,
                    'progress_percentage' => (int) $enrollment->progress_percentage,
                    'last_activity_at' => $enrollment->last_activity_at,
                    'status' => $enrollment->status,
                    'next_lesson' => $user->nextLessonForEnrollment($enrollment),
                ];
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
        ]);
    }
}
