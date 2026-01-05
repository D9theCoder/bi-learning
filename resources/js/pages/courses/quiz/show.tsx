import {
  QuizActionPanel,
  QuizInfoCard,
  QuizInstructionsCard,
} from '@/components/courses/quiz';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type {
  Assessment,
  AssessmentAttempt,
  AssessmentQuestion,
  Course,
  FinalScore,
} from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface QuizShowProps {
  course: Course;
  assessment: Assessment & { questions: AssessmentQuestion[] };
  existingAttempt?: AssessmentAttempt | null;
  bestAttempt?: AssessmentAttempt | null;
  canAttempt: boolean;
  isTutor: boolean;
  finalScore?: FinalScore | null;
  canStartRemedial?: boolean;
  shouldHideScores?: boolean;
}

export default function QuizShow({
  course,
  assessment,
  existingAttempt,
  bestAttempt,
  canAttempt,
  isTutor,
  canStartRemedial = false,
  shouldHideScores = false,
}: QuizShowProps) {
  const handleStartQuiz = () => {
    router.post(`/courses/${course.id}/quiz/${assessment.id}/start`);
  };

  const handleContinueQuiz = () => {
    router.visit(`/courses/${course.id}/quiz/${assessment.id}/take`);
  };

  const handleEditQuiz = () => {
    router.visit(`/courses/${course.id}/quiz/${assessment.id}/edit`);
  };

  const handleStartRemedial = () => {
    router.post(`/courses/${course.id}/quiz/${assessment.id}/remedial`);
  };

  const hasEssayQuestions =
    assessment.questions?.some((q) => q.type === 'essay') ?? false;

  const typeLabel =
    assessment.type === 'practice'
      ? 'Practice'
      : assessment.type === 'final_exam'
        ? 'Final Exam'
        : 'Quiz';
  const typeBadgeStyles =
    assessment.type === 'final_exam'
      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      : assessment.type === 'practice'
        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Courses', href: '/courses' },
        { title: course.title, href: `/courses/${course.id}` },
        { title: assessment.title, href: '#' },
      ]}
    >
      <Head title={`${typeLabel} - ${assessment.title}`} />

      <div className="flex flex-col gap-6 p-4 lg:p-6">
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
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${typeBadgeStyles}`}
          >
            {typeLabel}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <QuizInfoCard assessment={assessment} />
            {assessment.type === 'final_exam' && shouldHideScores && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-800/60 dark:bg-amber-900/20 dark:text-amber-200">
                Final exam results are hidden until your instructor reviews
                submissions.
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <QuizActionPanel
              assessment={assessment}
              existingAttempt={existingAttempt}
              bestAttempt={bestAttempt}
              canAttempt={canAttempt}
              isTutor={isTutor}
              canStartRemedial={canStartRemedial}
              shouldHideScores={shouldHideScores}
              onStartQuiz={handleStartQuiz}
              onContinueQuiz={handleContinueQuiz}
              onEditQuiz={handleEditQuiz}
              onStartRemedial={handleStartRemedial}
            />

            <QuizInstructionsCard
              timeLimitMinutes={assessment.time_limit_minutes ?? null}
              hasEssayQuestions={hasEssayQuestions}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
