import { MessageThread } from '@/components/messages/message-thread';
import type { ActiveThread, ContactUser, Thread } from '@/components/messages/types';
import { ThreadList } from '@/components/messages/thread-list';
import { PageHeader } from '@/components/shared/page-header';
import AppLayout from '@/layouts/app-layout';
import { messages as messagesRoute } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { MessageSquare } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Messages', href: messagesRoute().url },
];

interface MessagesPageProps {
  threads: Thread[];
  activeThread?: ActiveThread | null;
  isAdmin: boolean;
  currentUserId: number;
  contacts: ContactUser[];
}

export default function MessagesPage({
  threads,
  activeThread,
  isAdmin,
  currentUserId,
  contacts,
}: MessagesPageProps) {
  const [threadsState, setThreadsState] = useState<Thread[]>(threads);
  const [activeThreadState, setActiveThreadState] = useState<ActiveThread | null>(
    activeThread ?? null
  );
  const [contactsState, setContactsState] = useState<ContactUser[]>(contacts);
  const [selectedContactId, setSelectedContactId] = useState<number | ''>(
    contacts[0]?.id ?? ''
  );
  const messagesUrl = messagesRoute().url;

  useEffect(() => {
    setThreadsState(threads);
    setActiveThreadState(activeThread ?? null);
    setContactsState(contacts);
    setSelectedContactId(contacts[0]?.id ?? '');
  }, [threads, activeThread, contacts]);

  const conversationKey = useMemo(() => {
    if (!activeThreadState) return 'none';

    if (isAdmin && 'tutor' in activeThreadState && 'student' in activeThreadState) {
      return `admin-${activeThreadState.tutor?.id}-${activeThreadState.student?.id}`;
    }

    if (!isAdmin && 'partner' in activeThreadState) {
      return `partner-${activeThreadState.partner?.id}`;
    }

    return 'none';
  }, [activeThreadState, isAdmin]);

  useEffect(() => {
    let isMounted = true;

    const poll = async () => {
      try {
        const params = new URLSearchParams();

        if (isAdmin && activeThreadState && 'tutor' in activeThreadState && 'student' in activeThreadState) {
          if (activeThreadState.tutor?.id && activeThreadState.student?.id) {
            params.set('tutor_id', String(activeThreadState.tutor.id));
            params.set('student_id', String(activeThreadState.student.id));
          }
        } else if (!isAdmin && activeThreadState && 'partner' in activeThreadState) {
          if (activeThreadState.partner?.id) {
            params.set('partner', String(activeThreadState.partner.id));
          }
        }

        const response = await fetch(
          `${messagesUrl}/poll${params.toString() ? `?${params.toString()}` : ''}`,
          {
            headers: {
              Accept: 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            },
          }
        );

        if (!response.ok || !isMounted) {
          return;
        }

        const payload = await response.json();

        if (!isMounted) return;

        setThreadsState(payload.threads ?? []);
        setActiveThreadState(payload.activeThread ?? null);
        setContactsState(payload.contacts ?? []);
      } catch (error) {
        // Swallow polling errors to avoid interrupting the UI
      }
    };

    poll();
    const timer = window.setInterval(poll, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(timer);
    };
  }, [conversationKey, isAdmin, messagesUrl, activeThreadState]);

  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContactId) return;

    const params = new URLSearchParams();
    params.set('partner', String(selectedContactId));

    router.visit(`${messagesUrl}?${params.toString()}`);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Messages" />

      <div className="flex flex-1 flex-col gap-6 overflow-x-auto p-4 lg:p-6">
        <PageHeader
          icon={MessageSquare}
          title="Messages"
          description="Chat with your tutors and peers."
          iconClassName="text-blue-400"
        />

        {!isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Start a new conversation</CardTitle>
            </CardHeader>
            <CardContent>
              {contactsState.length > 0 ? (
                <form onSubmit={handleCreateThread} className="flex flex-col gap-3 md:flex-row md:items-center">
                  <label className="text-sm font-medium text-foreground" htmlFor="new-partner">
                    {contactsState[0]?.role === 'tutor' ? 'Select a tutor' : 'Select a student'}
                  </label>
                  <select
                    id="new-partner"
                    className="w-full rounded-md border border-input bg-background p-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary md:max-w-sm"
                    value={selectedContactId}
                    onChange={(e) => setSelectedContactId(e.target.value ? Number(e.target.value) : '')}
                  >
                    {contactsState.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name} {contact.role === 'tutor' ? '(Tutor)' : '(Student)'}
                      </option>
                    ))}
                  </select>
                  <Button type="submit" className="md:w-auto" disabled={!selectedContactId}>
                    Start chat
                  </Button>
                </form>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No eligible contacts yet. Enroll in a course to message your tutor or accept students in your course.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          <ThreadList threads={threadsState} isAdmin={isAdmin} />
          <MessageThread
            activeThread={activeThreadState}
            isAdmin={isAdmin}
            currentUserId={currentUserId}
          />
        </div>
      </div>
    </AppLayout>
  );
}
