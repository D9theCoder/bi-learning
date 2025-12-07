import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Course, User } from '@/types';
import { GraduationCap, Mail, Users } from 'lucide-react';

interface PeopleTabProps {
  course: Course & {
    instructor: User;
  };
  isEnrolled: boolean;
}

export function PeopleTab({ course, isEnrolled }: PeopleTabProps) {
  const instructors = [
    {
      id: course.instructor.id,
      name: course.instructor.name,
      role: 'Primary Instructor',
      email: course.instructor.email,
      avatar: course.instructor.avatar,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Instructors Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <GraduationCap className="h-5 w-5 text-yellow-600" />
            Instructors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {instructors.map((instructor) => (
              <div
                key={instructor.id}
                className="flex items-start gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50"
              >
                <Avatar className="h-14 w-14 border-2 border-yellow-200 dark:border-yellow-800">
                  <AvatarImage src={instructor.avatar} />
                  <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {instructor.name}
                  </p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    {instructor.role}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{instructor.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Students Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              <Users className="h-5 w-5 text-blue-600" />
              Students
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isEnrolled ? (
            <div className="py-4 text-sm text-gray-600 dark:text-gray-400">
              Student roster is not available yet. Once classmates join, they
              will appear here.
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              <Users className="mx-auto mb-3 h-10 w-10 text-gray-400" />
              <p>Enroll in this course to see your classmates.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
