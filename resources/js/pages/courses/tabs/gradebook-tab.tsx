import { Card, CardContent } from '@/components/ui/card';
import { useRoles } from '@/hooks/use-roles';
import { Course, User } from '@/types';
import { BookCheck } from 'lucide-react';

interface GradebookTabProps {
  course: Course & {
    instructor: User;
  };
  isEnrolled: boolean;
}

export function GradebookTab({ course, isEnrolled }: GradebookTabProps) {
  const { isAdmin, isTutor } = useRoles();
  const canView = isEnrolled || isAdmin || isTutor;

  if (!canView) {
    return (
      <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/10">
        <CardContent className="py-12 text-center">
          <BookCheck className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
          <h3 className="mb-2 text-lg font-semibold text-yellow-800 dark:text-yellow-400">
            Gradebook Not Available
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-500">
            Enroll in this course to view your gradebook.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-12 text-center">
        <BookCheck className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
          Gradebook Coming Soon
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Your detailed gradebook will be available here. Stay tuned!
        </p>
      </CardContent>
    </Card>
  );
}
