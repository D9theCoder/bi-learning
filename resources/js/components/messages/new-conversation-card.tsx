import type { ContactUser } from '@/components/messages/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NewConversationCardProps {
  contacts: ContactUser[];
  selectedContactId: number | '';
  onContactChange: (id: number | '') => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function NewConversationCard({
  contacts,
  selectedContactId,
  onContactChange,
  onSubmit,
}: NewConversationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Start a new conversation</CardTitle>
      </CardHeader>
      <CardContent>
        {contacts.length > 0 ? (
          <form
            onSubmit={onSubmit}
            className="flex flex-col gap-3 md:flex-row md:items-center"
          >
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="new-partner"
            >
              {contacts[0]?.role === 'tutor'
                ? 'Select a tutor'
                : 'Select a student'}
            </label>
            <select
              id="new-partner"
              className="w-full rounded-md border border-input bg-background p-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary md:max-w-sm"
              value={selectedContactId}
              onChange={(e) =>
                onContactChange(e.target.value ? Number(e.target.value) : '')
              }
            >
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name}{' '}
                  {contact.role === 'tutor' ? '(Tutor)' : '(Student)'}
                </option>
              ))}
            </select>
            <Button
              type="submit"
              className="md:w-auto"
              disabled={!selectedContactId}
            >
              Start chat
            </Button>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">
            No eligible contacts yet. Enroll in a course to message your tutor
            or accept students in your course.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
