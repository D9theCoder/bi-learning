import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  isTutor?: boolean;
  students?: any[];
}

export function AttendanceTab({
  course,
  isEnrolled,
  isTutor = false,
  students = [],
}: AttendanceTabProps) {
  const { isAdmin } = useRoles();
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

  if (isTutor) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <CalendarCheck className="h-5 w-5 text-yellow-600" />
            Attendance Management
          </CardTitle>
          <p className="text-sm text-gray-500">
            Track student attendance across all sessions.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="mb-4 w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-3 font-medium text-gray-500">Student</th>
                  {course.lessons.map((lesson, idx) => (
                    <th
                      key={lesson.id}
                      className="p-3 text-center font-medium whitespace-nowrap text-gray-500"
                    >
                      S{idx + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? (
                  students.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={student.avatar}
                              alt={student.name}
                            />
                            <AvatarFallback>
                              {student.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {student.name}
                          </div>
                        </div>
                      </td>
                      {course.lessons.map((lesson) => {
                        const hasAttended = student.attendances?.some(
                          (a: any) => a.lesson_id === lesson.id,
                        );
                        return (
                          <td key={lesson.id} className="p-3 text-center">
                            <div className="flex justify-center">
                              {hasAttended ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-gray-200 dark:text-gray-700" />
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={course.lessons.length + 1}
                      className="p-6 text-center text-gray-500"
                    >
                      No students enrolled.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
