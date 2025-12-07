import { MiniCalendar } from '@/components/calendar/mini-calendar';
import { TaskDateCard } from '@/components/calendar/task-date-card';
import { TaskStats } from '@/components/calendar/task-stats';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import AppLayout from '@/layouts/app-layout';
import { calendar as calendarRoute } from '@/routes';
import type { BreadcrumbItem, CalendarPageProps } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Calendar } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Calendar',
    href: calendarRoute().url,
  },
];

export default function CalendarPage() {
  const { tasksByDate, stats, currentDate: currentDateString } =
    usePage<CalendarPageProps>().props;

  const [currentDate, setCurrentDate] = useState<Date>(
    new Date(currentDateString),
  );

  const dates = useMemo(
    () => Object.keys(tasksByDate).sort(),
    [tasksByDate],
  );

  const markers = useMemo(
    () => Object.keys(tasksByDate),
    [tasksByDate],
  );

  const handleDateSelect = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    setCurrentDate(date);
    router.get(
      calendarRoute().url,
      { date: dateString },
      { preserveState: true, preserveScroll: true, replace: true },
    );
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Calendar" />

      <div className="container mx-auto p-4 lg:p-6">
        <PageHeader
          icon={Calendar}
          title="Calendar"
          description="Track your daily tasks and stay on top of your learning schedule."
          className="mb-8"
        />

        <div className="flex flex-col items-start gap-8 lg:flex-row">
          {/* Sidebar with Stats and Mini Calendar */}
          <div className="order-1 w-full flex-shrink-0 space-y-6 lg:order-2 lg:w-80">
            <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
              <h3 className="mb-4 font-semibold">Overview</h3>
              <TaskStats stats={stats} className="lg:grid-cols-1" />
            </div>

            <MiniCalendar
              currentDate={currentDate}
              markers={markers}
              onDateSelect={handleDateSelect}
              className="w-full"
            />
          </div>

          {/* Main Content */}
          <div className="order-2 w-full flex-1 space-y-6 lg:order-1">
            <h2 className="text-xl font-semibold">
              Tasks for{' '}
              {currentDate.toLocaleDateString(undefined, {
                month: 'long',
                year: 'numeric',
              })}
            </h2>

            <div className="space-y-4">
              {dates.length > 0 ? (
                dates.map((date) => (
                  <TaskDateCard
                    key={date}
                    date={date}
                    tasks={tasksByDate[date]}
                  />
                ))
              ) : (
                <EmptyState message="No tasks scheduled. Your calendar is clear!" />
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
