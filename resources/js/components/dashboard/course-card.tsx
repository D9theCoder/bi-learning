import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Enrollment } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Calendar as CalendarIcon, Clock, Play } from 'lucide-react';

interface CourseCardProps {
  enrollment: Enrollment;
  onResume?: () => void;
}

export function CourseCard({ enrollment, onResume }: CourseCardProps) {
  const { course, progress_percentage = 0, next_lesson } = enrollment;

  // Handle null/undefined course
  if (!course) {
    return null;
  }

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md">
      <CardContent className="flex gap-4 p-0">
        {/* Course Thumbnail */}
        <div className="relative size-32 shrink-0 overflow-hidden">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-muted">
              <BookOpen className="size-8 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Course Info */}
        <div className="flex flex-1 flex-col justify-center gap-2 py-3 pr-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {course.category && (
                <Badge variant="outline" className="h-5 shrink-0 px-1.5 py-0 text-[10px]">
                  {course.category}
                </Badge>
              )}
              <h3 className="line-clamp-1 text-sm font-bold leading-none tracking-tight">
                {course.title || 'Untitled Course'}
              </h3>
            </div>
            {/* Progress bar on the right */}
            <div className="flex shrink-0 items-center gap-2">
              <Progress value={progress_percentage} className="h-1.5 w-16" />
              <span className="text-xs font-medium text-muted-foreground">
                {progress_percentage}%
              </span>
            </div>
          </div>

          {next_lesson?.title && (
            <p className="line-clamp-1 text-xs text-muted-foreground">
              Next:{' '}
              <span className="font-medium text-foreground">
                {next_lesson.title}
              </span>
            </p>
          )}

          {next_lesson?.meeting_start_time && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="size-3.5" />
                <span>
                  {new Date(next_lesson.meeting_start_time).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                <span>
                  {new Date(next_lesson.meeting_start_time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {/* Resume Button - Slides up on hover */}
      <div className="absolute inset-0 flex items-center justify-end bg-gradient-to-l from-background/90 via-background/50 to-transparent p-4 opacity-0 transition-all duration-300 group-hover:opacity-100">
        <Button
          asChild
          onClick={onResume}
          size="sm"
          className="translate-y-2 shadow-lg transition-transform duration-300 group-hover:translate-y-0"
        >
          <Link href={`/courses/${course.id}`}>
            <Play className="mr-2 size-3" />
            Resume
          </Link>
        </Button>
      </div>
    </Card>
  );
}
