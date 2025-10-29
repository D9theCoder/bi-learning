import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Enrollment } from '@/types';
import { Link } from '@inertiajs/react';
import { Play } from 'lucide-react';
import { ProgressRing } from './progress-ring';

interface CourseCardProps {
  enrollment: Enrollment;
  onResume?: () => void;
}

export function CourseCard({ enrollment, onResume }: CourseCardProps) {
  const {
    course,
    progress_percentage = 0,
    last_activity_at,
    next_lesson,
  } = enrollment;

  // Handle null/undefined course
  if (!course) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="relative p-0">
        {course.thumbnail && (
          <img
            src={course.thumbnail}
            alt={course.title || 'Course thumbnail'}
            className="aspect-video w-full rounded-t-lg object-cover"
          />
        )}
        <div className="absolute top-2 right-2">
          <ProgressRing
            progress={progress_percentage}
            size={48}
            strokeWidth={4}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="line-clamp-2 text-base">
          {course.title || 'Untitled Course'}
        </CardTitle>
        {last_activity_at && (
          <p className="mt-2 text-xs text-muted-foreground">
            Last activity: {new Date(last_activity_at).toLocaleDateString()}
          </p>
        )}
        {next_lesson?.title && (
          <Badge variant="secondary" className="mt-2">
            Next: {next_lesson.title}
          </Badge>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full" onClick={onResume}>
          <Link href={`/courses/${course.id}`} prefetch>
            <Play className="mr-2 size-4" />
            Resume
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
