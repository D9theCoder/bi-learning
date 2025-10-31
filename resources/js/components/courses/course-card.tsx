import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Course, User } from '@/types';
import { Form } from '@inertiajs/react';
import { Play } from 'lucide-react';

const difficultyColors = {
  beginner: 'bg-green-500/20 text-green-400',
  intermediate: 'bg-yellow-500/20 text-yellow-400',
  advanced: 'bg-red-500/20 text-red-400',
};

interface CourseCardProps {
  course: Course & {
    lessons_count: number;
    instructor?: User;
    user_progress?: {
      progress_percentage: number;
      next_lesson?: unknown;
    };
  };
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{course.title}</CardTitle>
          {course.difficulty && (
            <Badge
              className={difficultyColors[course.difficulty]}
              variant="secondary"
            >
              {course.difficulty}
            </Badge>
          )}
        </div>
        <CardDescription>{course.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm text-muted-foreground">
          {course.lessons_count} lessons
        </div>
        {course.instructor && (
          <div className="text-xs text-muted-foreground">
            By {course.instructor.name}
          </div>
        )}
        {course.user_progress && (
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">
              {Math.round(course.user_progress.progress_percentage)}% complete
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${course.user_progress.progress_percentage}%`,
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {course.user_progress ? (
          <Button className="w-full" size="sm">
            <Play className="mr-2 size-4" />
            Continue Learning
          </Button>
        ) : (
          <Form
            action={`/courses/${course.id}/enroll`}
            method="post"
            className="w-full"
          >
            <Button
              type="submit"
              className="w-full"
              size="sm"
              variant="outline"
            >
              Enroll Now
            </Button>
          </Form>
        )}
      </CardFooter>
    </Card>
  );
}
