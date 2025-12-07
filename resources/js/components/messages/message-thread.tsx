import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { messages as messagesRoute } from '@/routes';
import { useForm } from '@inertiajs/react';
import React, { useEffect } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  ActiveThread,
  AdminActiveThread,
  Message,
  ParticipantActiveThread,
} from './types';

interface MessageThreadProps {
  activeThread?: ActiveThread | null;
  isAdmin: boolean;
  currentUserId: number;
}

const isParticipantThread = (
  thread: ActiveThread | null | undefined
): thread is ParticipantActiveThread => Boolean(thread && 'partner' in thread);

const isAdminThread = (
  thread: ActiveThread | null | undefined
): thread is AdminActiveThread =>
  Boolean(thread && 'tutor' in thread && 'student' in thread);

export function MessageThread({
  activeThread,
  isAdmin,
  currentUserId,
}: MessageThreadProps) {
  const { data, setData, post, processing, reset } = useForm({
    partner_id: isParticipantThread(activeThread) ? activeThread.partner.id : 0,
    content: '',
  });

  // Keep partner_id in sync when switching threads
  useEffect(() => {
    if (isParticipantThread(activeThread) && activeThread.partner.id) {
      setData('partner_id', activeThread.partner.id);
    } else {
      setData('partner_id', 0);
    }
  }, [activeThread, setData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isParticipantThread(activeThread) || isAdmin) return;

    post(messagesRoute().url, {
      preserveScroll: true,
      onSuccess: () => reset('content'),
    });
  };

  // Helper to determine if current user sent the message
  const isMyMessage = (message: Message): boolean => {
    if (!isParticipantThread(activeThread)) return false;
    const partnerId = activeThread.partner.id;
    if (!partnerId) return false;
    
    // If partner is the tutor, then I (user) am the sender when user_id matches my ID
    // If partner is the user, then I (tutor) am the sender when tutor_id matches my ID
    if (message.tutor_id === partnerId) {
      return message.user_id === currentUserId;
    } else {
      return message.tutor_id === currentUserId;
    }
  };

  const heading = isParticipantThread(activeThread)
    ? activeThread.partner.name
    : isAdminThread(activeThread)
      ? `${activeThread.tutor.name} • ${activeThread.student.name}`
      : 'Select a conversation';

  const canSend = !isAdmin && isParticipantThread(activeThread);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>{heading}</CardTitle>
      </CardHeader>
      <CardContent>
        {activeThread ? (
          <div className="space-y-4">
            <div className="max-h-96 space-y-3 overflow-y-auto">
              {activeThread.messages.data.map((message) => {
                const participantThread = isParticipantThread(activeThread);
                const adminThread = isAdminThread(activeThread);
                const isTutorMessage =
                  adminThread && message.tutor_id === activeThread.tutor.id;
                const isMine = !isAdmin && participantThread && isMyMessage(message);
                const timestamp = message.sent_at ?? message.created_at ?? '';
                const formattedTimestamp =
                  timestamp && !Number.isNaN(new Date(timestamp).valueOf())
                    ? new Date(timestamp).toLocaleString()
                    : '';

                return (
                  <div
                    key={message.id}
                    className={cn(
                      'rounded-lg p-3',
                      adminThread
                        ? isTutorMessage
                          ? 'ml-auto max-w-[80%] bg-primary text-primary-foreground'
                          : 'mr-auto max-w-[80%] bg-accent'
                        : isMine
                        ? 'ml-auto max-w-[80%] bg-primary text-primary-foreground'
                        : 'mr-auto max-w-[80%] bg-accent'
                    )}
                  >
                    {isAdmin && adminThread && (
                      <p
                        className={cn(
                          'mb-1 text-xs font-semibold',
                          isTutorMessage ? 'text-primary-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {isTutorMessage ? 'Tutor' : 'Student'}
                      </p>
                    )}
                    <p>{message.content ?? message.body ?? ''}</p>
                    <p
                      className={cn(
                        'mt-1 text-xs',
                        adminThread
                          ? isTutorMessage
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                          : isMine
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                      )}
                    >
                      {formattedTimestamp}
                    </p>
                  </div>
                );
              })}
            </div>
            {canSend ? (
              <form onSubmit={handleSubmit}>
                <div className="flex gap-2">
                  <Textarea
                    value={data.content}
                    onChange={(e) => setData('content', e.target.value)}
                    placeholder="Type a message..."
                    rows={2}
                    disabled={!canSend}
                  />
                  <Button
                    type="submit"
                    disabled={processing || !data.content.trim()}
                  >
                    <Send className="size-4" />
                  </Button>
                </div>
              </form>
            ) : (
              <p className="text-sm text-muted-foreground">
                Admins have read-only access to conversations.
              </p>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            Select a conversation to start messaging
          </p>
        )}
      </CardContent>
    </Card>
  );
}
