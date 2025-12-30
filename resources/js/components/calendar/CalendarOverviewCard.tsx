import { TaskStats } from '@/components/calendar/task-stats';

interface CalendarOverviewCardProps {
  stats: {
    total: number;
    completed: number;
    pending: number;
  };
}

export function CalendarOverviewCard({ stats }: CalendarOverviewCardProps) {
  return (
    <div className="rounded-xl border bg-card p-3 text-card-foreground shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Overview</h3>
        <span className="text-xs text-muted-foreground">Summary</span>
      </div>
      <TaskStats stats={stats} className="grid-cols-3 gap-3" />
    </div>
  );
}
