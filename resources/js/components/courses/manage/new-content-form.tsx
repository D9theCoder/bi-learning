import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CourseContent } from '@/types';
import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';

const contentTypes = [
  { value: 'file', label: 'File' },
  { value: 'video', label: 'Video' },
  { value: 'link', label: 'Link' },
  { value: 'quiz', label: 'Quiz' },
];

interface NewContentFormProps {
  courseId: number;
  lessonId: number;
}

export function NewContentForm({ courseId, lessonId }: NewContentFormProps) {
  const newContentForm = useForm<{
    title: string;
    type: CourseContent['type'];
    file_path: File | string | null;
    url: string;
    description: string;
    due_date: string;
    duration_minutes: number | '';
    is_required: boolean;
  }>({
    title: '',
    type: 'file',
    file_path: '',
    url: '',
    description: '',
    due_date: '',
    duration_minutes: '',
    is_required: false,
  });

  const submitNewContent = () => {
    newContentForm.post(
      `/courses/manage/${courseId}/lessons/${lessonId}/contents`,
      {
        preserveScroll: true,
        onSuccess: () => newContentForm.reset(),
      },
    );
  };

  return (
    <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-4">
      <p className="text-sm font-semibold text-foreground">Add content</p>
      <div className="grid gap-3 pt-3 lg:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`new-content-title-${lessonId}`}>Title</Label>
          <Input
            id={`new-content-title-${lessonId}`}
            value={newContentForm.data.title}
            onChange={(e) => newContentForm.setData('title', e.target.value)}
            placeholder="Content title"
          />
          {newContentForm.errors.title ? (
            <p className="text-xs text-destructive">
              {newContentForm.errors.title}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`new-content-type-${lessonId}`}>Type</Label>
          <select
            id={`new-content-type-${lessonId}`}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={newContentForm.data.type}
            onChange={(e) =>
              newContentForm.setData(
                'type',
                e.target.value as CourseContent['type'],
              )
            }
          >
            {contentTypes.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {newContentForm.errors.type ? (
            <p className="text-xs text-destructive">
              {newContentForm.errors.type}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 pt-3 lg:grid-cols-2">
        {(newContentForm.data.type === 'video' ||
          newContentForm.data.type === 'link') && (
          <div className="space-y-2">
            <Label htmlFor={`new-content-url-${lessonId}`}>URL</Label>
            <Input
              id={`new-content-url-${lessonId}`}
              value={newContentForm.data.url ?? ''}
              onChange={(e) => newContentForm.setData('url', e.target.value)}
              placeholder="https://..."
            />
          </div>
        )}
        {newContentForm.data.type === 'file' && (
          <div className="space-y-2">
            <Label htmlFor={`new-content-file-${lessonId}`}>File Upload</Label>
            <Input
              id={`new-content-file-${lessonId}`}
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  newContentForm.setData('file_path', file);
                }
              }}
            />
          </div>
        )}
        {newContentForm.data.type === 'quiz' && (
          <div className="space-y-2">
            <Label htmlFor={`new-content-due-${lessonId}`}>Due date</Label>
            <Input
              id={`new-content-due-${lessonId}`}
              type="date"
              value={newContentForm.data.due_date ?? ''}
              onChange={(e) =>
                newContentForm.setData('due_date', e.target.value)
              }
            />
            {newContentForm.errors.due_date ? (
              <p className="text-xs text-destructive">
                {newContentForm.errors.due_date}
              </p>
            ) : null}
          </div>
        )}
      </div>

      <div className="grid gap-3 pt-3 lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor={`new-content-description-${lessonId}`}>
            Description
          </Label>
          <Textarea
            id={`new-content-description-${lessonId}`}
            rows={2}
            value={newContentForm.data.description ?? ''}
            onChange={(e) =>
              newContentForm.setData('description', e.target.value)
            }
          />
          {newContentForm.errors.description ? (
            <p className="text-xs text-destructive">
              {newContentForm.errors.description}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`new-content-duration-${lessonId}`}>
            Duration (minutes)
          </Label>
          <Input
            id={`new-content-duration-${lessonId}`}
            type="number"
            min={1}
            value={newContentForm.data.duration_minutes ?? ''}
            onChange={(e) =>
              newContentForm.setData(
                'duration_minutes',
                e.target.value === '' ? '' : Number(e.target.value),
              )
            }
          />
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              className="size-4 rounded border-border"
              checked={newContentForm.data.is_required}
              onChange={(e) =>
                newContentForm.setData('is_required', e.target.checked)
              }
            />
            Required
          </label>
          {newContentForm.errors.duration_minutes ? (
            <p className="text-xs text-destructive">
              {newContentForm.errors.duration_minutes}
            </p>
          ) : null}
          {newContentForm.errors.is_required ? (
            <p className="text-xs text-destructive">
              {newContentForm.errors.is_required}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <Button
          size="sm"
          onClick={submitNewContent}
          disabled={newContentForm.processing}
          className="inline-flex items-center gap-2"
        >
          <Save className="size-4" />
          Add content
        </Button>
      </div>
    </div>
  );
}
