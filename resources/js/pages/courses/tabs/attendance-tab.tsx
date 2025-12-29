import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoles } from '@/hooks/use-roles';
import { Course, Lesson, User } from '@/types';
import { CalendarCheck, CheckCircle, XCircle } from 'lucide-react';

interface AttendanceTabProps {
  course: Course & {
    instructor: User;
    lessons: Lesson[];
  };
  isEnrolled: boolean;
}

export function AttendanceTab({ course, isEnrolled }: AttendanceTabProps) {
  const { isAdmin, isTutor } = useRoles();
  const canView = isEnrolled || isAdmin || isTutor;

  if (!canView) {
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

  // Calculate attendance stats
  const totalSessions = course.lessons.length;
  const attendedSessions = course.lessons.filter(
    (lesson) => lesson.has_attended,
  ).length;
  const attendanceRate =
    totalSessions > 0
      ? Math.round((attendedSessions / totalSessions) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Attendance Summary */}
      {isEnrolled && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <p className="text-sm text-gray-500">Total Sessions</p>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalSessions}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <p className="text-sm text-gray-500">Attended</p>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {attendedSessions}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <p className="text-sm text-gray-500">Attendance Rate</p>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">
                {attendanceRate}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <CalendarCheck className="h-5 w-5 text-yellow-600" />
            Session Attendance
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View attendance records for each session
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
                {lesson.has_attended ? (
                  <Badge className="flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle className="h-3 w-3" />
                    Attended
                  </Badge>
                ) : (
                  <Badge className="flex items-center gap-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    <XCircle className="h-3 w-3" />
                    Not Attended
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
