import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Assessment } from '@/types';
import { UseFormReturn } from '@inertiajs/react';
import { Save } from 'lucide-react';

type SettingsFormData = {
  title: string;
  description: string;
  lesson_id: number | '';
  due_date: string;
  max_score: number;
  allow_retakes: boolean;
  time_limit_minutes: number | '';
  is_published: boolean;
};

interface QuizSettingsCardProps {
  form: UseFormReturn<SettingsFormData>;
  assessment: Assessment;
  onSave: () => void;
}

export function QuizSettingsCard({
  form,
  assessment,
  onSave,
}: QuizSettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quiz Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={form.data.title}
            onChange={(e) => form.setData('title', e.target.value)}
          />
          {form.errors.title && (
            <p className="text-xs text-destructive">{form.errors.title}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={form.data.description}
            onChange={(e) => form.setData('description', e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="due_date">Due Date (optional)</Label>
          <Input
            id="due_date"
            type="datetime-local"
            value={form.data.due_date}
            onChange={(e) => form.setData('due_date', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="time_limit">Time Limit (minutes, optional)</Label>
          <Input
            id="time_limit"
            type="number"
            min={1}
            max={480}
            placeholder="No time limit"
            value={form.data.time_limit_minutes}
            onChange={(e) =>
              form.setData(
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
            checked={form.data.allow_retakes}
            onCheckedChange={(checked) =>
              form.setData('allow_retakes', !!checked)
            }
          />
          <Label htmlFor="allow_retakes" className="cursor-pointer">
            Allow retakes (highest score kept)
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_published"
            checked={form.data.is_published}
            onCheckedChange={(checked) =>
              form.setData('is_published', !!checked)
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
            onClick={onSave}
            disabled={form.processing}
            className="w-full"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
