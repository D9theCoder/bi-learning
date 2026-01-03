import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { messages } from '@/routes';
import { Link } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';

interface StudentCardProps {
  student: {
    id: number;
    name: string;
    email?: string;
    avatar?: string;
  };
}

export function StudentCard({ student }: StudentCardProps) {
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
      </CardContent>
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
    </Card>
  );
}
