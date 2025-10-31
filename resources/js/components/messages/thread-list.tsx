import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { messages as messagesRoute } from '@/routes';
import { Link } from '@inertiajs/react';

interface Thread {
  partner: {
    id: number;
    name: string;
    avatar?: string;
  };
  latest_message_at: string;
  unread_count: number;
}

interface ThreadListProps {
  threads: Thread[];
}

export function ThreadList({ threads }: ThreadListProps) {
  return (
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
                  {new Date(thread.latest_message_at).toLocaleDateString()}
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
  );
}
