import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { achievements } from '@/routes';
import type { AchievementsPageProps, BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Award, Medal, Star, Trophy } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Achievements',
    href: achievements().url,
  },
];

const rarityColors = {
  bronze: 'bg-orange-700/20 text-orange-400 border-orange-700',
  silver: 'bg-gray-400/20 text-gray-200 border-gray-400',
  gold: 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
  platinum: 'bg-purple-500/20 text-purple-400 border-purple-500',
};

const rarityIcons = {
  bronze: Medal,
  silver: Award,
  gold: Star,
  platinum: Trophy,
};

export default function AchievementsPage({
  achievements: achievementsData,
  summary,
}: AchievementsPageProps) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Achievements" />

      <div className="flex flex-1 flex-col gap-6 overflow-x-auto p-4 lg:p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Trophy className="size-8 text-yellow-500" />
            <h1 className="text-3xl font-bold">Achievements</h1>
          </div>
          <p className="text-muted-foreground">
            Earn badges and unlock achievements by completing challenges and
            milestones.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.earned}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((summary.earned / summary.total) * 100)}% complete
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Next Milestone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {summary.nextMilestone
                  ? summary.nextMilestone.title
                  : 'All complete!'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {achievementsData.map((achievement) => {
            const Icon = rarityIcons[achievement.rarity];
            return (
              <Card
                key={achievement.id}
                className={
                  achievement.earned ? '' : 'opacity-60 dark:opacity-40'
                }
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icon className="size-6" />
                      <CardTitle className="text-base">
                        {achievement.name}
                      </CardTitle>
                    </div>
                    <Badge
                      className={rarityColors[achievement.rarity]}
                      variant="outline"
                    >
                      {achievement.rarity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {achievement.xp_reward} XP
                    </span>
                    {achievement.earned && achievement.earned_at && (
                      <span className="text-green-600 dark:text-green-400">
                        ✓ Earned{' '}
                        {new Date(achievement.earned_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {achievementsData.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No achievements yet. Start learning to unlock them!
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
