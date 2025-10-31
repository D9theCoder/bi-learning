import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import { calendar as calendarRoute, tasks } from '@/routes';
import type { BreadcrumbItem, CalendarPageProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Calendar',
    href: calendarRoute().url,
  },
];

function TaskCheckbox({
  task,
}: {
  task: { id: number; title: string; completed: boolean; xp_reward?: number };
}) {
  const { data, setData, patch, processing } = useForm({
    completed: task.completed,
  });

  const handleChange = (checked: boolean | 'indeterminate') => {
    const newValue = checked === true;
    setData('completed', newValue);
    patch(tasks({ task: task.id }).url, {
      preserveScroll: true,
    });
  };

  return (
    <div className="flex items-center gap-3">
      <Checkbox
        checked={data.completed}
        disabled={processing}
        onCheckedChange={handleChange}
      />
      <div className="flex-1">
        <div
          className={data.completed ? 'text-muted-foreground line-through' : ''}
        >
          {task.title}
        </div>
        {task.xp_reward && (
          <div className="text-xs text-muted-foreground">
            {task.xp_reward} XP
          </div>
        )}
      </div>
    </div>
  );
}

export default function CalendarPage({
  tasksByDate,
  stats,
}: CalendarPageProps) {
  const dates = Object.keys(tasksByDate).sort();

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Calendar" />

      <div className="flex flex-1 flex-col gap-6 overflow-x-auto p-4 lg:p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Calendar className="size-8 text-blue-500" />
            <h1 className="text-3xl font-bold">Calendar</h1>
          </div>
          <p className="text-muted-foreground">
            Track your daily tasks and stay on top of your learning schedule.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-green-500" />
                <div className="text-2xl font-bold">{stats.completed}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="size-5 text-red-500" />
                <div className="text-2xl font-bold">{stats.overdue}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks by Date */}
        <div className="space-y-4">
          {dates.map((date) => {
            const dateTasks = tasksByDate[date];
            const isOverdue =
              new Date(date) < new Date() &&
              dateTasks.some((t) => !t.completed);

            return (
              <Card key={date}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    {isOverdue && (
                      <span className="text-xs text-red-500">(Overdue)</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dateTasks.map((task) => (
                      <TaskCheckbox key={task.id} task={task} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {dates.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No tasks scheduled. Your calendar is clear!
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
