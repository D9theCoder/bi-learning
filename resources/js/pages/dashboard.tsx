import { AchievementBadge } from '@/components/dashboard/achievement-badge';
import { CohortLeaderboard } from '@/components/dashboard/cohort-leaderboard';
import { CourseCard } from '@/components/dashboard/course-card';
import { LevelProgressBar } from '@/components/dashboard/level-progress-bar';
import { MiniChart } from '@/components/dashboard/mini-chart';
import { RecentActivityFeed } from '@/components/dashboard/recent-activity-feed';
import { StatCard } from '@/components/dashboard/stat-card';
import { TodayTaskList } from '@/components/dashboard/today-task-list';
import { TutorChatWidget } from '@/components/dashboard/tutor-chat-widget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
const XP_PER_LEVEL = 1000;
const CHART_HEIGHT = 200;

// Error boundary component for dashboard sections
interface DashboardErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface DashboardErrorBoundaryProps {
  children: React.ReactNode;
}

class DashboardErrorBoundary extends React.Component<
  DashboardErrorBoundaryProps,
  DashboardErrorBoundaryState
> {
  constructor(props: DashboardErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): DashboardErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard section error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Unable to load this section. Please try refreshing the page.
            </p>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Memoized components for performance optimization
const StatsSkeleton = memo(() => (
  <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" aria-label="Loading statistics">
    {[0, 1, 2, 3].map((i) => (
      <Card key={i}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </section>
));

StatsSkeleton.displayName = 'StatsSkeleton';

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

const CoursesSkeleton = memo(() => (
  <section aria-labelledby="courses-heading">
    <h2 id="courses-heading" className="mb-4 text-xl font-semibold">
      My Courses
    </h2>
    <div className="grid gap-4 md:grid-cols-2">
      {[0, 1].map((i) => (
        <Card key={i}>
          <CardHeader className="relative p-0">
            <Skeleton className="aspect-video w-full rounded-t-lg" />
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
          </CardContent>
        </Card>
      ))}
    </div>
  </section>
));

CoursesSkeleton.displayName = 'CoursesSkeleton';

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
              Start your learning journey by enrolling in a course!
              Welcome to bi-lear
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

const ActivityChartSkeleton = memo(() => (
  <section aria-labelledby="activity-heading">
    <h2 id="activity-heading" className="text-xl font-semibold">
      Weekly Activity
    </h2>
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-16 w-full" />
      </CardContent>
    </Card>
  </section>
));

ActivityChartSkeleton.displayName = 'ActivityChartSkeleton';

const TodayTasksSkeleton = memo(() => (
  <Card>
    <CardContent className="space-y-3 p-6">
      <Skeleton className="h-5 w-40" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-4 w-4 rounded-sm" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="ml-auto h-4 w-16" />
        </div>
      ))}
      <Skeleton className="h-2 w-full" />
    </CardContent>
  </Card>
));

TodayTasksSkeleton.displayName = 'TodayTasksSkeleton';

const DashboardSidebar = memo(
  ({
    stats,
    recentAchievements,
    nextMilestone,
    cohortLeaderboard,
    tutorMessages,
    unreadMessageCount,
    recentActivity,
  }: {
    stats: LearningStats;
    recentAchievements: Achievement[];
    nextMilestone: Achievement | null;
    cohortLeaderboard: LeaderboardEntry[];
    tutorMessages: TutorMessage[];
    unreadMessageCount: number;
    recentActivity: Activity[];
  }) => (
    <div
      className="flex flex-col gap-6"
      role="complementary"
      aria-label="Dashboard sidebar"
    >
      {/* Level Progress */}
      <DashboardErrorBoundary>
        <LevelProgressBar
          currentLevel={stats.level}
          currentXp={stats.total_xp}
          xpForNextLevel={stats.level * XP_PER_LEVEL}
          totalXp={stats.total_xp}
        />
      </DashboardErrorBoundary>

      {/* Achievements */}
      <DashboardErrorBoundary>
        <section aria-labelledby="achievements-heading">
          <Card>
            <CardHeader>
              <CardTitle id="achievements-heading" className="pt-6">
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentAchievements.length > 0 ? (
                <>
                  {recentAchievements.map((achievement) => (
                    <AchievementBadge
                      key={achievement.id}
                      achievement={achievement}
                      unlocked={!!achievement.earned_at}
                      unlockedAt={achievement.earned_at}
                    />
                  ))}
                  {nextMilestone && (
                    <p className="mt-4 pb-6 text-sm text-muted-foreground">
                      Next: {nextMilestone.name}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  Start learning to earn badges!
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      </DashboardErrorBoundary>

      {/* Cohort Leaderboard */}
      {cohortLeaderboard.length > 0 && (
        <DashboardErrorBoundary>
          <CohortLeaderboard entries={cohortLeaderboard} />
        </DashboardErrorBoundary>
      )}

      {/* Tutor Messages */}
      {tutorMessages.length > 0 && (
        <DashboardErrorBoundary>
          <TutorChatWidget
            messages={tutorMessages}
            unreadCount={unreadMessageCount}
          />
        </DashboardErrorBoundary>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <DashboardErrorBoundary>
          <RecentActivityFeed activities={recentActivity} />
        </DashboardErrorBoundary>
      )}
    </div>
  ),
);

DashboardSidebar.displayName = 'DashboardSidebar';

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
          {isLoading ? <StatsSkeleton /> : <DashboardStatsSection stats={stats} />}
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
            <div className="flex flex-col gap-6">
              <Card>
                <CardContent className="space-y-3 p-6">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Skeleton className="h-5 w-40" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Skeleton className="h-5 w-32" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="ml-auto h-4 w-10" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
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
