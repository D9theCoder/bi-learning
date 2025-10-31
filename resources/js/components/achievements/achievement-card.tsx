import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Achievement } from '@/types';
import { Award, Medal, Star, Trophy } from 'lucide-react';

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

interface AchievementCardProps {
  achievement: Achievement & { earned?: boolean; earned_at?: string };
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const Icon = rarityIcons[achievement.rarity];

  return (
    <Card className={achievement.earned ? '' : 'opacity-60 dark:opacity-40'}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon className="size-6" />
            <CardTitle className="text-base">{achievement.name}</CardTitle>
          </div>
          <Badge className={rarityColors[achievement.rarity]} variant="outline">
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
              ✓ Earned {new Date(achievement.earned_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
