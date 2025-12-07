import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Course, User } from '@/types';
import {
  Award,
} from 'lucide-react';

interface ScoringTabProps {
  course: Course & {
    instructor: User;
  };
  isEnrolled: boolean;
}

export function ScoringTab({ isEnrolled }: ScoringTabProps) {
  if (!isEnrolled) {
    return (
      <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/10">
        <CardContent className="py-12 text-center">
          <Award className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
          <h3 className="mb-2 text-lg font-semibold text-yellow-800 dark:text-yellow-400">
            Scoring Not Available
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-500">
            Enroll in this course to view your grades and scoring details.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Scoring
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Grading details will be available once assessments are published.
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground dark:border-gray-700">
            Grades and scoring breakdown will appear here once released.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
