import { MessageThread } from '@/components/messages/message-thread';
import { ThreadList } from '@/components/messages/thread-list';
import { PageHeader } from '@/components/shared/page-header';
import AppLayout from '@/layouts/app-layout';
import { messages as messagesRoute } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Messages', href: messagesRoute().url },
];

// ! Removed MessagesPageProps

// ! Dummy Data
const dummyThreads = [
  {
    partner: {
      id: 1,
      name: 'John Doe',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe',
    },
    latest_message_at: '2024-05-20T10:00:00Z',
    unread_count: 2,
  },
  {
    partner: {
      id: 2,
      name: 'Jane Smith',
      avatar: 'https://ui-avatars.com/api/?name=Jane+Smith',
    },
    latest_message_at: '2024-05-19T15:30:00Z',
    unread_count: 0,
  },
];

const dummyActiveThread = {
  partner: dummyThreads[0].partner,
  messages: {
    data: [
      {
        id: 1,
        body: 'Hello! How can I help you today?',
        sender_id: 1,
        created_at: '2024-05-20T09:00:00Z',
        read_at: '2024-05-20T09:05:00Z',
      },
      {
        id: 2,
        body: 'I have a question about the React course.',
        sender_id: 999, // Current user
        created_at: '2024-05-20T09:10:00Z',
        read_at: '2024-05-20T09:15:00Z',
      },
      {
        id: 3,
        body: 'Sure, what is it?',
        sender_id: 1,
        created_at: '2024-05-20T10:00:00Z',
      },
    ],
    current_page: 1,
    last_page: 1,
  },
};

// ! Modified component to use dummy data
export default function MessagesPage() {
  const threads = dummyThreads;
  const activeThread = dummyActiveThread;

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

        <div className="grid gap-4 lg:grid-cols-3">
          <ThreadList threads={threads} />
          {/* @ts-ignore */}
          <MessageThread activeThread={activeThread} />
        </div>
      </div>
    </AppLayout>
  );
}
