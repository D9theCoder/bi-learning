import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { messages as messagesRoute } from '@/routes';
import type { BreadcrumbItem, MessagesPageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { MessageSquare, Send } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Messages', href: messagesRoute().url },
];

export default function MessagesPage({
  threads,
  activeThread,
}: MessagesPageProps) {
  const { data, setData, post, processing, reset } = useForm({
    partner_id: activeThread?.partner.id || 0,
    body: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(messagesRoute().url, {
      preserveScroll: true,
      onSuccess: () => reset('body'),
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Messages" />

      <div className="flex flex-1 flex-col gap-6 overflow-x-auto p-4 lg:p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="size-8 text-blue-400" />
            <h1 className="text-3xl font-bold">Messages</h1>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Thread List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {threads.map((thread) => (
                  <Link
                    key={thread.partner.id}
                    href={`${messagesRoute().url}?partner=${thread.partner.id}`}
                    className="flex items-center gap-3 rounded-lg p-3 hover:bg-accent"
                  >
                    <Avatar>
                      <AvatarImage src={thread.partner.avatar} />
                      <AvatarFallback>{thread.partner.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{thread.partner.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(
                          thread.latest_message_at,
                        ).toLocaleDateString()}
                      </div>
                    </div>
                    {thread.unread_count > 0 && (
                      <Badge variant="destructive">{thread.unread_count}</Badge>
                    )}
                  </Link>
                ))}
                {threads.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground">
                    No messages yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Thread */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                {activeThread
                  ? activeThread.partner.name
                  : 'Select a conversation'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeThread ? (
                <div className="space-y-4">
                  <div className="max-h-96 space-y-3 overflow-y-auto">
                    {activeThread.messages.data.map((message) => (
                      <div
                        key={message.id}
                        className="rounded-lg bg-accent p-3"
                      >
                        <p>{message.body}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(message.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleSubmit}>
                    <div className="flex gap-2">
                      <Textarea
                        value={data.body}
                        onChange={(e) => setData('body', e.target.value)}
                        placeholder="Type a message..."
                        rows={2}
                      />
                      <Button
                        type="submit"
                        disabled={processing || !data.body.trim()}
                      >
                        <Send className="size-4" />
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  Select a conversation to start messaging
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
