import {
  QuizActionPanel,
  QuizInfoCard,
  QuizInstructionsCard,
} from '@/components/courses/quiz';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { Assessment, Course, QuizAttempt, QuizQuestion } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

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
  const handleStartQuiz = () => {
    router.post(`/courses/${course.id}/quiz/${assessment.id}/start`);
  };

  const handleContinueQuiz = () => {
    router.visit(`/courses/${course.id}/quiz/${assessment.id}/take`);
  };

  const handleEditQuiz = () => {
    router.visit(`/courses/${course.id}/quiz/${assessment.id}/edit`);
  };

  const hasEssayQuestions =
    assessment.questions?.some((q) => q.type === 'essay') ?? false;

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
          <div className="lg:col-span-2">
            <QuizInfoCard assessment={assessment} />
          </div>

          <div className="lg:col-span-1">
            <QuizActionPanel
              assessment={assessment}
              existingAttempt={existingAttempt}
              bestAttempt={bestAttempt}
              canAttempt={canAttempt}
              isTutor={isTutor}
              onStartQuiz={handleStartQuiz}
              onContinueQuiz={handleContinueQuiz}
              onEditQuiz={handleEditQuiz}
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
