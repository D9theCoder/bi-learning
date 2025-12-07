import { CourseCard } from '@/components/dashboard/course-card';
import { DashboardErrorBoundary } from '@/components/dashboard/dashboard-error-boundary';
import { MiniChart } from '@/components/dashboard/mini-chart';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { ActivityChartSkeleton } from '@/components/dashboard/skeletons/activity-chart-skeleton';
import { CoursesSkeleton } from '@/components/dashboard/skeletons/courses-skeleton';
import { SidebarSkeleton } from '@/components/dashboard/skeletons/sidebar-skeleton';
import { StatsSkeleton } from '@/components/dashboard/skeletons/stats-skeleton';
import { TodayTasksSkeleton } from '@/components/dashboard/skeletons/today-tasks-skeleton';
import { StatCard } from '@/components/dashboard/stat-card';
import { TodayTaskList } from '@/components/dashboard/today-task-list';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type {
  Achievement,
  Activity,
  BreadcrumbItem,
  DailyTask,
  Enrollment,
  LeaderboardEntry,
  LearningStats,
  Reward,
  TutorMessage,
} from '@/types';
import { Head } from '@inertiajs/react';
import { Activity as ActivityIcon, BookOpen, Clock, Coins, Flame, Zap } from 'lucide-react';
import React, { memo } from 'react';

// Constants for magic numbers
const CHART_HEIGHT = 200;

// Memoized components for performance optimization

const DashboardStatsSection = memo(({ stats }: { stats: LearningStats }) => (
  <section
    className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
    aria-label="Learning statistics"
  >
    <StatCard
      icon={Flame}
      label="Current Streak"
      value={`${stats.streak} days`}
      color="orange"
    />
    <StatCard
      icon={Zap}
      label="XP This Week"
      value={stats.xp_this_week}
      color="yellow"
    />
    <StatCard
      icon={Clock}
      label="Hours Learned"
      value={stats.hours_learned}
      color="blue"
    />
    <StatCard
      icon={BookOpen}
      label="Active Courses"
      value={stats.active_courses}
      color="purple"
    />
  </section>
));

DashboardStatsSection.displayName = 'DashboardStatsSection';

const DashboardCoursesSection = memo(
  ({ enrolledCourses }: { enrolledCourses: Enrollment[] }) => (
    <section aria-labelledby="courses-heading" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2
          id="courses-heading"
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground"
        >
          <BookOpen className="size-5 text-primary" />
          My Courses
        </h2>
        <span className="cursor-pointer text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
          View All
        </span>
      </div>
      {enrolledCourses.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2" role="list">
          {enrolledCourses.map((enrollment) => (
            <CourseCard key={enrollment.id} enrollment={enrollment} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <BookOpen className="mb-4 size-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold">No courses yet</h3>
            <p className="text-sm text-muted-foreground">
              Start your learning journey by enrolling in a course! Welcome to
              bi-lear
            </p>
          </CardContent>
        </Card>
      )}
    </section>
  ),
);

DashboardCoursesSection.displayName = 'DashboardCoursesSection';

const DashboardActivityChartSection = memo(
  ({
    weeklyActivityData,
  }: {
    weeklyActivityData: { name: string; value: number }[];
  }) => (
    <section aria-labelledby="activity-heading" className="space-y-4">
      <div className="flex items-center gap-2">
        <ActivityIcon className="size-5 text-primary" />
        <h2
          id="activity-heading"
          className="text-xl font-bold tracking-tight text-foreground"
        >
          Weekly Activity
        </h2>
      </div>
      <Card>
        <CardContent>
          <MiniChart
            data={weeklyActivityData}
            type="area"
            height={CHART_HEIGHT}
            xAxisLabel="Day"
            yAxisLabel="XP"
            showGrid
            showAxes
            showAxisLabels
            compact
          />
        </CardContent>
      </Card>
    </section>
  ),
);

DashboardActivityChartSection.displayName = 'DashboardActivityChartSection';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: dashboard().url,
  },
];

interface DashboardPageProps {
  stats: LearningStats;
  today_tasks: DailyTask[];
  enrolled_courses: Enrollment[];
  recent_achievements: Achievement[];
  next_milestone: Achievement | null;
  recent_activity: Activity[];
  tutor_messages: TutorMessage[];
  unread_message_count: number;
  cohort_leaderboard: LeaderboardEntry[];
  weekly_activity_data: { name: string; value: number }[];
  available_rewards?: Reward[];
  current_user_rank?: number | null;
}

export default function Dashboard({
  stats,
  today_tasks,
  enrolled_courses,
  recent_achievements,
  next_milestone,
  recent_activity,
  tutor_messages,
  unread_message_count,
  cohort_leaderboard,
  weekly_activity_data,
}: DashboardPageProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  React.useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 250);
    return () => clearTimeout(t);
  }, []);

  const safeStats: LearningStats = {
    streak: stats?.streak ?? 0,
    xp_this_week: stats?.xp_this_week ?? 0,
    hours_learned: stats?.hours_learned ?? 0,
    active_courses: stats?.active_courses ?? 0,
    total_xp: stats?.total_xp ?? 0,
    level: stats?.level ?? 1,
    points_balance: stats?.points_balance ?? 0,
  };

  const todayTasks = today_tasks ?? [];
  const enrolledCourses = enrolled_courses ?? [];
  const recentAchievements = recent_achievements ?? [];
  const cohortLeaderboard = cohort_leaderboard ?? [];
  const tutorMessages = tutor_messages ?? [];
  const recentActivity = recent_activity ?? [];
  const weeklyActivityData = weekly_activity_data ?? [];
  const nextMilestone = next_milestone ?? null;
  const unreadMessageCount =
    unread_message_count ??
    tutorMessages.filter((message) => message.is_read === false).length;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />

      <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto p-4 lg:p-8">
        {/* Welcome Header */}
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight lg:text-4xl">
              Welcome back, Kevin!
            </h1>
            <p className="text-muted-foreground">
              Ready to continue your learning streak? You're doing great!
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground">
            <Coins className="size-4 text-primary" />
            <span className="text-foreground">Points</span>
            <span className="text-lg font-bold text-foreground">{safeStats.points_balance}</span>
          </div>
        </div>

        {/* KPI Overview Section */}
        <DashboardErrorBoundary>
          {isLoading ? (
            <StatsSkeleton />
          ) : (
            <DashboardStatsSection stats={safeStats} />
          )}
        </DashboardErrorBoundary>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content - 2 columns */}
          <div className="flex flex-col gap-8 lg:col-span-2">
            {/* Today Widget */}
            <DashboardErrorBoundary>
              {isLoading ? (
                <TodayTasksSkeleton />
              ) : (
                <TodayTaskList tasks={todayTasks} />
              )}
            </DashboardErrorBoundary>

            {/* Enrolled Courses */}
            <DashboardErrorBoundary>
              {isLoading ? (
                <CoursesSkeleton />
              ) : (
                <DashboardCoursesSection enrolledCourses={enrolledCourses} />
              )}
            </DashboardErrorBoundary>

            {/* Weekly Activity Chart */}
            {isLoading ? (
              <ActivityChartSkeleton />
            ) : (
              weeklyActivityData.length > 0 && (
                <DashboardErrorBoundary>
                  <DashboardActivityChartSection
                    weeklyActivityData={weeklyActivityData}
                  />
                </DashboardErrorBoundary>
              )
            )}
          </div>

          {/* Sidebar - 1 column */}
          {isLoading ? (
            <SidebarSkeleton />
          ) : (
            <DashboardSidebar
              stats={safeStats}
              recentAchievements={recentAchievements}
              nextMilestone={nextMilestone}
              cohortLeaderboard={cohortLeaderboard}
              tutorMessages={tutorMessages}
              unreadMessageCount={unreadMessageCount}
              recentActivity={recentActivity}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
