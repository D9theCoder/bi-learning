import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Enrollment } from '@/types';
import { Link } from '@inertiajs/react';
import { Play } from 'lucide-react';
import { ProgressRing } from './progress-ring';

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
    <Card className="group relative flex items-center overflow-hidden p-4 transition-all hover:shadow-md">
      {/* Radial Progress Ring */}
      <div className="shrink-0">
        <ProgressRing
          progress={progress_percentage}
          size={60}
          strokeWidth={5}
          className="text-primary"
        />
      </div>

      <CardContent className="flex-1 px-4 py-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {course.category && (
              <Badge variant="outline" className="h-5 px-1.5 py-0 text-[10px]">
                {course.category}
              </Badge>
            )}
            <h3 className="line-clamp-1 text-base leading-none font-bold tracking-tight">
              {course.title || 'Untitled Course'}
            </h3>
          </div>
          {next_lesson?.title && (
            <p className="line-clamp-1 text-xs text-muted-foreground">
              Next:{' '}
              <span className="font-medium text-foreground">
                {next_lesson.title}
              </span>
            </p>
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
