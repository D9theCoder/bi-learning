import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { Assessment, Course, QuizAttempt, QuizQuestion } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  FileText,
  HelpCircle,
  ListOrdered,
  PenLine,
  Play,
  RefreshCw,
  Trophy,
} from 'lucide-react';

interface QuizShowProps {
  course: Course;
  assessment: Assessment & { questions: QuizQuestion[] };
  existingAttempt?: QuizAttempt | null;
  bestAttempt?: QuizAttempt | null;
  canAttempt: boolean;
  isTutor: boolean;
}

export default function QuizShow({
  course,
  assessment,
  existingAttempt,
  bestAttempt,
  canAttempt,
  isTutor,
}: QuizShowProps) {
  const hasInProgressAttempt =
    existingAttempt && !existingAttempt.completed_at && existingAttempt.remaining_time !== 0;

  const handleStartQuiz = () => {
    router.post(`/courses/${course.id}/quiz/${assessment.id}/start`);
  };

  const handleContinueQuiz = () => {
    router.visit(`/courses/${course.id}/quiz/${assessment.id}/take`);
  };

  const getQuestionTypeCount = () => {
    const counts = {
      multiple_choice: 0,
      fill_blank: 0,
      essay: 0,
    };
    assessment.questions?.forEach((q) => {
      counts[q.type]++;
    });
    return counts;
  };

  const questionCounts = getQuestionTypeCount();

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Courses', href: '/courses' },
        { title: course.title, href: `/courses/${course.id}` },
        { title: assessment.title, href: '#' },
      ]}
    >
      <Head title={assessment.title} />

      <div className="flex flex-col gap-6 p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.visit(`/courses/${course.id}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {assessment.title}
            </h1>
            <p className="text-sm text-muted-foreground">{course.title}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quiz Info */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {assessment.description && (
                  <div>
                    <h4 className="mb-2 font-medium">Description</h4>
                    <p className="text-sm text-muted-foreground">
                      {assessment.description}
                    </p>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <HelpCircle className="h-4 w-4" />
                      Questions
                    </div>
                    <p className="mt-1 text-2xl font-bold">
                      {assessment.questions?.length ?? 0}
                    </p>
                  </div>

                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Trophy className="h-4 w-4" />
                      Max Score
                    </div>
                    <p className="mt-1 text-2xl font-bold">
                      {assessment.max_score}
                    </p>
                  </div>

                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Time Limit
                    </div>
                    <p className="mt-1 text-2xl font-bold">
                      {assessment.time_limit_minutes
                        ? `${assessment.time_limit_minutes} min`
                        : 'None'}
                    </p>
                  </div>

                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <RefreshCw className="h-4 w-4" />
                      Retakes
                    </div>
                    <p className="mt-1 text-2xl font-bold">
                      {assessment.allow_retakes ? 'Allowed' : 'No'}
                    </p>
                  </div>
                </div>

                {/* Question Types */}
                <div>
                  <h4 className="mb-2 font-medium">Question Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {questionCounts.multiple_choice > 0 && (
                      <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        <ListOrdered className="h-4 w-4" />
                        {questionCounts.multiple_choice} Multiple Choice
                      </span>
                    )}
                    {questionCounts.fill_blank > 0 && (
                      <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        <PenLine className="h-4 w-4" />
                        {questionCounts.fill_blank} Fill in the Blank
                      </span>
                    )}
                    {questionCounts.essay > 0 && (
                      <span className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                        <FileText className="h-4 w-4" />
                        {questionCounts.essay} Essay
                      </span>
                    )}
                  </div>
                </div>

                {assessment.due_date && (
                  <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/10">
                    <div className="flex items-center gap-2 text-sm font-medium text-yellow-800 dark:text-yellow-500">
                      <Clock className="h-4 w-4" />
                      Due Date
                    </div>
                    <p className="mt-1 text-yellow-700 dark:text-yellow-400">
                      {new Date(assessment.due_date).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Action Panel */}
          <div className="lg:col-span-1">
            {/* Best Score Card */}
            {bestAttempt && (
              <Card className="mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-green-700 dark:text-green-400">
                        Your Best Score
                      </p>
                      <p className="text-3xl font-bold text-green-800 dark:text-green-500">
                        {bestAttempt.score ?? 0} / {assessment.max_score}
                      </p>
                    </div>
                  </div>
                  {bestAttempt.completed_at && (
                    <p className="mt-2 text-xs text-green-600 dark:text-green-500">
                      Completed:{' '}
                      {new Date(bestAttempt.completed_at).toLocaleString()}
                    </p>
                  )}
                  {!bestAttempt.is_graded && (
                    <p className="mt-2 text-xs text-orange-600 dark:text-orange-500">
                      Some questions pending tutor grading
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Action Card */}
            <Card>
              <CardContent className="pt-6">
                {isTutor ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      As a tutor, you can edit this quiz or view student
                      attempts.
                    </p>
                    <Button
                      className="w-full"
                      onClick={() =>
                        router.visit(
                          `/courses/${course.id}/quiz/${assessment.id}/edit`,
                        )
                      }
                    >
                      <PenLine className="mr-2 h-4 w-4" />
                      Edit Quiz
                    </Button>
                  </div>
                ) : hasInProgressAttempt ? (
                  <div className="space-y-3">
                    <div className="rounded-lg bg-yellow-100 p-3 dark:bg-yellow-900/20">
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-500">
                        You have an attempt in progress!
                      </p>
                      {existingAttempt?.remaining_time && (
                        <p className="text-xs text-yellow-700 dark:text-yellow-400">
                          Time remaining:{' '}
                          {Math.floor(existingAttempt.remaining_time / 60)}m{' '}
                          {existingAttempt.remaining_time % 60}s
                        </p>
                      )}
                    </div>
                    <Button className="w-full" onClick={handleContinueQuiz}>
                      <Play className="mr-2 h-4 w-4" />
                      Continue Quiz
                    </Button>
                  </div>
                ) : canAttempt ? (
                  <div className="space-y-3">
                    {bestAttempt && assessment.allow_retakes && (
                      <p className="text-sm text-muted-foreground">
                        Retaking will keep your highest score.
                      </p>
                    )}
                    <Button className="w-full" onClick={handleStartQuiz}>
                      <Play className="mr-2 h-4 w-4" />
                      {bestAttempt ? 'Retake Quiz' : 'Start Quiz'}
                    </Button>
                    {assessment.time_limit_minutes && (
                      <p className="text-center text-xs text-muted-foreground">
                        You will have {assessment.time_limit_minutes} minutes to
                        complete
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Quiz Completed</span>
                    </div>
                    {!assessment.allow_retakes && (
                      <p className="text-sm text-muted-foreground">
                        Retakes are not allowed for this quiz.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted-foreground" />
                    Answer all questions to the best of your ability
                  </li>
                  {assessment.time_limit_minutes && (
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted-foreground" />
                      Quiz will auto-submit when time expires
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted-foreground" />
                    Your progress is saved automatically
                  </li>
                  {questionCounts.essay > 0 && (
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted-foreground" />
                      Essay questions will be graded by the tutor
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
