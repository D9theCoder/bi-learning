import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CourseContent } from '@/types';
import { router, useForm } from '@inertiajs/react';

const contentTypes = [
  { value: 'file', label: 'File' },
  { value: 'video', label: 'Video' },
  { value: 'link', label: 'Link' },
  { value: 'quiz', label: 'Quiz' },
];

interface ContentRowProps {
  courseId: number;
  lessonId: number;
  content: CourseContent;
}

export function ContentRow({ courseId, lessonId, content }: ContentRowProps) {
  const contentForm = useForm<{
    title: string;
    type: CourseContent['type'];
    file_path: File | string | null;
    url: string;
    description: string;
    due_date: string;
    duration_minutes: number | '';
    is_required: boolean;
  }>({
    title: content.title ?? '',
    type: content.type ?? 'file',
    file_path: content.file_path ?? '',
    url: content.url ?? '',
    description: content.description ?? '',
    due_date: content.due_date ?? '',
    duration_minutes: content.duration_minutes ?? '',
    is_required: content.is_required ?? false,
  });

  const saveContent = () => {
    contentForm.put(
      `/courses/manage/${courseId}/lessons/${lessonId}/contents/${content.id}`,
      {
        preserveScroll: true,
      },
    );
  };

  const deleteContent = () => {
    router.delete(
      `/courses/manage/${courseId}/lessons/${lessonId}/contents/${content.id}`,
      {
        preserveScroll: true,
      },
    );
  };

  return (
    <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`content-title-${content.id}`}>Title</Label>
          <Input
            id={`content-title-${content.id}`}
            value={contentForm.data.title}
            onChange={(e) => contentForm.setData('title', e.target.value)}
          />
          {contentForm.errors.title ? (
            <p className="text-xs text-destructive">
              {contentForm.errors.title}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`content-type-${content.id}`}>Type</Label>
          <select
            id={`content-type-${content.id}`}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={contentForm.data.type}
            onChange={(e) =>
              contentForm.setData(
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
          {contentForm.errors.type ? (
            <p className="text-xs text-destructive">
              {contentForm.errors.type}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 pt-3 lg:grid-cols-2">
        {(contentForm.data.type === 'video' ||
          contentForm.data.type === 'link') && (
          <div className="space-y-2">
            <Label htmlFor={`content-url-${content.id}`}>URL</Label>
            <Input
              id={`content-url-${content.id}`}
              value={contentForm.data.url ?? ''}
              onChange={(e) => contentForm.setData('url', e.target.value)}
              placeholder="https://..."
            />
          </div>
        )}
        {contentForm.data.type === 'file' && (
          <div className="space-y-2">
            <Label htmlFor={`content-file-${content.id}`}>File Upload</Label>
            <Input
              id={`content-file-${content.id}`}
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  contentForm.setData('file_path', file);
                }
              }}
            />
            {typeof contentForm.data.file_path === 'string' &&
              contentForm.data.file_path && (
                <p className="text-xs text-muted-foreground">
                  Current: {contentForm.data.file_path}
                </p>
              )}
          </div>
        )}
        {contentForm.data.type === 'quiz' && (
          <div className="space-y-2">
            <Label htmlFor={`content-due-${content.id}`}>Due date</Label>
            <Input
              id={`content-due-${content.id}`}
              type="date"
              value={contentForm.data.due_date ?? ''}
              onChange={(e) => contentForm.setData('due_date', e.target.value)}
            />
            {contentForm.errors.due_date ? (
              <p className="text-xs text-destructive">
                {contentForm.errors.due_date}
              </p>
            ) : null}
          </div>
        )}
      </div>

      <div className="grid gap-3 pt-3 lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor={`content-description-${content.id}`}>
            Description
          </Label>
          <Textarea
            id={`content-description-${content.id}`}
            rows={2}
            value={contentForm.data.description ?? ''}
            onChange={(e) => contentForm.setData('description', e.target.value)}
          />
          {contentForm.errors.description ? (
            <p className="text-xs text-destructive">
              {contentForm.errors.description}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`content-duration-${content.id}`}>
            Duration (minutes)
          </Label>
          <Input
            id={`content-duration-${content.id}`}
            type="number"
            min={1}
            value={contentForm.data.duration_minutes ?? ''}
            onChange={(e) =>
              contentForm.setData(
                'duration_minutes',
                e.target.value === '' ? '' : Number(e.target.value),
              )
            }
          />
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              className="size-4 rounded border-border"
              checked={contentForm.data.is_required}
              onChange={(e) =>
                contentForm.setData('is_required', e.target.checked)
              }
            />
            Required
          </label>
          {contentForm.errors.duration_minutes ? (
            <p className="text-xs text-destructive">
              {contentForm.errors.duration_minutes}
            </p>
          ) : null}
          {contentForm.errors.is_required ? (
            <p className="text-xs text-destructive">
              {contentForm.errors.is_required}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          disabled={contentForm.processing}
          onClick={saveContent}
        >
          Save content
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive"
          disabled={contentForm.processing}
          onClick={deleteContent}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
