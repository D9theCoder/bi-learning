import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Achievement } from '@/types';
import { Award, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementBadgeProps {
    achievement: Achievement;
    unlocked?: boolean;
    unlockedAt?: string;
    className?: string;
}

export function AchievementBadge({ achievement, unlocked = false, unlockedAt, className }: AchievementBadgeProps) {
    return (
        <Card className={cn(
            'transition-all hover:shadow-md',
            !unlocked && 'opacity-50 grayscale',
            className
        )}>
            <CardContent className="flex items-center gap-4 p-4">
                <div className={cn(
                    'flex size-14 items-center justify-center rounded-full',
                    unlocked 
                        ? 'bg-yellow-500/10 text-yellow-500 dark:bg-yellow-500/20' 
                        : 'bg-muted text-muted-foreground'
                )}>
                    {unlocked ? (
                        <Award className="size-7" />
                    ) : (
                        <Lock className="size-7" />
                    )}
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold">{achievement.name}</h4>
                    <p className="text-xs text-muted-foreground">
                        {achievement.description}
                    </p>
                    {unlocked && unlockedAt && (
                        <Badge variant="outline" className="mt-2">
                            Unlocked {new Date(unlockedAt).toLocaleDateString()}
                        </Badge>
                    )}
                    {achievement.xp_reward && (
                        <Badge variant="secondary" className="mt-2">
                            +{achievement.xp_reward} XP
                        </Badge>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
