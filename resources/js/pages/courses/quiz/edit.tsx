import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { Assessment, Course, QuizQuestion } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
  ArrowLeft,
  CheckCircle,
  GripVertical,
  HelpCircle,
  ListOrdered,
  PenLine,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

interface QuizEditProps {
  course: Course;
  assessment: Assessment & { questions: QuizQuestion[] };
}

const questionTypes = [
  {
    value: 'multiple_choice',
    label: 'Multiple Choice',
    icon: ListOrdered,
    description: 'Auto-graded, 4 options max',
  },
  {
    value: 'fill_blank',
    label: 'Fill in the Blank',
    icon: PenLine,
    description: 'Auto-graded, exact match',
  },
  {
    value: 'essay',
    label: 'Essay',
    icon: HelpCircle,
    description: 'Manual grading by tutor',
  },
] as const;

export default function QuizEdit({ course, assessment }: QuizEditProps) {
  const [showNewQuestion, setShowNewQuestion] = useState(false);
  const [newQuestionType, setNewQuestionType] = useState<
    'multiple_choice' | 'fill_blank' | 'essay'
  >('multiple_choice');

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.visit(`/courses/manage/${course.id}/edit`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Quiz Builder
              </h1>
              <p className="text-sm text-muted-foreground">
                {course.title} - {assessment.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                assessment.is_published
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}
            >
              {assessment.is_published ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Settings Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quiz Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={settingsForm.data.title}
                    onChange={(e) =>
                      settingsForm.setData('title', e.target.value)
                    }
                  />
                  {settingsForm.errors.title && (
                    <p className="text-xs text-destructive">
                      {settingsForm.errors.title}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={settingsForm.data.description}
                    onChange={(e) =>
                      settingsForm.setData('description', e.target.value)
                    }
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date (optional)</Label>
                  <Input
                    id="due_date"
                    type="datetime-local"
                    value={settingsForm.data.due_date}
                    onChange={(e) =>
                      settingsForm.setData('due_date', e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time_limit">
                    Time Limit (minutes, optional)
                  </Label>
                  <Input
                    id="time_limit"
                    type="number"
                    min={1}
                    max={480}
                    placeholder="No time limit"
                    value={settingsForm.data.time_limit_minutes}
                    onChange={(e) =>
                      settingsForm.setData(
                        'time_limit_minutes',
                        e.target.value ? parseInt(e.target.value) : '',
                      )
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty for no time limit (due date only)
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allow_retakes"
                    checked={settingsForm.data.allow_retakes}
                    onCheckedChange={(checked) =>
                      settingsForm.setData('allow_retakes', !!checked)
                    }
                  />
                  <Label htmlFor="allow_retakes" className="cursor-pointer">
                    Allow retakes (highest score kept)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_published"
                    checked={settingsForm.data.is_published}
                    onCheckedChange={(checked) =>
                      settingsForm.setData('is_published', !!checked)
                    }
                  />
                  <Label htmlFor="is_published" className="cursor-pointer">
                    Publish quiz (visible to students)
                  </Label>
                </div>

                <div className="border-t pt-4">
                  <div className="mb-4 rounded-lg bg-muted/50 p-3">
                    <p className="text-sm font-medium">Quiz Summary</p>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <p>Questions: {assessment.questions?.length ?? 0}</p>
                      <p>Total Points: {assessment.max_score}</p>
                    </div>
                  </div>
                  <Button
                    onClick={saveSettings}
                    disabled={settingsForm.processing}
                    className="w-full"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Questions Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Questions</CardTitle>
                <Button
                  size="sm"
                  onClick={() => setShowNewQuestion(!showNewQuestion)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* New Question Form */}
                {showNewQuestion && (
                  <div className="rounded-lg border-2 border-dashed border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-900/10">
                    <p className="mb-3 font-medium text-yellow-800 dark:text-yellow-500">
                      Choose question type:
                    </p>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {questionTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => {
                            setNewQuestionType(type.value);
                          }}
                          className={`flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors ${
                            newQuestionType === type.value
                              ? 'border-yellow-500 bg-yellow-100 dark:bg-yellow-900/20'
                              : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                          }`}
                        >
                          <type.icon className="h-5 w-5" />
                          <span className="text-sm font-medium">
                            {type.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {type.description}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-4">
                      <NewQuestionForm
                        courseId={course.id}
                        assessmentId={assessment.id}
                        type={newQuestionType}
                        onCancel={() => setShowNewQuestion(false)}
                        onSuccess={() => setShowNewQuestion(false)}
                      />
                    </div>
                  </div>
                )}

                {/* Existing Questions */}
                {assessment.questions && assessment.questions.length > 0 ? (
                  <div className="space-y-4">
                    {assessment.questions.map((question, index) => (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        index={index}
                        courseId={course.id}
                        assessmentId={assessment.id}
                      />
                    ))}
                  </div>
                ) : (
                  !showNewQuestion && (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                      <HelpCircle className="mx-auto h-10 w-10 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        No questions yet. Click "Add Question" to get started.
                      </p>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

interface NewQuestionFormProps {
  courseId: number;
  assessmentId: number;
  type: 'multiple_choice' | 'fill_blank' | 'essay';
  onCancel: () => void;
  onSuccess: () => void;
}

function NewQuestionForm({
  courseId,
  assessmentId,
  type,
  onCancel,
  onSuccess,
}: NewQuestionFormProps) {
  const form = useForm({
    type,
    question: '',
    options: ['', '', '', ''],
    correct_answer: '',
    points: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.post(`/courses/${courseId}/quiz/${assessmentId}/questions`, {
      preserveScroll: true,
      onSuccess: () => {
        form.reset();
        onSuccess();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="new-question">Question</Label>
        <Textarea
          id="new-question"
          value={form.data.question}
          onChange={(e) => form.setData('question', e.target.value)}
          placeholder="Enter your question..."
          rows={3}
        />
        {form.errors.question && (
          <p className="text-xs text-destructive">{form.errors.question}</p>
        )}
      </div>

      {type === 'multiple_choice' && (
        <div className="space-y-2">
          <Label>Options (select the correct one)</Label>
          {form.data.options.map((option, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct_answer"
                checked={form.data.correct_answer === String(idx)}
                onChange={() => form.setData('correct_answer', String(idx))}
                className="h-4 w-4"
              />
              <Input
                value={option}
                onChange={(e) => {
                  const newOptions = [...form.data.options];
                  newOptions[idx] = e.target.value;
                  form.setData('options', newOptions);
                }}
                placeholder={`Option ${idx + 1}`}
              />
            </div>
          ))}
        </div>
      )}

      {type === 'fill_blank' && (
        <div className="space-y-2">
          <Label htmlFor="correct-answer">Correct Answer</Label>
          <Input
            id="correct-answer"
            value={form.data.correct_answer}
            onChange={(e) => form.setData('correct_answer', e.target.value)}
            placeholder="Enter the correct answer..."
          />
          <p className="text-xs text-muted-foreground">
            Case-insensitive exact match
          </p>
        </div>
      )}

      {type === 'essay' && (
        <p className="text-sm text-muted-foreground">
          Essay answers will require manual grading by the tutor.
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="points">Points</Label>
        <Input
          id="points"
          type="number"
          min={1}
          value={form.data.points}
          onChange={(e) => form.setData('points', parseInt(e.target.value) || 1)}
          className="w-24"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={form.processing}>
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>
    </form>
  );
}

interface QuestionCardProps {
  question: QuizQuestion;
  index: number;
  courseId: number;
  assessmentId: number;
}

function QuestionCard({
  question,
  index,
  courseId,
  assessmentId,
}: QuestionCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm({
    type: question.type,
    question: question.question,
    options: question.options ?? ['', '', '', ''],
    correct_answer: question.correct_answer ?? '',
    points: question.points,
  });

  const handleSave = () => {
    form.put(
      `/courses/${courseId}/quiz/${assessmentId}/questions/${question.id}`,
      {
        preserveScroll: true,
        onSuccess: () => setIsEditing(false),
      },
    );
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this question?')) {
      router.delete(
        `/courses/${courseId}/quiz/${assessmentId}/questions/${question.id}`,
        {
          preserveScroll: true,
        },
      );
    }
  };

  const typeConfig = questionTypes.find((t) => t.value === question.type);

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1">
            <GripVertical className="h-5 w-5 cursor-move text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              {index + 1}
            </span>
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <Textarea
                  value={form.data.question}
                  onChange={(e) => form.setData('question', e.target.value)}
                  rows={2}
                />

                {question.type === 'multiple_choice' && (
                  <div className="space-y-2">
                    <Label>Options</Label>
                    {form.data.options.map((option, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct_answer_${question.id}`}
                          checked={form.data.correct_answer === String(idx)}
                          onChange={() =>
                            form.setData('correct_answer', String(idx))
                          }
                          className="h-4 w-4"
                        />
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...form.data.options];
                            newOptions[idx] = e.target.value;
                            form.setData('options', newOptions);
                          }}
                          placeholder={`Option ${idx + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {question.type === 'fill_blank' && (
                  <div className="space-y-2">
                    <Label>Correct Answer</Label>
                    <Input
                      value={form.data.correct_answer}
                      onChange={(e) =>
                        form.setData('correct_answer', e.target.value)
                      }
                    />
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label>Points:</Label>
                    <Input
                      type="number"
                      min={1}
                      value={form.data.points}
                      onChange={(e) =>
                        form.setData('points', parseInt(e.target.value) || 1)
                      }
                      className="w-20"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={form.processing}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  {typeConfig && (
                    <span className="flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs">
                      <typeConfig.icon className="h-3 w-3" />
                      {typeConfig.label}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {question.points} pt{question.points > 1 ? 's' : ''}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap">{question.question}</p>

                {question.type === 'multiple_choice' && question.options && (
                  <div className="mt-2 space-y-1">
                    {question.options.map((option, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 rounded px-2 py-1 text-sm ${
                          question.correct_answer === String(idx)
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {question.correct_answer === String(idx) ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <span className="h-4 w-4" />
                        )}
                        {option}
                      </div>
                    ))}
                  </div>
                )}

                {question.type === 'fill_blank' && question.correct_answer && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Answer: {question.correct_answer}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {!isEditing && (
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsEditing(true)}
            >
              <PenLine className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
