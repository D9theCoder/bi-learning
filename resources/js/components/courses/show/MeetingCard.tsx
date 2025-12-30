import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { router } from '@inertiajs/react';
import { CheckCircle } from 'lucide-react';

interface MeetingCardProps {
  lessonId: number;
  meetingUrl: string;
  meetingStartTime: string | null;
  meetingEndTime: string | null;
  hasAttended?: boolean;
  isAdmin: boolean;
  isTutor: boolean;
}

export function MeetingCard({
  lessonId,
  meetingUrl,
  meetingStartTime,
  meetingEndTime,
  hasAttended,
  isAdmin,
  isTutor,
}: MeetingCardProps) {
  const now = new Date();

  const startTime = meetingStartTime
    ? new Date(meetingStartTime.substring(0, 19))
    : null;
  const endTime = meetingEndTime
    ? new Date(meetingEndTime.substring(0, 19))
    : null;

  const isActive = startTime && endTime && now >= startTime && now <= endTime;
  const isPast = endTime && now > endTime;
  const isFuture = startTime && now < startTime;

  const handleJoinMeeting = () => {
    router.post(
      `/lessons/${lessonId}/attend`,
      {},
      {
        preserveScroll: true,
        onSuccess: () => {
          window.open(meetingUrl, '_blank');
        },
        onError: (errors) => {
          console.error('Failed to mark attendance:', errors);
          alert('Failed to mark attendance. Please try again.');
        },
      },
    );
  };

  const handleDebugAttend = () => {
    router.post(
      `/lessons/${lessonId}/attend`,
      {},
      {
        preserveScroll: true,
        onError: (errors) => {
          console.error('Failed to mark attendance:', errors);
          alert('Failed to mark attendance: ' + JSON.stringify(errors));
        },
      },
    );
  };

  return (
    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Meeting</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {startTime && (
            <p className="text-sm text-gray-600">
              <strong>Scheduled:</strong> {startTime.toLocaleString()} -{' '}
              {endTime?.toLocaleTimeString()}
            </p>
          )}
          {hasAttended && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Attended</span>
            </div>
          )}
          {isActive ? (
            <Button
              onClick={handleJoinMeeting}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Join Meeting
            </Button>
          ) : isPast ? (
            <Button disabled className="w-full">
              Meeting Ended
            </Button>
          ) : isFuture ? (
            <Button disabled className="w-full">
              Starts {startTime.toLocaleString()}
            </Button>
          ) : (
            <Button
              onClick={handleJoinMeeting}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Join Meeting
            </Button>
          )}

          {!isAdmin && !isTutor && (
            <Button
              onClick={handleDebugAttend}
              variant="outline"
              className="w-full border-red-500 text-red-500 hover:bg-red-50"
            >
              [DEBUG] Mark Attendance
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
