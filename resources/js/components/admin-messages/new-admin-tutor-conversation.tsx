import type { UserSummary } from '@/components/admin-messages/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NewAdminTutorConversationProps {
  tutors: UserSummary[];
  selectedTutorId: number | '';
  onTutorChange: (id: number | '') => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function NewAdminTutorConversation({
  tutors,
  selectedTutorId,
  onTutorChange,
  onSubmit,
}: NewAdminTutorConversationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Start a new conversation</CardTitle>
      </CardHeader>
      <CardContent>
        {tutors.length > 0 ? (
          <form
            onSubmit={onSubmit}
            className="flex flex-col gap-3 md:flex-row md:items-center"
          >
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="new-tutor"
            >
              Select a tutor
            </label>
            <select
              id="new-tutor"
              className="w-full rounded-md border border-input bg-background p-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary md:max-w-sm"
              value={selectedTutorId}
              onChange={(e) =>
                onTutorChange(e.target.value ? Number(e.target.value) : '')
              }
            >
              {tutors.map((tutor) => (
                <option key={tutor.id} value={tutor.id}>
                  {tutor.name}
                </option>
              ))}
            </select>
            <Button
              type="submit"
              className="md:w-auto"
              disabled={!selectedTutorId}
            >
              Start chat
            </Button>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">
            No tutors available for new conversations yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
