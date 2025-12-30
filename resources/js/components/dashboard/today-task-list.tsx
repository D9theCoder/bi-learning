import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { DailyTask } from '@/types';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Circle, ScrollText, Zap } from 'lucide-react';
import { useState } from 'react';

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

  // Local state for optimistic updates if onToggle updates parent state slowly
  const [justCompleted, setJustCompleted] = useState<number[]>([]);

  const handleToggle = (task: DailyTask) => {
    if (!task.is_completed && !justCompleted.includes(task.id)) {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#eab308', '#3b82f6'], // Green, Yellow, Blue
      });
      setJustCompleted((prev) => [...prev, task.id]);
    }

    if (onToggle) {
      onToggle(task.id);
    }
  };

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
            <AnimatePresence mode="popLayout">
              {tasks.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-sm text-muted-foreground"
                >
                  No quests available today
                </motion.p>
              ) : (
                tasks.map((task) => {
                  const isCompleted =
                    task.is_completed || justCompleted.includes(task.id);
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      key={task.id}
                      onClick={() => handleToggle(task)}
                      className={cn(
                        'group flex cursor-pointer items-start gap-4 rounded-xl border bg-card p-4 transition-all hover:border-accent hover:bg-accent hover:shadow-sm',
                        isCompleted ? 'bg-muted/50 opacity-60' : 'border-muted',
                      )}
                    >
                      <div className="mt-0.5">
                        <motion.div
                          initial={false}
                          animate={{ scale: isCompleted ? [1, 1.2, 1] : 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="size-5 text-green-500" />
                          ) : (
                            <Circle className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
                          )}
                        </motion.div>
                      </div>
                      <div className="flex-1 space-y-1">
                        <motion.label
                          animate={{
                            textDecorationLine: isCompleted
                              ? 'line-through'
                              : 'none',
                            color: isCompleted
                              ? 'var(--muted-foreground)'
                              : 'var(--foreground)',
                          }}
                          className={cn(
                            'cursor-pointer text-sm leading-none font-semibold',
                          )}
                        >
                          {task.title}
                        </motion.label>
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
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
