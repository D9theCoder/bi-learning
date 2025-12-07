import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { messages as messagesRoute } from '@/routes';
import type { AdminThread, Thread } from './types';
import { Link } from '@inertiajs/react';

interface ThreadListProps {
  threads: Thread[];
  isAdmin: boolean;
}

const isAdminThread = (thread: Thread): thread is AdminThread =>
  'tutor' in thread && 'student' in thread;

const formatDate = (value?: string) => {
  if (!value) return '';
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? '' : parsed.toLocaleDateString();
};

export function ThreadList({ threads, isAdmin }: ThreadListProps) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Conversations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {threads.map((thread) => (
            <Link
              key={isAdmin && isAdminThread(thread) ? thread.id : thread.partner.id}
              href={
                isAdmin && isAdminThread(thread)
                  ? `${messagesRoute().url}?tutor_id=${thread.tutor.id}&student_id=${thread.student.id}`
                  : `${messagesRoute().url}?partner=${thread.partner.id}`
              }
              className="flex items-center gap-3 rounded-lg p-3 hover:bg-accent"
            >
              {isAdmin && isAdminThread(thread) ? (
                <>
                  <Avatar>
                    <AvatarImage src={thread.tutor.avatar} />
                    <AvatarFallback>
                      {thread.tutor.name?.[0] ?? 'T'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{thread.tutor.name}</span>
                      <Badge variant="secondary">Tutor</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-medium">{thread.student.name}</span>
                      <Badge variant="outline">Student</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(thread.latest_message_at)}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Avatar>
                    <AvatarImage src={thread.partner.avatar} />
                    <AvatarFallback>{thread.partner.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{thread.partner.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(thread.latest_message_at)}
                    </div>
                  </div>
                  {thread.unread_count > 0 && !isAdmin && (
                    <Badge variant="destructive">{thread.unread_count}</Badge>
                  )}
                </>
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
