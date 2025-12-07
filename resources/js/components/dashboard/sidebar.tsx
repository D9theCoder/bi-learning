import { AchievementBadge } from '@/components/dashboard/achievement-badge';
import { CohortLeaderboard } from '@/components/dashboard/cohort-leaderboard';
import { DashboardErrorBoundary } from '@/components/dashboard/dashboard-error-boundary';
import { LevelProgressBar } from '@/components/dashboard/level-progress-bar';
import { RecentActivityFeed } from '@/components/dashboard/recent-activity-feed';
import { TutorChatWidget } from '@/components/dashboard/tutor-chat-widget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
          <Card className="gap-4 pb-4 pt-6">
            <CardHeader className="pb-0">
              <CardTitle id="achievements-heading">
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
                    <div className="mt-4 border-t pt-4">
                      <p className="mb-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                        Next Milestone
                      </p>
                      <AchievementBadge
                        achievement={nextMilestone}
                        unlocked={false}
                      />
                    </div>
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
