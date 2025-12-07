import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Course, Lesson, User } from '@/types';
import {
  AlertCircle,
  CalendarCheck,
} from 'lucide-react';

interface AttendanceTabProps {
  course: Course & {
    instructor: User;
    lessons: Lesson[];
  };
  isEnrolled: boolean;
}

export function AttendanceTab({ course, isEnrolled }: AttendanceTabProps) {
  if (!isEnrolled) {
    return (
      <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/10">
        <CardContent className="py-12 text-center">
          <CalendarCheck className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
          <h3 className="mb-2 text-lg font-semibold text-yellow-800 dark:text-yellow-400">
            Attendance Not Available
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-500">
            Enroll in this course to view your attendance records.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (course.lessons.length === 0) {
    return (
      <Card className="border border-dashed">
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No sessions have been added to this course yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <CalendarCheck className="h-5 w-5 text-yellow-600" />
            Attendance
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Attendance tracking is not available for this course yet. Sessions
            listed below are provided for reference.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {course.lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="flex items-center justify-between rounded-lg border p-3 dark:border-gray-700"
              >
                <div className="flex flex-col">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Session {index + 1}: {lesson.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {lesson.duration_minutes
                      ? `${lesson.duration_minutes} mins`
                      : 'Duration not set'}
                  </p>
                </div>
                <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  Not tracked
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
