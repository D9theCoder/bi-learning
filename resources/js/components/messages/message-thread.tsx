import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { messages as messagesRoute } from '@/routes';
import { useForm } from '@inertiajs/react';
import { Send } from 'lucide-react';

interface Message {
  id: number;
  body: string;
  created_at: string;
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
              {activeThread.messages.data.map((message) => (
                <div key={message.id} className="rounded-lg bg-accent p-3">
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
  );
}
