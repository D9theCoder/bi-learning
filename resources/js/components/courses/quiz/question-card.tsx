import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { QuizQuestion } from '@/types';
import { router, useForm } from '@inertiajs/react';
import {
  CheckCircle,
  GripVertical,
  HelpCircle,
  ListOrdered,
  PenLine,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

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

interface QuestionCardProps {
  question: QuizQuestion;
  index: number;
  courseId: number;
  assessmentId: number;
}

export function QuestionCard({
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
