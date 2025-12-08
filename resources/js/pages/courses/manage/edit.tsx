import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { EditCoursePageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

const difficulties = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

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

  const submit = () => {
    if (isEdit && course) {
      form.put(`/courses/manage/${course.id}`);
    } else {
      form.post('/courses/manage');
    }
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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {isEdit ? 'Update course' : 'New course'}
            </p>
            <h1 className="text-2xl font-bold text-foreground">
              {isEdit ? `Edit ${course?.title}` : 'Create a course'}
            </h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Course details</CardTitle>
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
                  onChange={(e) => form.setData('duration_minutes', Number(e.target.value) || '')}
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
              <Button onClick={submit} disabled={form.processing} className="inline-flex items-center gap-2">
                <Save className="size-4" />
                {isEdit ? 'Save changes' : 'Create course'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

