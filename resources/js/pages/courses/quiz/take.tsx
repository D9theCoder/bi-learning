import {
  QuizQuestionPanel,
  QuizSubmitDialog,
  QuizTakeSidebar,
} from '@/components/courses/quiz';
import { useQuizTimer } from '@/hooks/use-quiz-timer';
import AppLayout from '@/layouts/app-layout';
import type { Course } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useCallback, useState } from 'react';

interface QuizQuestion {
  id: number;
  type: 'multiple_choice' | 'fill_blank' | 'essay';
  question: string;
  options?: string[] | null;
  points: number;
  order: number;
}

interface QuizTakeProps {
  course: Course;
  assessment: {
    id: number;
    title: string;
    description?: string | null;
    time_limit_minutes?: number | null;
    max_score: number;
  };
  questions: QuizQuestion[];
  attempt: {
    id: number;
    answers: Record<number, string>;
    started_at: string;
    remaining_time?: number | null;
  };
}

export default function QuizTake({
  course,
  assessment,
  questions,
  attempt,
}: QuizTakeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>(
    attempt.answers ?? {},
  );
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).filter(
    (key) =>
      answers[parseInt(key)] !== '' && answers[parseInt(key)] !== undefined,
  ).length;

  const handleSubmit = useCallback(() => {
    router.post(`/courses/${course.id}/quiz/${assessment.id}/submit`, {
      answers,
    });
  }, [answers, course.id, assessment.id]);

  const { remainingTime, isSaving } = useQuizTimer({
    initialRemainingTime: attempt.remaining_time ?? null,
    courseId: course.id,
    assessmentId: assessment.id,
    answers,
    onAutoSubmit: handleSubmit,
  });

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
    }
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Courses', href: '/courses' },
        { title: course.title, href: `/courses/${course.id}` },
        { title: assessment.title, href: '#' },
      ]}
    >
      <Head title={`Taking Quiz - ${assessment.title}`} />

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
          <QuizQuestionPanel
            question={currentQuestion}
            questionIndex={currentIndex}
            totalQuestions={questions.length}
            answer={answers[currentQuestion.id]}
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
        </div>
      </div>
    </AppLayout>
  );
}
