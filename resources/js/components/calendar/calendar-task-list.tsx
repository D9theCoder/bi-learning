import { TaskDateCard } from '@/components/calendar/task-date-card';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CalendarTask } from '@/types';
import { CalendarDays, Clock, FileText, Video } from 'lucide-react';

interface CalendarTaskListProps {
  isFiltered: boolean;
  activeDateLabel: string | null;
  filteredDates: string[];
  tasksByDate: Record<string, CalendarTask[]>;
}

export function CalendarTaskList({
  isFiltered,
  activeDateLabel,
  filteredDates,
  tasksByDate,
}: CalendarTaskListProps) {
  return (
    <Card className="h-fit rounded-none">
      <CardHeader className="px-3 py-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-1.5 text-sm">
            <CalendarDays className="size-3.5 text-primary" />
            {isFiltered ? 'Selected' : 'Scheduled'}
          </CardTitle>
          {/* Legend */}
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
            <span className="flex items-center gap-0.5"><span className="size-1.5 bg-blue-500" />Meet</span>
            <span className="flex items-center gap-0.5"><span className="size-1.5 bg-orange-500" />Assess</span>
            <span className="flex items-center gap-0.5"><span className="size-1.5 bg-green-500" />Task</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 px-3 pt-0 pb-2">
        {filteredDates.length > 0 ? (
          filteredDates.map((date) => (
            <TaskDateCard key={date} date={date} tasks={tasksByDate[date]} />
          ))
        ) : (
          <div className="flex items-center justify-center gap-1.5 py-2 text-center text-[10px] text-muted-foreground">
            <CalendarDays className="size-3.5" />
            {isFiltered ? 'No items' : 'Clear'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
