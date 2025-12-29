import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { CourseContent, EditCoursePageProps, Lesson } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

const difficulties = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const contentTypes = [
  { value: 'file', label: 'File' },
  { value: 'video', label: 'Video' },
  { value: 'link', label: 'Link' },
  { value: 'quiz', label: 'Quiz' },
];

type LessonWithContents = Lesson & { contents?: CourseContent[] };

type ContentRowProps = {
  courseId: number;
  lessonId: number;
  content: CourseContent;
};

function ContentRow({ courseId, lessonId, content }: ContentRowProps) {
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
        {/* Show URL for video and link types */}
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
        {/* Show file upload for file type */}
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
        {/* Show due date only for quiz type */}
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

type NewContentFormProps = {
  courseId: number;
  lessonId: number;
};

function NewContentForm({ courseId, lessonId }: NewContentFormProps) {
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
        {/* Show URL for video and link types */}
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
        {/* Show file upload for file type */}
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
        {/* Show due date only for quiz type */}
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

type LessonCardProps = {
  courseId: number;
  lesson: LessonWithContents;
};

function LessonCard({ courseId, lesson }: LessonCardProps) {
  const lessonForm = useForm<{
    title: string;
    description: string;
    duration_minutes: number | '';
    order: number | '';
    video_url: string;
    meeting_url: string;
    meeting_start_time: string;
    meeting_end_time: string;
  }>({
    title: lesson.title ?? '',
    description: lesson.description ?? '',
    duration_minutes: lesson.duration_minutes ?? '',
    order: lesson.order ?? '',
    video_url: lesson.video_url ?? '',
    meeting_url: lesson.meeting_url ?? '',
    // Convert ISO datetime to local datetime-local format (YYYY-MM-DDTHH:MM)
    meeting_start_time: lesson.meeting_start_time
      ? lesson.meeting_start_time.replace('Z', '').substring(0, 16)
      : '',
    meeting_end_time: lesson.meeting_end_time
      ? lesson.meeting_end_time.replace('Z', '').substring(0, 16)
      : '',
  });

  const saveLesson = () => {
    lessonForm.put(`/courses/manage/${courseId}/lessons/${lesson.id}`, {
      preserveScroll: true,
    });
  };

  const deleteLesson = () => {
    router.delete(`/courses/manage/${courseId}/lessons/${lesson.id}`, {
      preserveScroll: true,
    });
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1 space-y-3">
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`lesson-title-${lesson.id}`}>Lesson title</Label>
              <Input
                id={`lesson-title-${lesson.id}`}
                value={lessonForm.data.title}
                onChange={(e) => lessonForm.setData('title', e.target.value)}
              />
              {lessonForm.errors.title ? (
                <p className="text-xs text-destructive">
                  {lessonForm.errors.title}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`lesson-order-${lesson.id}`}>Order</Label>
              <Input
                id={`lesson-order-${lesson.id}`}
                type="number"
                min={1}
                value={lessonForm.data.order ?? ''}
                onChange={(e) =>
                  lessonForm.setData(
                    'order',
                    e.target.value === '' ? '' : Number(e.target.value),
                  )
                }
              />
              {lessonForm.errors.order ? (
                <p className="text-xs text-destructive">
                  {lessonForm.errors.order}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor={`lesson-description-${lesson.id}`}>
                Description
              </Label>
              <Textarea
                id={`lesson-description-${lesson.id}`}
                rows={3}
                value={lessonForm.data.description ?? ''}
                onChange={(e) =>
                  lessonForm.setData('description', e.target.value)
                }
              />
              {lessonForm.errors.description ? (
                <p className="text-xs text-destructive">
                  {lessonForm.errors.description}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`lesson-duration-${lesson.id}`}>
                Duration (minutes)
              </Label>
              <Input
                id={`lesson-duration-${lesson.id}`}
                type="number"
                min={1}
                value={lessonForm.data.duration_minutes ?? ''}
                onChange={(e) =>
                  lessonForm.setData(
                    'duration_minutes',
                    e.target.value === '' ? '' : Number(e.target.value),
                  )
                }
              />
              <Label htmlFor={`lesson-video-${lesson.id}`}>Video URL</Label>
              <Input
                id={`lesson-video-${lesson.id}`}
                value={lessonForm.data.video_url ?? ''}
                onChange={(e) =>
                  lessonForm.setData('video_url', e.target.value)
                }
                placeholder="https://..."
              />
              {lessonForm.errors.duration_minutes ? (
                <p className="text-xs text-destructive">
                  {lessonForm.errors.duration_minutes}
                </p>
              ) : null}
              {lessonForm.errors.video_url ? (
                <p className="text-xs text-destructive">
                  {lessonForm.errors.video_url}
                </p>
              ) : null}
            </div>
          </div>

          {/* Meeting Section */}
          <div className="border-t pt-3">
            <h4 className="mb-2 text-sm font-semibold">Meeting Details</h4>
            <div className="grid gap-3 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor={`lesson-meeting-url-${lesson.id}`}>
                  Meeting URL
                </Label>
                <Input
                  id={`lesson-meeting-url-${lesson.id}`}
                  value={lessonForm.data.meeting_url ?? ''}
                  onChange={(e) =>
                    lessonForm.setData('meeting_url', e.target.value)
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`lesson-meeting-start-${lesson.id}`}>
                  Start Time
                </Label>
                <Input
                  id={`lesson-meeting-start-${lesson.id}`}
                  type="datetime-local"
                  value={lessonForm.data.meeting_start_time ?? ''}
                  onChange={(e) =>
                    lessonForm.setData('meeting_start_time', e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`lesson-meeting-end-${lesson.id}`}>
                  End Time
                </Label>
                <Input
                  id={`lesson-meeting-end-${lesson.id}`}
                  type="datetime-local"
                  value={lessonForm.data.meeting_end_time ?? ''}
                  onChange={(e) =>
                    lessonForm.setData('meeting_end_time', e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="sm"
              variant="secondary"
              disabled={lessonForm.processing}
              onClick={saveLesson}
            >
              Save lesson
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive"
              disabled={lessonForm.processing}
              onClick={deleteLesson}
            >
              Delete lesson
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <p className="text-sm font-semibold text-foreground">Contents</p>
        {lesson.contents && lesson.contents.length > 0 ? (
          <div className="flex flex-col gap-3">
            {lesson.contents.map((content) => (
              <ContentRow
                key={content.id}
                courseId={courseId}
                lessonId={lesson.id}
                content={content}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No contents yet.</p>
        )}

        <NewContentForm courseId={courseId} lessonId={lesson.id} />
      </div>
    </div>
  );
}

export default function EditCourse({ course, mode }: EditCoursePageProps) {
  const isEdit = mode === 'edit';
  const form = useForm({
    title: course?.title ?? '',
    description: course?.description ?? '',
    category: course?.category ?? '',
    difficulty: course?.difficulty ?? '',
    duration_minutes: course?.duration_minutes ?? '',
    thumbnail: course?.thumbnail ?? '',
    is_published: course?.is_published ?? false,
  });

  const lessonForm = useForm({
    title: '',
    description: '',
    duration_minutes: '',
    order: '',
    video_url: '',
  });

  const submitCourse = () => {
    if (isEdit && course) {
      form.put(`/courses/manage/${course.id}`);
    } else {
      form.post('/courses/manage');
    }
  };

  const submitLesson = () => {
    if (!course) {
      return;
    }

    lessonForm.transform((data) => ({
      ...data,
      order: data.order === '' ? null : Number(data.order),
      duration_minutes:
        data.duration_minutes === '' ? null : Number(data.duration_minutes),
    }));

    lessonForm.post(`/courses/manage/${course.id}/lessons`, {
      preserveScroll: true,
      onSuccess: () => lessonForm.reset(),
      onFinish: () => lessonForm.transform((data) => data),
    });
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Courses', href: '/courses' },
        { title: 'Manage', href: '/courses/manage' },
        { title: isEdit ? 'Edit Course' : 'Create Course', href: '#' },
      ]}
    >
      <Head title={isEdit ? 'Edit Course' : 'Create Course'} />

      <div className="flex flex-col gap-6 p-4 lg:p-8">
        <div className="flex items-center gap-3">
          <Link href="/courses/manage" prefetch>
            <Button variant="ghost" size="icon" aria-label="Back">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
              {isEdit ? 'Update course' : 'New course'}
            </p>
            <h1 className="text-2xl font-bold text-foreground">
              {isEdit ? `Edit ${course?.title}` : 'Create a course'}
            </h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Course details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.data.title}
                  onChange={(e) => form.setData('title', e.target.value)}
                  placeholder="Course title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={form.data.category}
                  onChange={(e) => form.setData('category', e.target.value)}
                  placeholder="e.g. Programming"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.data.description}
                onChange={(e) => form.setData('description', e.target.value)}
                placeholder="What will learners achieve?"
                rows={5}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <select
                  id="difficulty"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm"
                  value={form.data.difficulty ?? ''}
                  onChange={(e) => form.setData('difficulty', e.target.value)}
                >
                  <option value="">Select difficulty</option>
                  {difficulties.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  min={1}
                  value={form.data.duration_minutes ?? ''}
                  onChange={(e) =>
                    form.setData(
                      'duration_minutes',
                      Number(e.target.value) || '',
                    )
                  }
                  placeholder="e.g. 120"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail URL</Label>
                <Input
                  id="thumbnail"
                  value={form.data.thumbnail ?? ''}
                  onChange={(e) => form.setData('thumbnail', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="is_published"
                type="checkbox"
                className="size-4 rounded border-border"
                checked={form.data.is_published}
                onChange={(e) => form.setData('is_published', e.target.checked)}
              />
              <Label htmlFor="is_published" className="text-sm text-foreground">
                Publish course
              </Label>
            </div>

            {form.errors && (
              <div className="text-sm text-destructive">
                {Object.values(form.errors).map((error) => (
                  <div key={error as string}>{error}</div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link href="/courses/manage" prefetch>
                <Button variant="ghost">Cancel</Button>
              </Link>
              <Button
                onClick={submitCourse}
                disabled={form.processing}
                className="inline-flex items-center gap-2"
              >
                <Save className="size-4" />
                {isEdit ? 'Save changes' : 'Create course'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {isEdit && course ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Lessons & content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-4">
                <p className="text-sm font-semibold text-foreground">
                  Add lesson
                </p>
                <div className="grid gap-3 pt-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-lesson-title">Title</Label>
                    <Input
                      id="new-lesson-title"
                      value={lessonForm.data.title}
                      onChange={(e) =>
                        lessonForm.setData('title', e.target.value)
                      }
                      placeholder="Lesson title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-lesson-order">Order</Label>
                    <Input
                      id="new-lesson-order"
                      type="number"
                      min={1}
                      value={
                        lessonForm.data.order === ''
                          ? ''
                          : String(lessonForm.data.order)
                      }
                      onChange={(e) =>
                        lessonForm.setData('order', e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-3 pt-3 md:grid-cols-3">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="new-lesson-description">Description</Label>
                    <Textarea
                      id="new-lesson-description"
                      rows={3}
                      value={lessonForm.data.description ?? ''}
                      onChange={(e) =>
                        lessonForm.setData('description', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-lesson-duration">
                      Duration (minutes)
                    </Label>
                    <Input
                      id="new-lesson-duration"
                      type="number"
                      min={1}
                      value={
                        lessonForm.data.duration_minutes === ''
                          ? ''
                          : String(lessonForm.data.duration_minutes)
                      }
                      onChange={(e) =>
                        lessonForm.setData('duration_minutes', e.target.value)
                      }
                    />
                    <Label htmlFor="new-lesson-video">Video URL</Label>
                    <Input
                      id="new-lesson-video"
                      value={lessonForm.data.video_url ?? ''}
                      onChange={(e) =>
                        lessonForm.setData('video_url', e.target.value)
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <Button
                    size="sm"
                    onClick={submitLesson}
                    disabled={lessonForm.processing}
                    className="inline-flex items-center gap-2"
                  >
                    <Save className="size-4" />
                    Add lesson
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {course.lessons && course.lessons.length > 0 ? (
                  course.lessons.map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      courseId={course.id}
                      lesson={lesson as LessonWithContents}
                    />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No lessons yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : isEdit ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Lessons & content
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Save the course first to manage lessons and content.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AppLayout>
  );
}
