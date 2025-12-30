import { Card, CardContent } from '@/components/ui/card';
import type { TutorDashboardData } from '@/types';
import { Calendar as CalendarIcon } from 'lucide-react';
import { memo } from 'react';

interface TutorCalendarSectionProps {
  items: TutorDashboardData['calendar'];
}

export const TutorCalendarSection = memo(
  ({ items }: TutorCalendarSectionProps) => (
    <section aria-labelledby="tutor-calendar-heading" className="space-y-4">
      <div className="flex items-center gap-2">
        <CalendarIcon className="size-5 text-primary" />
        <h2
          id="tutor-calendar-heading"
          className="text-xl font-bold tracking-tight text-foreground"
        >
          Upcoming deadlines
        </h2>
      </div>
      <Card>
        <CardContent className="p-4">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No upcoming deadlines.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-foreground">
                      {item.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.course_title}
                    </span>
                    <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {item.type}
                    </span>
                  </div>
                  <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground">
                    {item.due_date}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  ),
);

TutorCalendarSection.displayName = 'TutorCalendarSection';
