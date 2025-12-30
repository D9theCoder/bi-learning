import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskCheckbox } from './task-checkbox';

interface TaskDateCardProps {
  date: string;
  tasks: Array<{
    id: number;
    title: string;
    completed: boolean;
    due_date?: string;
    xp_reward?: number;
    course_title?: string;
    type?: string;
  }>;
}

export function TaskDateCard({ date, tasks }: TaskDateCardProps) {
  const isOverdue =
    new Date(date) < new Date() && tasks.some((t) => !t.completed);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
          {isOverdue && <span className="text-xs text-red-500">(Overdue)</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCheckbox key={task.id} task={task} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
