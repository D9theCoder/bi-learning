import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { messages as messagesRoute } from '@/routes';
import type { SharedData } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import React, { useEffect } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: number;
  tutor_id: number;
  user_id: number;
  // Support both backend field names seamlessly
  content?: string;
  body?: string;
  sent_at?: string;
  created_at?: string;
}

interface ActiveThread {
  partner: {
    id: number;
    name: string;
  };
  messages: {
    data: Message[];
  };
}

interface MessageThreadProps {
  activeThread?: ActiveThread | null;
}

export function MessageThread({ activeThread }: MessageThreadProps) {
  const { auth } = usePage<SharedData>().props;
  const { data, setData, post, processing, reset } = useForm({
    partner_id: activeThread?.partner.id || 0,
    content: '',
  });

  // Keep partner_id in sync when switching threads
  useEffect(() => {
    if (activeThread?.partner.id) {
      setData('partner_id', activeThread.partner.id);
    }
  }, [activeThread?.partner.id, setData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(messagesRoute().url, {
      preserveScroll: true,
      onSuccess: () => reset('content'),
    });
  };

  // Helper to determine if current user sent the message
  const isMyMessage = (message: Message): boolean => {
    // The sender is determined by comparing with the partner ID
    // If tutor_id equals partner ID, then user_id is the sender
    // If user_id equals partner ID, then tutor_id is the sender
    const partnerId = activeThread?.partner.id;
    if (!partnerId) return false;
    
    // If partner is the tutor, then I (user) am the sender when user_id matches my ID
    // If partner is the user, then I (tutor) am the sender when tutor_id matches my ID
    if (message.tutor_id === partnerId) {
      return message.user_id === auth.user.id;
    } else {
      return message.tutor_id === auth.user.id;
    }
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>
          {activeThread ? activeThread.partner.name : 'Select a conversation'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeThread ? (
          <div className="space-y-4">
            <div className="max-h-96 space-y-3 overflow-y-auto">
              {activeThread.messages.data.map((message) => {
                const isMine = isMyMessage(message);
                return (
                  <div
                    key={message.id}
                    className={cn(
                      'rounded-lg p-3',
                      isMine
                        ? 'ml-auto max-w-[80%] bg-primary text-primary-foreground'
                        : 'mr-auto max-w-[80%] bg-accent'
                    )}
                  >
                    <p>{message.content ?? message.body ?? ''}</p>
                    <p
                      className={cn(
                        'mt-1 text-xs',
                        isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      )}
                    >
                      {new Date(message.sent_at ?? message.created_at ?? '').toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
            <form onSubmit={handleSubmit}>
              <div className="flex gap-2">
                <Textarea
                  value={data.content}
                  onChange={(e) => setData('content', e.target.value)}
                  placeholder="Type a message..."
                  rows={2}
                />
                <Button
                  type="submit"
                  disabled={processing || !data.content.trim()}
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
  );
}
