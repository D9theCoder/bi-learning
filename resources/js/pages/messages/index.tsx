import { MessageThread } from '@/components/messages/message-thread';
import { NewConversationCard } from '@/components/messages/new-conversation-card';
import { ThreadList } from '@/components/messages/thread-list';
import type {
  ActiveThread,
  ContactUser,
  ParticipantThread,
  Thread,
} from '@/components/messages/types';
import { PageHeader } from '@/components/shared/page-header';
import { useMessagePolling } from '@/hooks/use-message-polling';
import AppLayout from '@/layouts/app-layout';
import { messages as messagesRoute } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';
import { useState } from 'react';

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

const isParticipantThread = (thread: Thread): thread is ParticipantThread =>
  'partner' in thread;

export default function MessagesPage({
  threads,
  activeThread,
  isAdmin,
  currentUserId,
  contacts,
}: MessagesPageProps) {
  const messagesUrl = messagesRoute().url;

  const { threadsState, activeThreadState, contactsState } = useMessagePolling({
    threads,
    activeThread: activeThread ?? null,
    contacts,
    isAdmin,
    messagesUrl,
  });

  const [selectedContactId, setSelectedContactId] = useState<number | ''>(
    contacts[0]?.id ?? '',
  );

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
          <NewConversationCard
            contacts={contactsState}
            selectedContactId={selectedContactId}
            onContactChange={setSelectedContactId}
            onSubmit={handleCreateThread}
          />
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          {isAdmin ? (
            <ThreadList threads={threadsState} isAdmin={true} />
          ) : (
            <ThreadList
              threads={threadsState.filter(isParticipantThread)}
              isAdmin={false}
            />
          )}
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
