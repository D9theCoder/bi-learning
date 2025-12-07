import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Course, User } from '@/types';
import { GraduationCap, Mail, Users } from 'lucide-react';

interface PeopleTabProps {
  course: Course & {
    instructor: User;
  };
  isEnrolled: boolean;
}

// Dummy people data
const getPeopleData = () => ({
  instructors: [
    {
      id: 1,
      name: 'Dr. Devi Fitrianah',
      role: 'Primary Instructor',
      email: 'devi.fitrianah@university.edu',
      avatar:
        'https://ui-avatars.com/api/?name=Devi+Fitrianah&background=random',
      expertise: ['Web Development', 'Software Engineering'],
    },
    {
      id: 2,
      name: 'Prof. Ahmad Sudarsono',
      role: 'Secondary Instructor',
      email: 'ahmad.sudarsono@university.edu',
      avatar:
        'https://ui-avatars.com/api/?name=Ahmad+Sudarsono&background=random',
      expertise: ['Database Systems', 'Cloud Computing'],
    },
  ],

  students: [
    {
      id: 1,
      name: 'Alice Johnson',
      avatar:
        'https://ui-avatars.com/api/?name=Alice+Johnson&background=random',
    },
    {
      id: 2,
      name: 'Bob Smith',
      avatar: 'https://ui-avatars.com/api/?name=Bob+Smith&background=random',
    },
    {
      id: 3,
      name: 'Carol Williams',
      avatar:
        'https://ui-avatars.com/api/?name=Carol+Williams&background=random',
    },
    {
      id: 4,
      name: 'David Brown',
      avatar: 'https://ui-avatars.com/api/?name=David+Brown&background=random',
    },
    {
      id: 5,
      name: 'Eva Martinez',
      avatar: 'https://ui-avatars.com/api/?name=Eva+Martinez&background=random',
    },
    {
      id: 6,
      name: 'Frank Lee',
      avatar: 'https://ui-avatars.com/api/?name=Frank+Lee&background=random',
    },
  ],

  totalStudents: 45,
});

export function PeopleTab({ course, isEnrolled }: PeopleTabProps) {
  const people = getPeopleData();

  // Override with actual course instructor
  const instructors = [
    {
      id: course.instructor.id,
      name: course.instructor.name,
      role: 'Primary Instructor',
      email: course.instructor.email,
      avatar: course.instructor.avatar,
      expertise: ['Course Specialty'],
    },
    ...people.instructors.slice(1),
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
                  <div className="mt-2 flex flex-wrap gap-1">
                    {instructor.expertise?.map((exp, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="border-yellow-200 bg-yellow-50 text-xs text-yellow-600 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                      >
                        {exp}
                      </Badge>
                    ))}
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
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-600 dark:bg-blue-900/20"
            >
              {people.totalStudents} enrolled
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isEnrolled ? (
            <>
              <div className="mb-4 flex flex-wrap gap-3">
                {people.students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800/50"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback className="text-xs">
                        {student.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {student.name}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Showing {people.students.length} of {people.totalStudents}{' '}
                students
              </p>
            </>
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
