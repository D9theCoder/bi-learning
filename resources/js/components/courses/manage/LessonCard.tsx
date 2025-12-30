import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CourseContent, Lesson } from '@/types';
import { router, useForm } from '@inertiajs/react';
import { ContentRow } from './ContentRow';
import { NewContentForm } from './NewContentForm';

type LessonWithContents = Lesson & { contents?: CourseContent[] };

interface LessonCardProps {
  courseId: number;
  lesson: LessonWithContents;
}

export function LessonCard({ courseId, lesson }: LessonCardProps) {
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
