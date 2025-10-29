import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp } from 'lucide-react';

interface LevelProgressBarProps {
  currentLevel: number;
  currentXp: number;
  xpForNextLevel: number;
  totalXp?: number;
  className?: string;
}

export function LevelProgressBar({
  currentLevel,
  currentXp,
  xpForNextLevel,
  totalXp,
  className,
}: LevelProgressBarProps) {
  // Prevent division by zero
  const progress = xpForNextLevel > 0 ? (currentXp / xpForNextLevel) * 100 : 0;
  const xpRemaining = xpForNextLevel > 0 ? xpForNextLevel - currentXp : 0;

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <TrendingUp className="size-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Level</p>
              <p className="text-2xl font-bold">Level {currentLevel}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">XP Progress</p>
            <p className="text-lg font-semibold">
              {currentXp.toLocaleString()} / {xpForNextLevel.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Progress
            value={progress}
            className="h-3"
            aria-label={`${Math.round(progress)}% progress to next level`}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {xpRemaining.toLocaleString()} XP to Level {currentLevel + 1}
            </span>
            {totalXp !== undefined && (
              <Badge variant="outline">
                Total: {totalXp.toLocaleString()} XP
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
