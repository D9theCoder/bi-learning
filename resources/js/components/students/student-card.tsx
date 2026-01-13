import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRoles } from '@/hooks/use-roles';
import { messages } from '@/routes';
import { Link } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';

interface StudentCardProps {
  student: {
    id: number;
    name: string;
    email?: string;
    avatar?: string;
    level?: number | null;
    points_balance?: number | null;
    total_xp?: number | null;
    enrollments_count?: number | null;
    active_enrollments_count?: number | null;
  };
}

export function StudentCard({ student }: StudentCardProps) {
  const { isAdmin } = useRoles();
  const enrollmentsCount = student.enrollments_count ?? 0;
  const activeEnrollmentsCount = student.active_enrollments_count ?? 0;
  const statusLabel =
    activeEnrollmentsCount > 0
      ? 'Active'
      : enrollmentsCount > 0
        ? 'Inactive'
        : 'Not enrolled';

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-start gap-3">
          <Avatar className="size-12">
            <AvatarImage src={student.avatar} />
            <AvatarFallback>{student.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-base">{student.name}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-2">
        {student.email && (
          <p className="text-sm text-muted-foreground">{student.email}</p>
        )}
        {isAdmin ? (
          <div className="grid gap-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Level</span>
              <span className="font-semibold text-foreground">
                {student.level ?? 1}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Points</span>
              <span className="font-semibold text-foreground">
                {student.points_balance ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total XP</span>
              <span className="font-semibold text-foreground">
                {student.total_xp ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Course status</span>
              <Badge variant="secondary">{statusLabel}</Badge>
            </div>
          </div>
        ) : null}
      </CardContent>
      {!isAdmin ? (
        <CardFooter className="mt-auto">
          <Link
            href={`${messages().url}?partner=${student.id}`}
            className="w-full"
          >
            <Button className="w-full" size="sm">
              <MessageSquare className="mr-2 size-4" />
              Contact Student
            </Button>
          </Link>
        </CardFooter>
      ) : null}
    </Card>
  );
}
