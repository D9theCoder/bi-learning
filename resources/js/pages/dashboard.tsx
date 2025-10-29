import { StatCard } from '@/components/dashboard/stat-card';
import { CourseCard } from '@/components/dashboard/course-card';
import { TodayTaskList } from '@/components/dashboard/today-task-list';
import { AchievementBadge } from '@/components/dashboard/achievement-badge';
import { LevelProgressBar } from '@/components/dashboard/level-progress-bar';
import { CohortLeaderboard } from '@/components/dashboard/cohort-leaderboard';
import { RecentActivityFeed } from '@/components/dashboard/recent-activity-feed';
import { TutorChatWidget } from '@/components/dashboard/tutor-chat-widget';
import { MiniChart } from '@/components/dashboard/mini-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { 
    BreadcrumbItem, 
    LearningStats, 
    DailyTask, 
    Enrollment, 
    Achievement, 
    Activity, 
    TutorMessage, 
    LeaderboardEntry,
    Reward 
} from '@/types';
import { Head } from '@inertiajs/react';
import { Flame, Zap, Clock, BookOpen } from 'lucide-react';

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
    current_user_rank,
    weekly_activity_data,
    available_rewards,
}: DashboardProps) {
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
                        variant="accent"
                    />
                    <StatCard 
                        icon={Zap} 
                        label="XP This Week" 
                        value={stats.xp_this_week}
                    />
                    <StatCard 
                        icon={Clock} 
                        label="Hours Learned" 
                        value={stats.hours_learned}
                    />
                    <StatCard 
                        icon={BookOpen} 
                        label="Active Courses" 
                        value={stats.active_courses}
                    />
                </section>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content - 2 columns */}
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        {/* Today Widget */}
                        <TodayTaskList tasks={today_tasks} />
                        
                        {/* Enrolled Courses */}
                        <section>
                            <h2 className="mb-4 text-xl font-semibold">My Courses</h2>
                            {enrolled_courses.length > 0 ? (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {enrolled_courses.map((enrollment) => (
                                        <CourseCard 
                                            key={enrollment.id} 
                                            enrollment={enrollment}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                                        <BookOpen className="mb-4 size-12 text-muted-foreground" />
                                        <h3 className="mb-2 font-semibold">No courses yet</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Start your learning journey by enrolling in a course!
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </section>

                        {/* Weekly Activity Chart */}
                        {weekly_activity_data.length > 0 && (
                            <section>
                                <h2 className="mb-4 text-xl font-semibold">Weekly Activity</h2>
                                <Card>
                                    <CardContent className="p-6">
                                        <MiniChart 
                                            data={weekly_activity_data} 
                                            type="area" 
                                        />
                                    </CardContent>
                                </Card>
                            </section>
                        )}
                    </div>

                    {/* Sidebar - 1 column */}
                    <div className="flex flex-col gap-6">
                        {/* Level Progress */}
                        <LevelProgressBar 
                            currentLevel={stats.level}
                            currentXp={stats.total_xp}
                            xpForNextLevel={stats.level * 1000}
                        />

                        {/* Achievements */}
                        <section>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Achievements</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {recent_achievements.length > 0 ? (
                                        <>
                                            {recent_achievements.map((achievement) => (
                                                <AchievementBadge 
                                                    key={achievement.id} 
                                                    achievement={achievement}
                                                />
                                            ))}
                                            {next_milestone && (
                                                <p className="mt-4 text-sm text-muted-foreground">
                                                    Next: {next_milestone.name}
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

                        {/* Cohort Leaderboard */}
                        {cohort_leaderboard.length > 0 && (
                            <CohortLeaderboard 
                                entries={cohort_leaderboard}
                                currentUserRank={current_user_rank}
                            />
                        )}

                        {/* Tutor Messages */}
                        {tutor_messages.length > 0 && (
                            <TutorChatWidget 
                                messages={tutor_messages}
                                unreadCount={unread_message_count}
                            />
                        )}

                        {/* Recent Activity */}
                        {recent_activity.length > 0 && (
                            <RecentActivityFeed activities={recent_activity} />
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
