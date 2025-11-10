import { CourseCard } from '@/components/dashboard/course-card';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardErrorBoundary } from '@/components/dashboard/dashboard-error-boundary';
import { MiniChart } from '@/components/dashboard/mini-chart';
import { StatCard } from '@/components/dashboard/stat-card';
import { TodayTaskList } from '@/components/dashboard/today-task-list';
import { ActivityChartSkeleton } from '@/components/dashboard/skeletons/activity-chart-skeleton';
import { CoursesSkeleton } from '@/components/dashboard/skeletons/courses-skeleton';
import { SidebarSkeleton } from '@/components/dashboard/skeletons/sidebar-skeleton';
import { StatsSkeleton } from '@/components/dashboard/skeletons/stats-skeleton';
import { TodayTasksSkeleton } from '@/components/dashboard/skeletons/today-tasks-skeleton';
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
import { BookOpen, Clock, Flame, Zap } from 'lucide-react';
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
      variant="accent"
    />
    <StatCard icon={Zap} label="XP This Week" value={stats.xp_this_week} />
    <StatCard icon={Clock} label="Hours Learned" value={stats.hours_learned} />
    <StatCard
      icon={BookOpen}
      label="Active Courses"
      value={stats.active_courses}
    />
  </section>
));

DashboardStatsSection.displayName = 'DashboardStatsSection';

const DashboardCoursesSection = memo(
  ({ enrolledCourses }: { enrolledCourses: Enrollment[] }) => (
    <section aria-labelledby="courses-heading">
      <h2 id="courses-heading" className="mb-4 text-xl font-semibold">
        My Courses
      </h2>
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
    <section aria-labelledby="activity-heading">
      <h2 id="activity-heading" className="mb-4 text-xl font-semibold">
        Weekly Activity
      </h2>
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

interface DashboardProps {
  stats: LearningStats;
  today_tasks: DailyTask[];
  enrolled_courses: Enrollment[];
  recent_achievements: Achievement[];
  next_milestone: Achievement | null;
  recent_activity: Activity[];
  tutor_messages: TutorMessage[];
  unread_message_count: number;
  cohort_leaderboard: LeaderboardEntry[];
  current_user_rank: number | null;
  weekly_activity_data: { name: string; value: number }[];
  available_rewards: Reward[];
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
}: DashboardProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  React.useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 250);
    return () => clearTimeout(t);
  }, []);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />

      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 lg:p-6">
        {/* KPI Overview Section */}
        <DashboardErrorBoundary>
          {isLoading ? (
            <StatsSkeleton />
          ) : (
            <DashboardStatsSection stats={stats} />
          )}
        </DashboardErrorBoundary>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - 2 columns */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Today Widget */}
            <DashboardErrorBoundary>
              {isLoading ? (
                <TodayTasksSkeleton />
              ) : (
                <TodayTaskList tasks={today_tasks} />
              )}
            </DashboardErrorBoundary>

            {/* Enrolled Courses */}
            <DashboardErrorBoundary>
              {isLoading ? (
                <CoursesSkeleton />
              ) : (
                <DashboardCoursesSection enrolledCourses={enrolled_courses} />
              )}
            </DashboardErrorBoundary>

            {/* Weekly Activity Chart */}
            {isLoading ? (
              <ActivityChartSkeleton />
            ) : (
              weekly_activity_data.length > 0 && (
                <DashboardErrorBoundary>
                  <DashboardActivityChartSection
                    weeklyActivityData={weekly_activity_data}
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
              stats={stats}
              recentAchievements={recent_achievements}
              nextMilestone={next_milestone}
              cohortLeaderboard={cohort_leaderboard}
              tutorMessages={tutor_messages}
              unreadMessageCount={unread_message_count}
              recentActivity={recent_activity}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
