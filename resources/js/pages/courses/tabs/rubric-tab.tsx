import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Course, User } from '@/types';
import { Scale } from 'lucide-react';

interface RubricTabProps {
  course: Course & {
    instructor: User;
  };
}

export function RubricTab({}: RubricTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <Scale className="h-5 w-5 text-yellow-600" />
            Assessment Rubric
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No rubric has been provided for this course yet.
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground dark:border-gray-700">
            Rubric details will appear here once the instructor publishes them.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
