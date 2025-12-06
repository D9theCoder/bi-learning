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

// ! Removed DashboardProps interface

// ! Dummy Data
const dummyStats: LearningStats = {
  streak: 5,
  xp_this_week: 1250,
  hours_learned: 12.5,
  active_courses: 2,
  total_xp: 5000,
  level: 10,
  points_balance: 500,
};

const dummyTodayTasks: DailyTask[] = [
  {
    id: 1,
    user_id: 1,
    title: 'Complete Chapter 1 Quiz',
    is_completed: false,
    xp_reward: 50,
    due_date: '2024-05-20',
    type: 'quiz',
    estimated_minutes: 15,
    created_at: '2024-05-19',
  },
  {
    id: 2,
    user_id: 1,
    title: 'Watch "Hooks in Depth"',
    is_completed: true,
    xp_reward: 30,
    due_date: '2024-05-20',
    type: 'lesson',
    estimated_minutes: 20,
    created_at: '2024-05-19',
  },
];

const dummyEnrolledCourses: Enrollment[] = [
  {
    id: 1,
    course_id: 1,
    user_id: 1,
    progress_percentage: 45,
    status: 'active',
    enrolled_at: '2024-01-01',
    last_activity_at: '2024-05-19',
    course: {
      id: 1,
      title: 'Introduction to React',
      description: 'Learn the basics of React.',
      thumbnail: 'https://placehold.co/600x400/png',
      difficulty: 'beginner',
      duration_minutes: 300,
      instructor_id: 1,
      instructor: {
        id: 1,
        name: 'John Doe',
        avatar: 'https://ui-avatars.com/api/?name=John+Doe',
        email: 'john@example.com',
        email_verified_at: '2023-01-01',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      },
      category: 'Web Development',
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
    },
  },
  {
    id: 2,
    course_id: 2,
    user_id: 1,
    progress_percentage: 10,
    status: 'active',
    enrolled_at: '2024-03-01',
    last_activity_at: '2024-05-18',
    course: {
      id: 2,
      title: 'Advanced React Patterns',
      description: 'Master advanced React concepts.',
      thumbnail: 'https://placehold.co/600x400/png',
      difficulty: 'advanced',
      duration_minutes: 480,
      instructor_id: 2,
      instructor: {
        id: 2,
        name: 'Jane Smith',
        avatar: 'https://ui-avatars.com/api/?name=Jane+Smith',
        email: 'jane@example.com',
        email_verified_at: '2023-01-01',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      },
      category: 'Web Development',
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
    },
  },
];

const dummyRecentAchievements: Achievement[] = [
  {
    id: 1,
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: 'trophy',
    criteria: 'Complete 1 lesson',
    rarity: 'bronze',
    xp_reward: 50,
    created_at: '2024-01-01',
    earned_at: '2024-01-02',
    category: 'Learning',
    progress: 1,
    target: 1,
  },
  {
    id: 2,
    name: 'Quiz Master',
    description: 'Score 100% on a quiz',
    icon: 'star',
    criteria: 'Score 100% on a quiz',
    rarity: 'silver',
    xp_reward: 100,
    created_at: '2024-01-01',
    earned_at: '2024-02-15',
    category: 'Analysis',
    progress: 1,
    target: 1,
  },
];

const dummyNextMilestone: Achievement = {
  id: 3,
  name: 'Dedicated Learner',
  description: 'Maintain a 7-day streak',
  icon: 'flame',
  criteria: '7 day streak',
  rarity: 'gold',
  xp_reward: 200,
  created_at: '2024-01-01',
  category: 'Streak',
  progress: 5,
  target: 7,
};

const dummyRecentActivity: Activity[] = [
  {
    id: 1,
    user_id: 1,
    type: 'lesson_completed',
    description: 'Completed lesson "React Components"',
    xp_earned: 50,
    created_at: '2 hours ago',
  },
  {
    id: 2,
    user_id: 1,
    type: 'achievement_earned',
    description: 'Unlocked "Night Owl"',
    xp_earned: 100,
    created_at: '5 hours ago',
  },
];

const dummyTutorMessages: TutorMessage[] = [
  {
    id: 1,
    tutor_id: 1,
    user_id: 1,
    content: 'Great job on the last assignment!',
    is_read: false,
    sent_at: '10 mins ago',
    created_at: '10 mins ago',
    tutor: {
      id: 1,
      name: 'John Doe',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe',
      email: 'john@example.com',
      email_verified_at: '2023-01-01',
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
    },
  },
];

const dummyCohortLeaderboard: LeaderboardEntry[] = [
  {
    id: 1,
    name: 'Kevin',
    avatar: 'https://ui-avatars.com/api/?name=Kevin',
    xp: 1500,
    level: 5,
    rank: 1,
    isCurrentUser: true,
  },
  {
    id: 2,
    name: 'Alice',
    avatar: 'https://ui-avatars.com/api/?name=Alice',
    xp: 1450,
    level: 4,
    rank: 2,
    isCurrentUser: false,
  },
  {
    id: 3,
    name: 'Bob',
    avatar: 'https://ui-avatars.com/api/?name=Bob',
    xp: 1300,
    level: 4,
    rank: 3,
    isCurrentUser: false,
  },
];

const dummyWeeklyActivityData = [
  { name: 'Mon', value: 120 },
  { name: 'Tue', value: 200 },
  { name: 'Wed', value: 150 },
  { name: 'Thu', value: 300 },
  { name: 'Fri', value: 250 },
  { name: 'Sat', value: 180 },
  { name: 'Sun', value: 50 },
];

// Local component for Activity Icon to avoid import issues or just import it at top if possible, but for now lets rename the icon used in header
import { Activity as ActivityIcon } from 'lucide-react';

// ! Modified component to use dummy data
export default function Dashboard() {
  const [isLoading, setIsLoading] = React.useState(true);
  React.useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 250);
    return () => clearTimeout(t);
  }, []);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />

      <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto p-4 lg:p-8">
        {/* Welcome Header */}
        <div className="flex flex-col gap-2">
          <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight lg:text-4xl">
            Welcome back, Kevin!
          </h1>
          <p className="text-muted-foreground">
            Ready to continue your learning streak? You're doing great!
          </p>
        </div>

        {/* KPI Overview Section */}
        <DashboardErrorBoundary>
          {isLoading ? (
            <StatsSkeleton />
          ) : (
            <DashboardStatsSection stats={dummyStats} />
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
                <TodayTaskList tasks={dummyTodayTasks} />
              )}
            </DashboardErrorBoundary>

            {/* Enrolled Courses */}
            <DashboardErrorBoundary>
              {isLoading ? (
                <CoursesSkeleton />
              ) : (
                <DashboardCoursesSection
                  enrolledCourses={dummyEnrolledCourses}
                />
              )}
            </DashboardErrorBoundary>

            {/* Weekly Activity Chart */}
            {isLoading ? (
              <ActivityChartSkeleton />
            ) : (
              dummyWeeklyActivityData.length > 0 && (
                <DashboardErrorBoundary>
                  <DashboardActivityChartSection
                    weeklyActivityData={dummyWeeklyActivityData}
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
              stats={dummyStats}
              recentAchievements={dummyRecentAchievements}
              nextMilestone={dummyNextMilestone}
              cohortLeaderboard={dummyCohortLeaderboard}
              tutorMessages={dummyTutorMessages}
              unreadMessageCount={1}
              recentActivity={dummyRecentActivity}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
