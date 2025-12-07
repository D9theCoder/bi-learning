import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Course, User } from '@/types';
import { ClipboardList } from 'lucide-react';

interface AssessmentTabProps {
  course: Course & {
    instructor: User;
  };
}

export function AssessmentTab({}: AssessmentTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-start gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
            <ClipboardList className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
            Assessments
          </CardTitle>
          <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
            Assessment details will be posted when available.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground dark:border-gray-700">
            No assessments have been published for this course yet.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
