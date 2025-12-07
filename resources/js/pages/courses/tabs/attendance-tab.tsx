import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Course, Lesson, User } from '@/types';
import {
  AlertCircle,
  CalendarCheck,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';

interface AttendanceTabProps {
  course: Course & {
    instructor: User;
    lessons: Lesson[];
  };
  isEnrolled: boolean;
}

// Dummy attendance data
const getAttendanceData = (lessons: Lesson[]) => {
  return lessons.slice(0, 10).map((lesson, index) => ({
    sessionId: lesson.id,
    sessionNumber: index + 1,
    sessionTitle: lesson.title,
    date: new Date(
      Date.now() - (10 - index) * 7 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    status:
      index < 8
        ? [
            'present',
            'present',
            'present',
            'late',
            'present',
            'absent',
            'present',
            'present',
          ][index % 8]
        : 'upcoming',
    checkInTime: index < 8 && index !== 5 ? '09:05 AM' : null,
    duration: '90 minutes',
  }));
};

const getStatusConfig = (status: string) => {
  const configs: Record<
    string,
    { icon: React.ReactNode; label: string; className: string }
  > = {
    present: {
      icon: <CheckCircle className="h-4 w-4" />,
      label: 'Present',
      className:
        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    },
    late: {
      icon: <Clock className="h-4 w-4" />,
      label: 'Late',
      className:
        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    absent: {
      icon: <XCircle className="h-4 w-4" />,
      label: 'Absent',
      className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    },
    upcoming: {
      icon: <AlertCircle className="h-4 w-4" />,
      label: 'Upcoming',
      className:
        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    },
  };
  return configs[status] || configs.upcoming;
};

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

  const attendance = getAttendanceData(course.lessons);
  const stats = {
    present: attendance.filter((a) => a.status === 'present').length,
    late: attendance.filter((a) => a.status === 'late').length,
    absent: attendance.filter((a) => a.status === 'absent').length,
    upcoming: attendance.filter((a) => a.status === 'upcoming').length,
  };
  const totalRecorded = stats.present + stats.late + stats.absent;
  const attendanceRate =
    totalRecorded > 0
      ? ((stats.present + stats.late) / totalRecorded) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.present}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Present</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Late</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Absent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-gray-600">{stats.upcoming}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming</p>
          </CardContent>
        </Card>
        <Card className="col-span-2 md:col-span-1">
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {attendanceRate.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Attendance Rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <CalendarCheck className="h-5 w-5 text-yellow-600" />
            Attendance Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                    Session
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                    Date
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-gray-100">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-gray-100">
                    Check-in Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => {
                  const statusConfig = getStatusConfig(record.status);
                  return (
                    <tr
                      key={record.sessionId}
                      className="border-b last:border-0 dark:border-gray-700"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            Session {record.sessionNumber}
                          </p>
                          <p className="max-w-[200px] truncate text-sm text-gray-500 dark:text-gray-400">
                            {record.sessionTitle}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={`${statusConfig.className} gap-1`}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">
                        {record.checkInTime || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
