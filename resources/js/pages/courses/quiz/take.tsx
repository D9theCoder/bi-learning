import {
  QuizPowerupBar,
  QuizQuestionPanel,
  QuizSubmitDialog,
  QuizTakeSidebar,
} from '@/components/courses/quiz';
import { SuccessModal } from '@/components/ui/success-modal';
import { useQuizPowerups } from '@/hooks/use-quiz-powerups';
import { useQuizTimer } from '@/hooks/use-quiz-timer';
import AppLayout from '@/layouts/app-layout';
import type { AnswerConfig, Course, Powerup, PowerupUsage } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useCallback, useMemo, useState } from 'react';

interface QuizQuestion {
  id: number;
  type: 'multiple_choice' | 'fill_blank' | 'essay';
  question: string;
  answer_config: AnswerConfig;
  points: number;
  order: number;
}

interface QuizTakeProps {
  course: Course;
  assessment: {
    id: number;
    title: string;
    description?: string | null;
    type: 'practice' | 'quiz' | 'final_exam';
    time_limit_minutes?: number | null;
    max_score: number;
    powerups?: Powerup[];
  };
  questions: QuizQuestion[];
  attempt: {
    id: number;
    answers: Record<number, string>;
    started_at: string;
    remaining_time?: number | null;
    is_remedial?: boolean;
  };
  usedPowerups: PowerupUsage[];
}

export default function QuizTake({
  course,
  assessment,
  questions,
  attempt,
  usedPowerups: initialUsedPowerups,
}: QuizTakeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>(
    attempt.answers ?? {},
  );
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).filter(
    (key) =>
      answers[parseInt(key)] !== '' && answers[parseInt(key)] !== undefined,
  ).length;

  const handleSubmit = useCallback(() => {
    router.post(
      `/courses/${course.id}/quiz/${assessment.id}/submit`,
      {
        answers,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setShowSubmitConfirm(false);
          setShowSuccessModal(true);
        },
      },
    );
  }, [answers, course.id, assessment.id]);

  const { remainingTime, isSaving, setRemainingTime } = useQuizTimer({
    initialRemainingTime: attempt.remaining_time ?? null,
    courseId: course.id,
    assessmentId: assessment.id,
    answers,
    onAutoSubmit: handleSubmit,
  });

  const {
    usedPowerups,
    applyPowerup,
    isUsing: isUsingPowerup,
    error: powerupError,
    clearError: clearPowerupError,
  } = useQuizPowerups({
    courseId: course.id,
    assessmentId: assessment.id,
    initialUsedPowerups,
  });

  const hiddenOptionsByQuestion = useMemo(() => {
    const map = new Map<number, number[]>();

    usedPowerups.forEach((usage) => {
      if (usage.slug !== '50-50') {
        return;
      }

      const details = usage.details as {
        question_id?: number | string;
        removed_options?: Array<number | string>;
      };

      if (!details?.question_id || !details.removed_options) {
        return;
      }

      const questionId = Number(details.question_id);
      const removedOptions = details.removed_options
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value));

      if (!Number.isFinite(questionId) || removedOptions.length === 0) {
        return;
      }

      const existing = map.get(questionId) ?? [];
      const merged = new Set([...existing, ...removedOptions]);
      map.set(questionId, Array.from(merged));
    });

    return map;
  }, [usedPowerups]);

  const hiddenOptionsForCurrent =
    hiddenOptionsByQuestion.get(currentQuestion.id) ?? [];

  const handleUsePowerup = useCallback(
    async (powerup: Powerup, questionId?: number) => {
      const response = await applyPowerup(powerup.id, questionId);

      if (response?.remaining_time !== undefined) {
        setRemainingTime(response.remaining_time ?? null);
      }
    },
    [applyPowerup, setRemainingTime],
  );

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
    }
  };

  const titleLabel =
    assessment.type === 'final_exam'
      ? 'Final Exam'
      : assessment.type === 'practice'
        ? 'Practice'
        : 'Quiz';

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Courses', href: '/courses' },
        { title: course.title, href: `/courses/${course.id}` },
        { title: assessment.title, href: '#' },
      ]}
    >
      <Head title={`Taking ${titleLabel} - ${assessment.title}`} />

      <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row">
        <QuizTakeSidebar
          questions={questions}
          answers={answers}
          currentIndex={currentIndex}
          remainingTime={remainingTime}
          isSaving={isSaving}
          onQuestionSelect={goToQuestion}
        />

        <div className="flex-1 p-4 lg:p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium">
            <span
              className={`rounded-full px-3 py-1 ${assessment.type === 'final_exam' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : assessment.type === 'practice' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}
            >
              {assessment.type === 'final_exam'
                ? 'Final Exam'
                : assessment.type === 'practice'
                  ? 'Practice'
                  : 'Quiz'}
            </span>
            {attempt.is_remedial && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
                Remedial Attempt
              </span>
            )}
          </div>

          {assessment.powerups && assessment.powerups.length > 0 ? (
            <QuizPowerupBar
              powerups={assessment.powerups}
              usedPowerups={usedPowerups}
              currentQuestion={currentQuestion}
              remainingTime={remainingTime}
              isUsing={isUsingPowerup}
              error={powerupError}
              onClearError={clearPowerupError}
              onUsePowerup={handleUsePowerup}
            />
          ) : null}

          <QuizQuestionPanel
            question={currentQuestion}
            questionIndex={currentIndex}
            totalQuestions={questions.length}
            answer={answers[currentQuestion.id]}
            hiddenOptionIndexes={hiddenOptionsForCurrent}
            onAnswerChange={handleAnswerChange}
            onPrevious={() => goToQuestion(currentIndex - 1)}
            onNext={() => goToQuestion(currentIndex + 1)}
            onSubmit={() => setShowSubmitConfirm(true)}
          />

          {showSubmitConfirm && (
            <QuizSubmitDialog
              answeredCount={answeredCount}
              totalQuestions={questions.length}
              onConfirm={handleSubmit}
              onCancel={() => setShowSubmitConfirm(false)}
            />
          )}

          <SuccessModal
            open={showSuccessModal}
            onOpenChange={setShowSuccessModal}
            title="Assessment submitted!"
            description="Your answers are in. We will update your results shortly."
          />
        </div>
      </div>
    </AppLayout>
  );
}
