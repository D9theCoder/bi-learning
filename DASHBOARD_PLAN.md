# Bi-Learning Dashboard Implementation Plan

## Overview

Build a comprehensive, gamified learning dashboard leveraging existing shadcn/ui components, Inertia + React architecture, and Laravel backend. Transform the placeholder dashboard into a motivating daily home with KPI cards, course progress, achievements, tasks, and tutor interactions.

---

## Design Requirements

* Use shadcn/ui components for the UI framework.
* Clean, minimal, professional, and motivating. Use fun elements only where they help engagement.
* Fast, accessible, responsive. Keyboard-friendly and mobile-first breakpoints.
* Energetic but easy-on-the-eyes palette. High contrast for readability.
* Prioritize information hierarchy: what the user needs now, next, and later.
* Persist user state in the URL where appropriate (filters, sort, active course).
* Clear affordances for actions: Start lesson, Resume, Message tutor, Claim reward.

---

## Primary Dashboard Sections

* **Navigation** - compact links: Dashboard, My Courses, Daily Tasks, Achievements, Rewards, Tutors, Calendar, Messages, Settings.
* **Overview / Snapshot** - KPI cards: streak, XP this week, hours learned, active courses.
* **Today widget** - live checklist of today's tasks and lessons with quick completion toggles and progress bars.
* **Learning path** - visual roadmap for the active course with progress timeline, next lesson CTA, estimated time to complete.
* **Course cards** - compact list or grid with progress ring, last activity, next step, quick resume button.
* **Achievements** - recent badges unlocked, next milestones, progress toward next badge. Include subtle celebratory animation on unlock.
* **Rewards center** - points balance, redeemable rewards, recent claims.
* **Messages / Tutor chat** - pinned conversations, unread count, quick reply composer.
* **Calendar & schedule** - upcoming live sessions and booking quick actions.
* **Leaderboard / social** - optional cohort leaderboard and friend progress feed.
* **Activity feed** - recent actions: completed lessons, rewards claimed, tutor messages.
* **Settings quick area** - notifications toggle, accessibility prefs, theme switch.

---

## Interactive Elements and Motion

* Progress rings and linear progress bars with numeric labels.
* Tooltip details on hover, keyboard accessible.
* Microinteractions: button press feedback, list reordering affordance, animated counters for XP gains. Keep motion subtle and optional via "reduce motion".
* Confetti or soft particle animation only for big wins like level up or certificate earned.
* In-dashboard mini charts: sparkline for weekly activity, small bar or area chart for time spent.
* Drag to reorder modules on desktop, collapse to single column on mobile.

---

## Data UX and Behavior

* Clear CTAs: Resume, Start Lesson, Message Tutor, Book Session.
* Inline editing where useful: rename playlist, snooze task.
* Empty states that teach next steps and link to help.
* Loading states with skeletons for lists and cards.
* Error states with clear recovery actions.

---

## Accessibility and Performance

* WCAG AA contrast minimum, semantic HTML, ARIA where needed.
* Focus outlines, skip-to-main, keyboard nav for all interactive controls.
* Lazy-load heavy components (charts, animation) and defer noncritical assets.

---

## Style and Tone

* Friendly, motivating, focused. Practical encouragement, not gimmicks.
* Visual language: soft rounded corners, clear typographic hierarchy, roomy spacing, muted backgrounds, energetic accents.
* Personality: like Duolingo in encouragement and gamification, but visually restrained and data-first like Coursera.

---

## Implementation Steps

### 1. Define Domain Types and Models

**TypeScript Interfaces** (`resources/js/types/index.d.ts`):
- `Course` - id, title, description, instructor, thumbnail, progress, enrollment status
- `Lesson` - id, course_id, title, content, duration, completed
- `Enrollment` - user_id, course_id, progress, status, enrolled_at
- `Achievement` - id, name, description, icon, earned_at, rarity
- `Badge` - id, name, description, icon, criteria
- `Streak` - current_streak, longest_streak, last_activity_date
- `DailyTask` - id, title, type, completed, estimated_time
- `TutorMessage` - id, tutor_id, content, unread, sent_at
- `LearningStats` - total_xp, level, courses_completed, time_spent, points_balance
- `Reward` - id, name, description, cost, icon, redeemable
- `CohortLeaderboard` - rank, user, xp, courses_completed

**Laravel Eloquent Models** (`app/Models/`):
- Course, Lesson, Enrollment, Achievement, Badge, DailyTask, TutorMessage, Reward, Cohort
- Define relationships: User hasMany Enrollments, Course hasMany Lessons, etc.
- Implement scopes for active enrollments, completed lessons, earned achievements

**Migrations** (`database/migrations/`):
- Create tables with proper foreign keys and indexes
- Add timestamps, soft deletes where appropriate
- Include nullable fields for optional data

**Factories** (`database/factories/`):
- Realistic seed data for all models
- Use Faker for varied content
- Create course progressions, achievement unlocks, task completions

---

### 2. Build Reusable Dashboard Components

**Location**: `resources/js/components/dashboard/`

**Components to Create**:

1. **StatCard** (`stat-card.tsx`)
   - Props: icon, label, value, trend (up/down %), variant (default/accent)
   - Uses: Card, Badge for trend indicator
   - Supports dark mode, responsive text sizes

2. **CourseCard** (`course-card.tsx`)
   - Props: course, progress, lastActivity, nextLesson, onResume
   - Uses: Card, ProgressRing, Button, Badge
   - Quick actions: Resume, View Details
   - Thumbnail with fallback gradient

3. **ProgressRing** (`progress-ring.tsx`)
   - Props: progress (0-100), size, strokeWidth, label
   - SVG-based circular progress
   - Animated on mount with configurable duration
   - Center label for percentage

4. **StreakIndicator** (`streak-indicator.tsx`)
   - Props: currentStreak, longestStreak
   - Flame icon (🔥) with animated glow on active streak
   - Tooltip with longest streak info
   - Uses: Badge, Tooltip

5. **TodayTaskList** (`today-task-list.tsx`)
   - Props: tasks[], onToggle
   - Checkbox for completion
   - Progress bar showing overall completion
   - Estimated time display
   - Uses: Checkbox, Progress, Card

6. **AchievementBadge** (`achievement-badge.tsx`)
   - Props: achievement, showAnimation
   - Rarity-based styling (bronze, silver, gold, platinum)
   - Confetti/particle animation on first unlock
   - Uses: Badge, Dialog for details, Tooltip

7. **RecentActivityFeed** (`recent-activity-feed.tsx`)
   - Props: activities[]
   - Timeline-style list with icons
   - Relative timestamps ("2 hours ago")
   - Uses: Card, Avatar, Badge

8. **TutorChatWidget** (`tutor-chat-widget.tsx`)
   - Props: messages[], unreadCount, onSendMessage
   - Compact message list
   - Quick reply composer
   - Unread badge indicator
   - Uses: Card, Avatar, Badge, Button, Input

9. **MiniChart** (`mini-chart.tsx`)
   - Props: data[], type ('sparkline' | 'bar' | 'area')
   - Uses: recharts components
   - Responsive sizing
   - Minimal styling, focus on data

10. **LevelProgressBar** (`level-progress-bar.tsx`)
    - Props: currentXP, nextLevelXP, level
    - Linear progress with XP values
    - Level badge
    - Uses: Progress, Badge

11. **RewardCard** (`reward-card.tsx`)
    - Props: reward, userPoints, onClaim
    - Icon, name, description, cost
    - Claim button (disabled if insufficient points)
    - Uses: Card, Button, Badge

12. **CohortLeaderboard** (`cohort-leaderboard.tsx`)
    - Props: entries[], currentUserRank
    - Top 10 display
    - Highlight current user
    - Rank badges (1st, 2nd, 3rd)
    - Uses: Card, Avatar, Badge

---

### 3. Implement DashboardController and Data Aggregation

**Backend** (`app/Http/Controllers/DashboardController.php`):

```php
public function index(Request $request)
{
    $user = $request->user();
    
    return Inertia::render('Dashboard', [
        'stats' => [
            'streak' => $user->currentStreak(),
            'xpThisWeek' => $user->xpThisWeek(),
            'hoursLearned' => $user->hoursThisWeek(),
            'activeCourses' => $user->activeEnrollments()->count(),
            'totalXp' => $user->total_xp,
            'level' => $user->level,
            'pointsBalance' => $user->points_balance,
        ],
        'todayTasks' => $user->dailyTasks()
            ->today()
            ->with('lesson')
            ->get(),
        'enrolledCourses' => $user->enrollments()
            ->with(['course.lessons', 'course.instructor'])
            ->active()
            ->get()
            ->map(fn($e) => [
                'id' => $e->course->id,
                'title' => $e->course->title,
                'thumbnail' => $e->course->thumbnail,
                'progress' => $e->progress_percentage,
                'lastActivity' => $e->last_activity_at,
                'nextLesson' => $e->nextLesson(),
            ]),
        'recentAchievements' => $user->achievements()
            ->latest()
            ->limit(3)
            ->get(),
        'nextMilestone' => $user->nextAchievementMilestone(),
        'recentActivity' => $user->activities()
            ->latest()
            ->limit(10)
            ->get(),
        'tutorMessages' => $user->tutorMessages()
            ->unread()
            ->latest()
            ->limit(5)
            ->with('tutor')
            ->get(),
        'unreadMessageCount' => $user->tutorMessages()->unread()->count(),
        'cohortLeaderboard' => $user->cohort
            ->leaderboard()
            ->limit(10)
            ->get(),
        'currentUserRank' => $user->cohortRank(),
        'weeklyActivityData' => $user->weeklyActivityChartData(),
        'availableRewards' => Reward::active()
            ->orderBy('cost')
            ->get(),
    ]);
}
```

Model Methods (add to app/Models/User.php):

currentStreak() - calculate consecutive days
xpThisWeek() - sum XP earned this week
hoursThisWeek() - sum learning time this week
activeEnrollments() - scope for in-progress courses
nextAchievementMilestone() - closest unearned achievement
weeklyActivityChartData() - array for sparkline chart
cohortRank() - user's position in cohort leaderboard

4. Rebuild dashboard.tsx with Sections
File: resources/js/pages/dashboard.tsx

Structure:

```tsx
export default function Dashboard({ 
    stats, 
    todayTasks, 
    enrolledCourses, 
    recentAchievements, 
    nextMilestone,
    recentActivity,
    tutorMessages,
    unreadMessageCount,
    cohortLeaderboard,
    currentUserRank,
    weeklyActivityData,
    availableRewards,
}: DashboardPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 lg:p-6">
                {/* KPI Overview Section */}
                <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard 
                        icon={Flame} 
                        label="Current Streak" 
                        value={`${stats.streak} days`}
                    />
                    <StatCard 
                        icon={Zap} 
                        label="XP This Week" 
                        value={stats.xpThisWeek}
                        trend={/* calculate trend */}
                    />
                    <StatCard 
                        icon={Clock} 
                        label="Hours Learned" 
                        value={stats.hoursLearned}
                    />
                    <StatCard 
                        icon={BookOpen} 
                        label="Active Courses" 
                        value={stats.activeCourses}
                    />
                </section>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content - 2 columns */}
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        {/* Today Widget */}
                        <TodayTaskList tasks={todayTasks} />
                        
                        {/* Enrolled Courses */}
                        <section>
                            <h2>My Courses</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {enrolledCourses.map(course => (
                                    <CourseCard key={course.id} {...course} />
                                ))}
                            </div>
                        </section>

                        {/* Weekly Activity Chart */}
                        <MiniChart 
                            data={weeklyActivityData} 
                            type="area" 
                        />
                    </div>

                    {/* Sidebar - 1 column */}
                    <div className="flex flex-col gap-6">
                        {/* Level Progress */}
                        <LevelProgressBar 
                            level={stats.level}
                            currentXP={stats.totalXp}
                            nextLevelXP={/* calculate */}
                        />

                        {/* Achievements */}
                        <section>
                            <h3>Recent Achievements</h3>
                            <div className="flex flex-col gap-2">
                                {recentAchievements.map(a => (
                                    <AchievementBadge key={a.id} achievement={a} />
                                ))}
                            </div>
                            {nextMilestone && (
                                <p className="text-sm">Next: {nextMilestone.name}</p>
                            )}
                        </section>

                        {/* Cohort Leaderboard */}
                        <CohortLeaderboard 
                            entries={cohortLeaderboard}
                            currentUserRank={currentUserRank}
                        />

                        {/* Tutor Messages */}
                        <TutorChatWidget 
                            messages={tutorMessages}
                            unreadCount={unreadMessageCount}
                        />

                        {/* Recent Activity */}
                        <RecentActivityFeed activities={recentActivity} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
```
Loading State:

Use Skeleton components for all sections during initial load
Implement defer props for non-critical data (leaderboard, activity feed)
Empty States:

No courses enrolled → CTA to browse courses
No tasks today → Motivational message
No achievements → "Start learning to earn badges!"
5. Add Navigation Routes and Update Sidebar
Routes (web.php):

```php
<?php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/courses', [CourseController::class, 'index'])->name('courses.index');
    Route::get('/courses/{course}', [CourseController::class, 'show'])->name('courses.show');
    Route::post('/courses/{course}/enroll', [EnrollmentController::class, 'store'])->name('courses.enroll');
    Route::get('/lessons/{lesson}', [LessonController::class, 'show'])->name('lessons.show');
    Route::post('/lessons/{lesson}/complete', [LessonController::class, 'complete'])->name('lessons.complete');
    Route::get('/achievements', [AchievementController::class, 'index'])->name('achievements.index');
    Route::get('/rewards', [RewardController::class, 'index'])->name('rewards.index');
    Route::post('/rewards/{reward}/claim', [RewardController::class, 'claim'])->name('rewards.claim');
    Route::get('/tutors', [TutorController::class, 'index'])->name('tutors.index');
    Route::get('/calendar', [CalendarController::class, 'index'])->name('calendar.index');
    Route::get('/messages', [MessageController::class, 'index'])->name('messages.index');
    Route::post('/tasks/{task}/toggle', [DailyTaskController::class, 'toggle'])->name('tasks.toggle');
});
```

Update Sidebar Navigation (resources/js/layouts/app-layout/app-sidebar/app-sidebar.tsx):
```tsx
import { 
    Home, 
    BookOpen, 
    CheckSquare, 
    Trophy, 
    Gift, 
    Users, 
    Calendar, 
    MessageSquare,
    Settings 
} from 'lucide-react';

const navItems: NavItem[] = [
    { title: 'Dashboard', href: dashboard(), icon: Home },
    { title: 'My Courses', href: courses(), icon: BookOpen },
    { title: 'Daily Tasks', href: dashboard({ hash: '#tasks' }), icon: CheckSquare },
    { title: 'Achievements', href: achievements(), icon: Trophy },
    { title: 'Rewards', href: rewards(), icon: Gift },
    { title: 'Tutors', href: tutors(), icon: Users },
    { title: 'Calendar', href: calendar(), icon: Calendar },
    { title: 'Messages', href: messages(), icon: MessageSquare },
    { title: 'Settings', href: settings(), icon: Settings },
];
```