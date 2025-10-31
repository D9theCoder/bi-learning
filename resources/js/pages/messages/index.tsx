import { MessageThread } from '@/components/messages/message-thread';
import { ThreadList } from '@/components/messages/thread-list';
import { PageHeader } from '@/components/shared/page-header';
import AppLayout from '@/layouts/app-layout';
import { messages as messagesRoute } from '@/routes';
import type { BreadcrumbItem, MessagesPageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Messages', href: messagesRoute().url },
];

export default function MessagesPage({
  threads,
  activeThread,
}: MessagesPageProps) {
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
          <MessageThread activeThread={activeThread} />
        </div>
      </div>
    </AppLayout>
  );
}
