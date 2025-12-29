import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Assessment, Course, User } from '@/types';
import { CheckCircle, ClipboardList, Clock, FileText } from 'lucide-react';

interface AssessmentTabProps {
  course: Course & {
    instructor: User;
  };
  assessments?: Assessment[];
  isTutor?: boolean;
}

export function AssessmentTab({
  course,
  assessments = [],
  isTutor = false,
}: AssessmentTabProps) {
  if (assessments.length === 0) {
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
            <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground dark:border-gray-700">
              No assessments have been published for this course yet.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-start gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
            <ClipboardList className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
            Assessments
          </CardTitle>
          <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
            Complete the following assessments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {assessments.map((assessment) => (
            <div
              key={assessment.id}
              className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {assessment.type === 'quiz' ? (
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                  ) : (
                    <FileText className="h-4 w-4 text-orange-500" />
                  )}
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {assessment.title}
                  </h4>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    {assessment.max_score} pts
                  </span>
                </div>
                {assessment.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {assessment.description}
                  </p>
                )}
                {assessment.due_date && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    Due: {new Date(assessment.due_date).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div>
                {isTutor ? (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`/courses/manage/${course.id}/edit`} /* Simple link to manage */
                    >
                      Manage
                    </a>
                  </Button>
                ) : (
                  <Button size="sm">Start</Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
