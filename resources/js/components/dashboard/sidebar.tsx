import { AchievementBadge } from '@/components/dashboard/achievement-badge';
import { CohortLeaderboard } from '@/components/dashboard/cohort-leaderboard';
import { DashboardErrorBoundary } from '@/components/dashboard/dashboard-error-boundary';
import { LevelProgressBar } from '@/components/dashboard/level-progress-bar';
import { RecentActivityFeed } from '@/components/dashboard/recent-activity-feed';
import { TutorChatWidget } from '@/components/dashboard/tutor-chat-widget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type {
  Achievement,
  Activity,
  LeaderboardEntry,
  LearningStats,
  TutorMessage,
} from '@/types';
import { memo } from 'react';

const XP_PER_LEVEL = 1000;

interface DashboardSidebarProps {
  stats: LearningStats;
  recentAchievements: Achievement[];
  nextMilestone: Achievement | null;
  cohortLeaderboard: LeaderboardEntry[];
  tutorMessages: TutorMessage[];
  unreadMessageCount: number;
  recentActivity: Activity[];
}

export const DashboardSidebar = memo(
  ({
    stats,
    recentAchievements,
    nextMilestone,
    cohortLeaderboard,
    tutorMessages,
    unreadMessageCount,
    recentActivity,
  }: DashboardSidebarProps) => (
    <div
      className="flex flex-col gap-6"
      role="complementary"
      aria-label="Dashboard sidebar"
    >
      {/* Level Progress - Sticky */}
      <div className="sticky top-4 z-10">
        <DashboardErrorBoundary>
            <LevelProgressBar
            currentLevel={stats.level}
            currentXp={stats.total_xp}
            xpForNextLevel={stats.level * XP_PER_LEVEL}
            totalXp={stats.total_xp}
            />
        </DashboardErrorBoundary>
      </div>

      {/* Achievements - Trophy Case */}
      <DashboardErrorBoundary>
        <section aria-labelledby="achievements-heading">
          <Card className="gap-4 pb-4 pt-6">
            <CardHeader className="pb-0">
              <CardTitle id="achievements-heading">
                Trophy Case
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentAchievements.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                   <TooltipProvider>
                      {recentAchievements.map((achievement) => (
                        <Tooltip key={achievement.id}>
                            <TooltipTrigger asChild>
                                <div>
                                    <AchievementBadge
                                    achievement={achievement}
                                    unlocked={!!achievement.earned_at}
                                    unlockedAt={achievement.earned_at}
                                    variant="tile"
                                    />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-semibold">{achievement.name}</p>
                                <p className="text-xs text-muted-foreground">{achievement.description}</p>
                                {achievement.earned_at && (
                                    <p className="text-[10px] text-green-500 mt-1">Unlocked: {new Date(achievement.earned_at).toLocaleDateString()}</p>
                                )}
                            </TooltipContent>
                        </Tooltip>
                      ))}
                      {nextMilestone && (
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <div>
                                    <AchievementBadge
                                        achievement={nextMilestone}
                                        unlocked={false}
                                        variant="tile"
                                        className="border-dashed"
                                    />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-semibold">Next Goal: {nextMilestone.name}</p>
                                <p className="text-xs text-muted-foreground">{nextMilestone.description}</p>
                            </TooltipContent>
                         </Tooltip>
                      )}
                   </TooltipProvider>
                </div>
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
