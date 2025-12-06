import { TaskDateCard } from '@/components/calendar/task-date-card';
import { TaskStats } from '@/components/calendar/task-stats';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import AppLayout from '@/layouts/app-layout';
import { calendar as calendarRoute } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Calendar } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Calendar',
    href: calendarRoute().url,
  },
];

// ! Removed CalendarPageProps

// ! Dummy Data
const dummyTasksByDate = {
  '2024-05-20': [
    {
      id: 1,
      title: 'Complete Chapter 1 Quiz',
      course_title: 'Introduction to React',
      completed: false,
      xp_reward: 50,
      due_date: '2024-05-20',
      type: 'quiz',
    },
    {
      id: 2,
      title: 'Watch "Hooks in Depth"',
      course_title: 'Advanced React Patterns',
      completed: true,
      xp_reward: 30,
      due_date: '2024-05-20',
      type: 'lesson',
    },
  ],
  '2024-05-21': [
    {
      id: 3,
      title: 'Practice Component Composition',
      course_title: 'Introduction to React',
      completed: false,
      xp_reward: 20,
      due_date: '2024-05-21',
      type: 'practice',
    },
  ],
};

const dummyStats = {
  total: 10,
  completed: 5,
  overdue: 0,
};

// ! Modified component to use dummy data
export default function CalendarPage() {
  const tasksByDate = dummyTasksByDate;
  const stats = dummyStats;

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
            // @ts-ignore
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
