import { TaskDateCard } from '@/components/calendar/task-date-card';
import { TaskStats } from '@/components/calendar/task-stats';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import AppLayout from '@/layouts/app-layout';
import { calendar as calendarRoute } from '@/routes';
import type { BreadcrumbItem, CalendarPageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { Calendar } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Calendar',
    href: calendarRoute().url,
  },
];

export default function CalendarPage({
  tasksByDate,
  stats,
}: CalendarPageProps) {
  const dates = Object.keys(tasksByDate).sort();

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Calendar" />

      <div className="flex flex-1 flex-col gap-6 overflow-x-auto p-4 lg:p-6">
        <PageHeader
          icon={Calendar}
          title="Calendar"
          description="Track your daily tasks and stay on top of your learning schedule."
        />

        <TaskStats stats={stats} />

        <div className="space-y-4">
          {dates.map((date) => (
            <TaskDateCard key={date} date={date} tasks={tasksByDate[date]} />
          ))}
        </div>

        {dates.length === 0 && (
          <EmptyState message="No tasks scheduled. Your calendar is clear!" />
        )}
      </div>
    </AppLayout>
  );
}
