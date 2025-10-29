import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { TutorMessage } from '@/types';
import { MessageSquare, ExternalLink } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface TutorChatWidgetProps {
    messages: TutorMessage[];
    unreadCount?: number;
    className?: string;
}

export function TutorChatWidget({ messages, unreadCount = 0, className }: TutorChatWidgetProps) {
    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <MessageSquare className="size-5" />
                    AI Tutor Chat
                </CardTitle>
                {unreadCount > 0 && (
                    <Badge variant="destructive">{unreadCount}</Badge>
                )}
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[280px] pr-4">
                    <div className="flex flex-col gap-3">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <MessageSquare className="mb-2 size-8 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    No messages yet
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Start a conversation with your AI tutor
                                </p>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={cn(
                                        'flex gap-3 rounded-lg border p-3 transition-all hover:bg-muted/50',
                                        !message.read && 'border-primary bg-primary/5'
                                    )}
                                >
                                    <Avatar className="size-8 shrink-0">
                                        <AvatarImage src={message.sender_avatar} alt={message.sender_name} />
                                        <AvatarFallback>
                                            {message.sender_name?.charAt(0) || 'AI'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-medium">{message.sender_name}</p>
                                            <time className="text-xs text-muted-foreground">
                                                {new Date(message.created_at).toLocaleTimeString([], { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </time>
                                        </div>
                                        <p className="line-clamp-2 text-sm text-muted-foreground">
                                            {message.content}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
                <Button asChild className="mt-4 w-full" variant="outline">
                    <Link href="/tutor" prefetch>
                        Open Full Chat
                        <ExternalLink className="ml-2 size-4" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
