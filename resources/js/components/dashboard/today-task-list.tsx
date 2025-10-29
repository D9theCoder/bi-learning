import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { DailyTask } from '@/types';
import { CheckCircle2, Circle } from 'lucide-react';

interface TodayTaskListProps {
  tasks: DailyTask[];
  onToggle?: (taskId: number) => void;
  className?: string;
}

export function TodayTaskList({
  tasks,
  onToggle,
  className,
}: TodayTaskListProps) {
  const completedCount = tasks.filter((task) => task.is_completed).length;
  const totalCount = tasks.length;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Today's Tasks</CardTitle>
        <Badge variant="secondary">
          {completedCount}/{totalCount}
        </Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="flex flex-col gap-3">
            {tasks.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                No tasks for today
              </p>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    'flex items-start gap-3 rounded-lg border p-3 transition-all hover:bg-muted/50',
                    task.is_completed && 'opacity-60',
                  )}
                >
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.is_completed}
                    onCheckedChange={() => onToggle?.(task.id)}
                    className="mt-0.5"
                    aria-label={`Mark "${task.title}" as ${task.is_completed ? 'incomplete' : 'complete'}`}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`task-${task.id}`}
                      className={cn(
                        'cursor-pointer text-sm font-medium',
                        task.is_completed && 'line-through',
                      )}
                    >
                      {task.title}
                    </label>
                    {task.description && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {task.description}
                      </p>
                    )}
                    {task.xp_reward && (
                      <Badge variant="outline" className="mt-2">
                        +{task.xp_reward} XP
                      </Badge>
                    )}
                  </div>
                  {task.is_completed ? (
                    <CheckCircle2 className="size-5 text-green-500" />
                  ) : (
                    <Circle className="size-5 text-muted-foreground" />
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
