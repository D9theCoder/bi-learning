import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { Course } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  ListOrdered,
  PenLine,
  Send,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

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
  const [remainingTime, setRemainingTime] = useState<number | null>(
    attempt.remaining_time ?? null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isFirstQuestion = currentIndex === 0;

  const answeredCount = Object.keys(answers).filter(
    (key) => answers[parseInt(key)] !== '' && answers[parseInt(key)] !== undefined,
  ).length;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const saveProgress = useCallback(() => {
    setIsSaving(true);
    router.post(
      `/courses/${course.id}/quiz/${assessment.id}/save`,
      { answers },
      {
        preserveScroll: true,
        preserveState: true,
        onFinish: () => setIsSaving(false),
      },
    );
  }, [answers, course.id, assessment.id]);

  const handleAutoSubmit = useCallback(() => {
    router.post(`/courses/${course.id}/quiz/${assessment.id}/submit`, {
      answers,
    });
  }, [answers, course.id, assessment.id]);

  // Timer
  useEffect(() => {
    if (remainingTime === null || remainingTime <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingTime, handleAutoSubmit]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveProgress();
    }, 30000);

    return () => clearInterval(interval);
  }, [saveProgress]);

  const handleSubmit = () => {
    router.post(`/courses/${course.id}/quiz/${assessment.id}/submit`, {
      answers,
    });
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
    }
  };

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return <ListOrdered className="h-4 w-4" />;
      case 'fill_blank':
        return <PenLine className="h-4 w-4" />;
      case 'essay':
        return <FileText className="h-4 w-4" />;
      default:
        return null;
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
        {/* Sidebar - Question Navigator */}
        <div className="border-b bg-muted/30 p-4 lg:w-64 lg:border-b-0 lg:border-r">
          {/* Timer */}
          {remainingTime !== null && (
            <div
              className={`mb-4 rounded-lg p-3 ${
                remainingTime < 300
                  ? 'bg-red-100 dark:bg-red-900/20'
                  : 'bg-blue-100 dark:bg-blue-900/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock
                  className={`h-5 w-5 ${
                    remainingTime < 300
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-blue-600 dark:text-blue-400'
                  }`}
                />
                <span
                  className={`text-lg font-bold ${
                    remainingTime < 300
                      ? 'text-red-700 dark:text-red-400'
                      : 'text-blue-700 dark:text-blue-400'
                  }`}
                >
                  {formatTime(remainingTime)}
                </span>
              </div>
              <p
                className={`text-xs ${
                  remainingTime < 300
                    ? 'text-red-600 dark:text-red-500'
                    : 'text-blue-600 dark:text-blue-500'
                }`}
              >
                {remainingTime < 300 ? 'Time is running out!' : 'Time remaining'}
              </p>
            </div>
          )}

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {answeredCount} / {questions.length}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-yellow-500 transition-all"
                style={{
                  width: `${(answeredCount / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question Grid */}
          <div className="grid grid-cols-5 gap-1 lg:grid-cols-4">
            {questions.map((q, idx) => {
              const isAnswered =
                answers[q.id] !== undefined && answers[q.id] !== '';
              const isCurrent = idx === currentIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => goToQuestion(idx)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    isCurrent
                      ? 'bg-yellow-500 text-white'
                      : isAnswered
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-yellow-500" />
              <span className="text-muted-foreground">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-green-100 dark:bg-green-900/20" />
              <span className="text-muted-foreground">Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-muted" />
              <span className="text-muted-foreground">Not answered</span>
            </div>
          </div>

          {/* Save indicator */}
          {isSaving && (
            <p className="mt-4 text-xs text-muted-foreground">Saving...</p>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6">
          <Card className="mx-auto max-w-3xl">
            <CardContent className="pt-6">
              {/* Question Header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 text-sm font-bold text-white">
                    {currentIndex + 1}
                  </span>
                  <span className="flex items-center gap-1 rounded bg-muted px-2 py-1 text-xs">
                    {getQuestionIcon(currentQuestion.type)}
                    {currentQuestion.type === 'multiple_choice'
                      ? 'Multiple Choice'
                      : currentQuestion.type === 'fill_blank'
                        ? 'Fill in the Blank'
                        : 'Essay'}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {currentQuestion.points} point
                  {currentQuestion.points > 1 ? 's' : ''}
                </span>
              </div>

              {/* Question */}
              <div className="mb-6">
                <p className="whitespace-pre-wrap text-lg">
                  {currentQuestion.question}
                </p>
              </div>

              {/* Answer Input */}
              <div className="mb-6">
                {currentQuestion.type === 'multiple_choice' &&
                  currentQuestion.options && (
                    <div className="space-y-2">
                      {currentQuestion.options.map((option, idx) => (
                        <label
                          key={idx}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                            answers[currentQuestion.id] === String(idx)
                              ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestion.id}`}
                            checked={answers[currentQuestion.id] === String(idx)}
                            onChange={() =>
                              handleAnswerChange(currentQuestion.id, String(idx))
                            }
                            className="h-4 w-4 accent-yellow-500"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                {currentQuestion.type === 'fill_blank' && (
                  <Input
                    value={answers[currentQuestion.id] ?? ''}
                    onChange={(e) =>
                      handleAnswerChange(currentQuestion.id, e.target.value)
                    }
                    placeholder="Type your answer here..."
                    className="text-lg"
                  />
                )}

                {currentQuestion.type === 'essay' && (
                  <Textarea
                    value={answers[currentQuestion.id] ?? ''}
                    onChange={(e) =>
                      handleAnswerChange(currentQuestion.id, e.target.value)
                    }
                    placeholder="Write your essay answer here..."
                    rows={8}
                    className="text-base"
                  />
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between border-t pt-4">
                <Button
                  variant="outline"
                  onClick={() => goToQuestion(currentIndex - 1)}
                  disabled={isFirstQuestion}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                <div className="flex gap-2">
                  {isLastQuestion ? (
                    <Button
                      onClick={() => setShowSubmitConfirm(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Submit Quiz
                    </Button>
                  ) : (
                    <Button onClick={() => goToQuestion(currentIndex + 1)}>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Confirmation Dialog */}
          {showSubmitConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <Card className="mx-4 max-w-md">
                <CardContent className="pt-6">
                  <div className="mb-4 flex items-start gap-3">
                    {answeredCount < questions.length ? (
                      <AlertTriangle className="h-6 w-6 flex-shrink-0 text-yellow-500" />
                    ) : (
                      <CheckCircle className="h-6 w-6 flex-shrink-0 text-green-500" />
                    )}
                    <div>
                      <h3 className="font-semibold">Submit Quiz?</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {answeredCount < questions.length
                          ? `You have answered ${answeredCount} of ${questions.length} questions. Are you sure you want to submit?`
                          : 'You have answered all questions. Ready to submit?'}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowSubmitConfirm(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit}>Submit</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
