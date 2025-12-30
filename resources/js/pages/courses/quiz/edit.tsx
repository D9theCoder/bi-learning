import {
  QuestionsSection,
  QuizBuilderHeader,
  QuizSettingsCard,
} from '@/components/courses/quiz';
import AppLayout from '@/layouts/app-layout';
import type { Assessment, Course, QuizQuestion } from '@/types';
import { Head, useForm } from '@inertiajs/react';

interface QuizEditProps {
  course: Course;
  assessment: Assessment & { questions: QuizQuestion[] };
}

export default function QuizEdit({ course, assessment }: QuizEditProps) {
  const settingsForm = useForm({
    title: assessment.title ?? '',
    description: assessment.description ?? '',
    lesson_id: assessment.lesson_id ?? '',
    due_date: assessment.due_date
      ? new Date(assessment.due_date).toISOString().slice(0, 16)
      : '',
    max_score: assessment.max_score ?? 100,
    allow_retakes: assessment.allow_retakes ?? false,
    time_limit_minutes: assessment.time_limit_minutes ?? '',
    is_published: assessment.is_published ?? false,
  });

  const saveSettings = () => {
    settingsForm.put(`/courses/${course.id}/quiz/${assessment.id}`, {
      preserveScroll: true,
    });
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Courses', href: '/courses' },
        { title: course.title, href: `/courses/${course.id}` },
        { title: 'Quiz Builder', href: '#' },
      ]}
    >
      <Head title={`Edit Quiz - ${assessment.title}`} />

      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <QuizBuilderHeader
          courseId={course.id}
          courseTitle={course.title}
          assessmentTitle={assessment.title}
          isPublished={assessment.is_published ?? false}
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <QuizSettingsCard
              form={settingsForm}
              assessment={assessment}
              onSave={saveSettings}
            />
          </div>

          <div className="lg:col-span-2">
            <QuestionsSection
              questions={assessment.questions ?? []}
              courseId={course.id}
              assessmentId={assessment.id}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
