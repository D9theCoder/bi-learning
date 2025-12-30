import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Assessment, QuizAttempt } from '@/types';
import { CheckCircle, PenLine, Play, Trophy } from 'lucide-react';

interface QuizActionPanelProps {
  assessment: Assessment;
  existingAttempt?: QuizAttempt | null;
  bestAttempt?: QuizAttempt | null;
  canAttempt: boolean;
  isTutor: boolean;
  onStartQuiz: () => void;
  onContinueQuiz: () => void;
  onEditQuiz: () => void;
}

export function QuizActionPanel({
  assessment,
  existingAttempt,
  bestAttempt,
  canAttempt,
  isTutor,
  onStartQuiz,
  onContinueQuiz,
  onEditQuiz,
}: QuizActionPanelProps) {
  const hasInProgressAttempt =
    existingAttempt &&
    !existingAttempt.completed_at &&
    existingAttempt.remaining_time !== 0;

  return (
    <>
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
                Completed: {new Date(bestAttempt.completed_at).toLocaleString()}
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

      <Card>
        <CardContent className="pt-6">
          {isTutor ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                As a tutor, you can edit this quiz or view student attempts.
              </p>
              <Button className="w-full" onClick={onEditQuiz}>
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
              <Button className="w-full" onClick={onContinueQuiz}>
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
              <Button className="w-full" onClick={onStartQuiz}>
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
    </>
  );
}
