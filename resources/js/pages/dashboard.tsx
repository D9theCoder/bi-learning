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
import { TutorChatWidget } from '@/components/dashboard/tutor-chat-widget';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { useRoles } from '@/hooks/use-roles';
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
  TutorDashboardData,
  User,
} from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
  Activity as ActivityIcon,
  BarChart3,
  BookOpen,
  Calendar as CalendarIcon,
  Clock,
  Coins,
  Flame,
  GraduationCap,
  Users,
  Zap,
} from 'lucide-react';
import React, { memo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';

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
      animate={stats.streak > 0}
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

const TutorStatsSection = memo(
  ({
    summary,
    attendanceAverage,
    assignmentAverage,
  }: {
    summary: TutorDashboardData['summary'];
    attendanceAverage: number;
    assignmentAverage: number;
  }) => (
    <section
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      aria-label="Tutor statistics"
    >
      <StatCard
        icon={GraduationCap}
        label="Courses Taught"
        value={summary.course_count}
        color="blue"
        disableHover
      />
      <StatCard
        icon={Users}
        label="Students"
        value={summary.student_count}
        color="purple"
        disableHover
      />
      <StatCard
        icon={BarChart3}
        label="Avg Progress"
        value={`${summary.average_progress}%`}
        color="green"
        disableHover
      />
      <StatCard
        icon={ActivityIcon}
        label="Attendance vs Assign."
        value={`${attendanceAverage}% / ${assignmentAverage}%`}
        color="orange"
        disableHover
      />
    </section>
  ),
);

TutorStatsSection.displayName = 'TutorStatsSection';

const TutorActivityChartSection = memo(
  ({ data }: { data: TutorDashboardData['chart'] }) => (
    <section aria-labelledby="tutor-activity-heading" className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="size-5 text-primary" />
        <h2
          id="tutor-activity-heading"
          className="text-xl font-bold tracking-tight text-foreground"
        >
          Course Activity (Attendance vs Assignments)
        </h2>
      </div>
      <Card>
        <CardContent className="p-4">
          {data.length === 0 ? (
            <p className="text-sm text-muted-foreground">No courses yet.</p>
          ) : (
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} barCategoryGap={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.25} />
                  <XAxis
                    dataKey="course"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    tickMargin={6}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    tickMargin={6}
                    unit="%"
                  />
                  <RechartsTooltip
                    contentStyle={{
                      background: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: 'var(--foreground)' }}
                  />
                  <Legend />
                  <Bar
                    dataKey="attendance"
                    name="Attendance"
                    fill="var(--chart-1)"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="assignments"
                    name="Assignments"
                    fill="var(--chart-2)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  ),
);

TutorActivityChartSection.displayName = 'TutorActivityChartSection';

const TutorCourseListSection = memo(
  ({ courses }: { courses: TutorDashboardData['courses'] }) => (
    <section aria-labelledby="tutor-courses-heading" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2
          id="tutor-courses-heading"
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground"
        >
          <BookOpen className="size-5 text-primary" />
          Courses you teach
        </h2>
        <Link
          href="/courses/manage"
          prefetch
          className="text-sm font-semibold text-primary transition hover:opacity-80"
        >
          Manage courses
        </Link>
      </div>
      {courses.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No courses yet. Create your first course to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-base font-semibold text-foreground">
                      {course.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {course.student_count} students · {course.active_students} active
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      course.is_published
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {course.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Avg progress</span>
                    <span className="font-semibold text-foreground">
                      {course.average_progress}%
                    </span>
                  </div>
                  <Progress value={course.average_progress} />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Attendance rate</span>
                    <span className="font-semibold text-foreground">
                      {course.attendance_rate}%
                    </span>
                  </div>
                  <Progress value={course.attendance_rate} />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Assignment completion</span>
                    <span className="font-semibold text-foreground">
                      {course.assignment_rate}%
                    </span>
                  </div>
                  <Progress value={course.assignment_rate} />
                </div>
                {course.next_due_date && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarIcon className="size-4" />
                    Next deadline: {course.next_due_date}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  ),
);

TutorCourseListSection.displayName = 'TutorCourseListSection';

const TutorCalendarSection = memo(
  ({ items }: { items: TutorDashboardData['calendar'] }) => (
    <section aria-labelledby="tutor-calendar-heading" className="space-y-4">
      <div className="flex items-center gap-2">
        <CalendarIcon className="size-5 text-primary" />
        <h2
          id="tutor-calendar-heading"
          className="text-xl font-bold tracking-tight text-foreground"
        >
          Upcoming deadlines
        </h2>
      </div>
      <Card>
        <CardContent className="p-4">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-foreground">{item.title}</span>
                    <span className="text-xs text-muted-foreground">{item.course_title}</span>
                    <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {item.type}
                    </span>
                  </div>
                  <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground">
                    {item.due_date}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  ),
);

TutorCalendarSection.displayName = 'TutorCalendarSection';

const TutorRosterSection = memo(
  ({ roster }: { roster: TutorDashboardData['roster'] }) => (
    <section aria-labelledby="tutor-roster-heading" className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="size-5 text-primary" />
        <h2
          id="tutor-roster-heading"
          className="text-xl font-bold tracking-tight text-foreground"
        >
          Student snapshot
        </h2>
      </div>
      <Card>
        <CardContent className="p-4">
          {roster.length === 0 ? (
            <p className="text-sm text-muted-foreground">No students yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {roster.map((student) => (
                <div key={student.id} className="space-y-2 rounded-lg border border-border/60 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                        {student.name.charAt(0)}
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-sm font-semibold text-foreground">
                          {student.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {student.courses} course{student.courses === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {student.average_progress}%
                    </span>
                  </div>
                  <Progress value={student.average_progress} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  ),
);

TutorRosterSection.displayName = 'TutorRosterSection';

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
  tutor_dashboard?: TutorDashboardData | null;
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
  tutor_dashboard,
}: DashboardPageProps) {
  const { isAdmin, isTutor } = useRoles();

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
  const tutorData = tutor_dashboard ?? null;
  const tutorChart = tutorData?.chart ?? [];
  const attendanceAverage =
    tutorChart.length > 0
      ? Math.round(
          tutorChart.reduce((sum, entry) => sum + entry.attendance, 0) /
            tutorChart.length,
        )
      : 0;
  const assignmentAverage =
    tutorChart.length > 0
      ? Math.round(
          tutorChart.reduce((sum, entry) => sum + entry.assignments, 0) /
            tutorChart.length,
        )
      : 0;
  const isTutorView = isTutor || isAdmin;
  const page = usePage<{ auth?: { user?: User } }>();
  const userName = page.props.auth?.user?.name ?? 'there';

  if (isTutorView) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Dashboard" />
        <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto p-4 lg:p-8">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight lg:text-4xl">
                Welcome back, {userName}!
              </h1>
              <p className="text-muted-foreground">
                Monitor your classes, student activity, and upcoming deadlines at a glance.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground">
              <Coins className="size-4 text-primary" />
              <span className="text-foreground">Points</span>
              <span className="text-lg font-bold text-foreground">{safeStats.points_balance}</span>
            </div>
          </div>

          <DashboardErrorBoundary>
            {isLoading ? (
              <StatsSkeleton />
            ) : tutorData ? (
              <TutorStatsSection
                summary={tutorData.summary}
                attendanceAverage={attendanceAverage}
                assignmentAverage={assignmentAverage}
              />
            ) : null}
          </DashboardErrorBoundary>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="flex flex-col gap-8 lg:col-span-2">
              {isLoading ? (
                <ActivityChartSkeleton />
              ) : tutorData ? (
                <DashboardErrorBoundary>
                  <TutorActivityChartSection data={tutorData.chart} />
                </DashboardErrorBoundary>
              ) : null}

              {isLoading ? (
                <CoursesSkeleton />
              ) : tutorData ? (
                <DashboardErrorBoundary>
                  <TutorCourseListSection courses={tutorData.courses} />
                </DashboardErrorBoundary>
              ) : null}
            </div>

            <div className="flex flex-col gap-6">
              {isLoading ? (
                <SidebarSkeleton />
              ) : (
                <>
                  {tutorData ? (
                    <DashboardErrorBoundary>
                      <TutorCalendarSection items={tutorData.calendar} />
                    </DashboardErrorBoundary>
                  ) : null}
                  {tutorData ? (
                    <DashboardErrorBoundary>
                      <TutorRosterSection roster={tutorData.roster} />
                    </DashboardErrorBoundary>
                  ) : null}
                  {tutorMessages.length > 0 ? (
                    <DashboardErrorBoundary>
                      <TutorChatWidget
                        messages={tutorMessages}
                        unreadCount={unreadMessageCount}
                      />
                    </DashboardErrorBoundary>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />

      <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto p-4 lg:p-8">
        {/* Welcome Header */}
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight lg:text-4xl">
              Welcome back, {userName}!
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
