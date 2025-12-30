import { TaskDateCard } from '@/components/calendar/task-date-card';
import { EmptyState } from '@/components/shared/empty-state';

type CalendarTaskSummary = {
  id: number;
  title: string;
  due_date: string;
  completed: boolean;
  xp_reward?: number;
  course_title?: string;
  type?: string;
};

interface CalendarTaskListProps {
  isFiltered: boolean;
  activeDateLabel: string | null;
  filteredDates: string[];
  tasksByDate: Record<string, CalendarTaskSummary[]>;
}

export function CalendarTaskList({
  isFiltered,
  activeDateLabel,
  filteredDates,
  tasksByDate,
}: CalendarTaskListProps) {
  return (
    <div className="space-y-4 rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
      <div>
        <h2 className="text-xl font-semibold">
          {isFiltered ? 'Tasks for selected date' : 'All scheduled tasks'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isFiltered
            ? (activeDateLabel ?? 'No tasks scheduled for this date.')
            : 'Showing every scheduled task on your calendar.'}
        </p>
      </div>

      <div className="space-y-4">
        {filteredDates.length > 0 ? (
          filteredDates.map((date) => (
            <TaskDateCard key={date} date={date} tasks={tasksByDate[date]} />
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
  );
}
