import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Link, type InertiaFormProps } from '@inertiajs/react';
import { Save } from 'lucide-react';

const difficulties = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

type CourseFormData = {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration_minutes: number | '' | string;
  thumbnail: string;
  is_published: boolean;
};

interface CourseDetailsFormProps {
  form: InertiaFormProps<CourseFormData>;
  isEdit: boolean;
  onSubmit: () => void;
}

export function CourseDetailsForm({
  form,
  isEdit,
  onSubmit,
}: CourseDetailsFormProps) {
  return (
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
              onChange={(e) =>
                form.setData('duration_minutes', Number(e.target.value) || '')
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
            {Object.entries(form.errors)
              .filter(([, message]) => Boolean(message))
              .map(([field, message]) => (
                <div key={field}>{message}</div>
              ))}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/courses/manage">
            <Button variant="ghost">Cancel</Button>
          </Link>
          <Button
            onClick={onSubmit}
            disabled={form.processing}
            className="inline-flex items-center gap-2"
          >
            <Save className="size-4" />
            {isEdit ? 'Save changes' : 'Create course'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
