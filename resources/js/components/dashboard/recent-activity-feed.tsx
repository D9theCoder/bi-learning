import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Activity } from '@/types';
import { 
    BookOpen, 
    Award, 
    CheckCircle2, 
    Trophy, 
    Target,
    MessageSquare,
    LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecentActivityFeedProps {
    activities: Activity[];
    className?: string;
}

const activityIcons: Record<string, LucideIcon> = {
    'lesson_completed': BookOpen,
    'achievement_unlocked': Award,
    'task_completed': CheckCircle2,
    'level_up': Trophy,
    'goal_achieved': Target,
    'message_sent': MessageSquare,
};

const activityColors: Record<string, string> = {
    'lesson_completed': 'text-blue-500 bg-blue-500/10',
    'achievement_unlocked': 'text-yellow-500 bg-yellow-500/10',
    'task_completed': 'text-green-500 bg-green-500/10',
    'level_up': 'text-purple-500 bg-purple-500/10',
    'goal_achieved': 'text-orange-500 bg-orange-500/10',
    'message_sent': 'text-pink-500 bg-pink-500/10',
};

const activityTitles: Record<string, string> = {
    'lesson_completed': 'Completed Lesson',
    'achievement_unlocked': 'Achievement Unlocked',
    'task_completed': 'Task Completed',
    'level_up': 'Level Up!',
    'goal_achieved': 'Goal Achieved',
    'message_sent': 'Message Sent',
};

export function RecentActivityFeed({ activities, className }: RecentActivityFeedProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                    <div className="flex flex-col gap-4">
                        {activities.length === 0 ? (
                            <p className="text-center text-sm text-muted-foreground">
                                No recent activity
                            </p>
                        ) : (
                            activities.map((activity) => {
                                const Icon = activityIcons[activity.type] || BookOpen;
                                const colorClass = activityColors[activity.type] || 'text-muted-foreground bg-muted';
                                const title = activityTitles[activity.type] || 'Activity';
                                
                                return (
                                    <div key={activity.id} className="flex items-start gap-3">
                                        <div className={cn(
                                            'flex size-10 shrink-0 items-center justify-center rounded-full',
                                            colorClass
                                        )}>
                                            <Icon className="size-5" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-tight">
                                                {title}
                                            </p>
                                            {activity.description && (
                                                <p className="text-xs text-muted-foreground">
                                                    {activity.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <time className="text-xs text-muted-foreground">
                                                    {new Date(activity.created_at).toLocaleString()}
                                                </time>
                                                {activity.xp_earned > 0 && (
                                                    <Badge variant="outline" className="h-5">
                                                        +{activity.xp_earned} XP
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
