import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CalendarTask } from '@/types';
import { Clock, FileText, Video } from 'lucide-react';

interface TaskDateCardProps {
  date: string;
  tasks: CalendarTask[];
}

export function TaskDateCard({ date, tasks }: TaskDateCardProps) {
  const isOverdue =
    new Date(date) < new Date() && tasks.some((t) => !t.completed);
  const isPast = new Date(date) < new Date();

  const getCategoryIcon = (category: CalendarTask['category']) => {
    switch (category) {
      case 'meeting':
        return <Video className="size-3 text-blue-500" />;
      case 'assessment':
        return <Clock className="size-3 text-orange-500" />;
      default:
        return <FileText className="size-3 text-green-500" />;
    }
  };

  const getCategoryColor = (category: CalendarTask['category']) => {
    switch (category) {
      case 'meeting':
        return 'border-l-blue-500';
      case 'assessment':
        return 'border-l-orange-500';
      default:
        return 'border-l-green-500';
    }
  };

  return (
    <div className={cn('space-y-0.5', isPast && 'opacity-60')}>
      <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
        {new Date(date).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })}
        {isOverdue && (
          <Badge variant="destructive" className="h-3.5 px-1 text-[10px]">
            Late
          </Badge>
        )}
      </div>
      <div className="space-y-0.5">
        {tasks.map((task) => (
          <div
            key={`${task.category}-${task.id}`}
            className={cn(
              'flex items-center gap-1.5 border-l-2 bg-muted/10 px-1.5 py-1 text-sm',
              getCategoryColor(task.category),
            )}
          >
            {getCategoryIcon(task.category)}
            <span
              className={cn(
                'flex-1 truncate',
                task.completed && 'text-muted-foreground line-through',
              )}
            >
              {task.title}
            </span>
            {task.time && (
              <span className="text-[11px] text-muted-foreground">
                {task.time}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
