import { MiniCalendar } from '@/components/calendar/mini-calendar';
import { TaskDateCard } from '@/components/calendar/task-date-card';
import { TaskStats } from '@/components/calendar/task-stats';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import AppLayout from '@/layouts/app-layout';
import { calendar as calendarRoute } from '@/routes';
import type { BreadcrumbItem, CalendarPageProps } from '@/types';
import { Head, usePage } from '@inertiajs/react';
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

  const formatDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDateKey = (dateKey: string): Date => {
    const normalized = dateKey.split('T')[0].split(' ')[0];
    const [year, month, day] = normalized.split('-').map(Number);
    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
      return new Date();
    }
    return new Date(year, month - 1, day);
  };

  const initialDate = useMemo(
    () => parseDateKey(currentDateString),
    [currentDateString],
  );
  const [filterDate, setFilterDate] = useState<string | null>(null);

  const dates = useMemo(
    () => Object.keys(tasksByDate).sort(),
    [tasksByDate],
  );

  const markers = useMemo(
    () => Object.keys(tasksByDate),
    [tasksByDate],
  );

  const filteredDates = useMemo(() => {
    if (!filterDate) {
      return dates;
    }

    return tasksByDate[filterDate] ? [filterDate] : [];
  }, [dates, filterDate, tasksByDate]);

  const selectedDate = useMemo(
    () => (filterDate ? new Date(filterDate) : initialDate),
    [filterDate, initialDate],
  );

  const handleDateSelect = (date: Date) => {
    const dateKey = formatDateKey(date);
    setFilterDate(dateKey);
  };

  const handleResetFilter = () => {
    setFilterDate(null);
  };

  const isFiltered = Boolean(filterDate);

  const activeDateLabel =
    filterDate && tasksByDate[filterDate]
      ? new Date(filterDate).toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : null;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Calendar" />

      <div className="container mx-auto px-4 py-4 lg:px-6">
        <PageHeader
          icon={Calendar}
          title="Calendar"
          description="Track your daily tasks and stay on top of your learning schedule."
          className="mb-6 lg:mb-8"
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Calendar + Compact Overview */}
          <div className="space-y-4 lg:space-y-6">
            <MiniCalendar
              currentDate={selectedDate}
              markers={markers}
              onDateSelect={handleDateSelect}
              onResetFilter={handleResetFilter}
              isFiltered={isFiltered}
              className="w-full"
            />

            <div className="rounded-xl border bg-card p-3 text-card-foreground shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Overview</h3>
                <span className="text-xs text-muted-foreground">Summary</span>
              </div>
              <TaskStats stats={stats} className="grid-cols-3 gap-3" />
            </div>
          </div>

          {/* Right: Tasks */}
          <div className="space-y-4 rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
            <div>
              <h2 className="text-xl font-semibold">
                {isFiltered ? 'Tasks for selected date' : 'All scheduled tasks'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isFiltered
                  ? activeDateLabel ?? 'No tasks scheduled for this date.'
                  : 'Showing every scheduled task on your calendar.'}
              </p>
            </div>

            <div className="space-y-4">
              {filteredDates.length > 0 ? (
                filteredDates.map((date) => (
                  <TaskDateCard
                    key={date}
                    date={date}
                    tasks={tasksByDate[date]}
                  />
                ))
              ) : (
                <EmptyState
                  message={
                    isFiltered
                      ? 'No tasks scheduled for this date.'
                      : 'No tasks scheduled. Your calendar is clear!'
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
