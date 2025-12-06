import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

interface MiniCalendarProps {
  className?: string;
  currentDate?: Date;
  markers?: string[]; // Array of 'YYYY-MM-DD' strings that have events
  onDateSelect?: (date: Date) => void;
}

export function MiniCalendar({
  className,
  currentDate = new Date(),
  markers = [],
  onDateSelect,
}: MiniCalendarProps) {
  const [viewDate, setViewDate] = useState(currentDate);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const { days, monthName } = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month padding
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month padding (to fill 6 rows of 7 = 42)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    const monthName = new Date(year, month).toLocaleString('default', {
      month: 'long',
    });

    return { days, monthName };
  }, [year, month]);

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  const hasMarker = (date: Date) => {
    // Pad date components to match YYYY-MM-DD
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    return markers.includes(dateStr);
  };

  return (
    <div
      className={cn(
        'w-full max-w-[320px] rounded-xl border bg-card p-4 text-card-foreground shadow-sm',
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-semibold">
          {monthName} {year}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((dayObj, index) => {
          const isSelected = isSameDay(dayObj.date, currentDate);
          const isToday = isSameDay(dayObj.date, new Date());
          const hasEvent = hasMarker(dayObj.date);

          return (
            <button
              key={index}
              onClick={() => onDateSelect?.(dayObj.date)}
              className={cn(
                'relative flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                !dayObj.isCurrentMonth && 'text-muted-foreground/50 opacity-50',
                isSelected &&
                  'bg-primary font-medium text-primary-foreground hover:bg-primary/90',
                !isSelected &&
                  isToday &&
                  'bg-muted font-medium text-foreground',
                !isSelected && !isToday && hasEvent && 'font-medium',
              )}
            >
              {dayObj.date.getDate()}
              {hasEvent && !isSelected && (
                <div className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
              )}
              {hasEvent && isSelected && (
                <div className="absolute bottom-1 h-1 w-1 rounded-full bg-primary-foreground" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
