import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Assessment, AssessmentSubmission, Course, User } from '@/types';
import { Link, router } from '@inertiajs/react';
import {
  CheckCircle,
  ClipboardList,
  Clock,
  FileText,
  PenLine,
  Play,
  Plus,
  RefreshCw,
  Trophy,
} from 'lucide-react';

interface AssessmentTabProps {
  course: Course & {
    instructor: User;
  };
  assessments?: Assessment[];
  submissions?: AssessmentSubmission[];
  isTutor?: boolean;
}

export function AssessmentTab({
  course,
  assessments = [],
  submissions = [],
  isTutor = false,
}: AssessmentTabProps) {
  const getSubmissionForAssessment = (assessmentId: number) => {
    return submissions.find((s) => s.assessment_id === assessmentId);
  };

  if (assessments.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-start gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
                <ClipboardList className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
                Assessments
              </CardTitle>
              {isTutor && (
                <Button
                  size="sm"
                  onClick={() =>
                    router.post(`/courses/${course.id}/quiz`, {
                      title: 'New Quiz',
                      description: '',
                      max_score: 100,
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Quiz
                </Button>
              )}
            </div>
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-start gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
              <ClipboardList className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
              Assessments
            </CardTitle>
            {isTutor && (
              <Button
                size="sm"
                onClick={() =>
                  router.post(`/courses/${course.id}/quiz`, {
                    title: 'New Quiz',
                    description: '',
                    max_score: 100,
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Quiz
              </Button>
            )}
          </div>
          <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
            Complete the following assessments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {assessments.map((assessment) => {
            const submission = getSubmissionForAssessment(assessment.id);
            const hasCompleted = submission && submission.score !== null;
            const isPastDue =
              assessment.due_date && new Date(assessment.due_date) < new Date();

            return (
              <div
                key={assessment.id}
                className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
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
                    {assessment.time_limit_minutes && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        <Clock className="mr-1 inline h-3 w-3" />
                        {assessment.time_limit_minutes} min
                      </span>
                    )}
                    {assessment.allow_retakes && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-600 dark:bg-green-900/30 dark:text-green-400">
                        <RefreshCw className="mr-1 inline h-3 w-3" />
                        Retakes allowed
                      </span>
                    )}
                    {!assessment.is_published && isTutor && (
                      <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                        Draft
                      </span>
                    )}
                  </div>
                  {assessment.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {assessment.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    {assessment.due_date && (
                      <span
                        className={`flex items-center gap-1 ${isPastDue && !hasCompleted ? 'text-red-500' : ''}`}
                      >
                        <Clock className="h-3 w-3" />
                        Due: {new Date(assessment.due_date).toLocaleDateString()}
                        {isPastDue && !hasCompleted && ' (Past due)'}
                      </span>
                    )}
                    {hasCompleted && (
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <Trophy className="h-3 w-3" />
                        Score: {submission.score} / {assessment.max_score}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isTutor ? (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/courses/${course.id}/quiz/${assessment.id}/edit`}>
                        <PenLine className="mr-2 h-4 w-4" />
                        Edit Quiz
                      </Link>
                    </Button>
                  ) : (
                    <Button size="sm" asChild>
                      <Link href={`/courses/${course.id}/quiz/${assessment.id}`}>
                        <Play className="mr-2 h-4 w-4" />
                        {hasCompleted
                          ? assessment.allow_retakes
                            ? 'Retake'
                            : 'View'
                          : 'Start'}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
