import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { DailyTask } from '@/types';
import { CheckCircle2, Circle, ScrollText, Zap } from 'lucide-react';

interface TodayTaskListProps {
  tasks: DailyTask[];
  onToggle?: (taskId: number) => void;
  className?: string;
}

export function TodayTaskList({ tasks, className }: TodayTaskListProps) {
  const completedCount = tasks.filter((task) => task.is_completed).length;
  const totalCount = tasks.length;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <ScrollText className="size-5" /> Daily Quests
        </CardTitle>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {completedCount}/{totalCount} Completed
        </Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="flex flex-col gap-3">
            {tasks.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                No quests available today
              </p>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    'group flex items-start gap-4 rounded-xl border bg-card p-4 transition-all hover:border-accent hover:bg-accent hover:shadow-sm',
                    task.is_completed
                      ? 'bg-muted/50 opacity-60'
                      : 'border-muted',
                  )}
                >
                  <div className="mt-0.5">
                    {task.is_completed ? (
                      <CheckCircle2 className="size-5 text-green-500" />
                    ) : (
                      <Circle className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <label
                      className={cn(
                        'cursor-pointer text-sm leading-none font-semibold',
                        task.is_completed &&
                          'text-muted-foreground line-through',
                      )}
                    >
                      {task.title}
                    </label>
                    {task.description && (
                      <p className="text-xs text-muted-foreground">
                        {task.description}
                      </p>
                    )}
                    {task.xp_reward && (
                      <div className="pt-2">
                        <Badge
                          variant="secondary"
                          className="border-none bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                        >
                          <Zap className="mr-1 size-3 fill-yellow-700" /> +
                          {task.xp_reward} XP
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
