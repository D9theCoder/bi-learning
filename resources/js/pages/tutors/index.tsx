import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { messages, tutors as tutorsRoute } from '@/routes';
import type { BreadcrumbItem, TutorsPageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { MessageSquare, Star, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Tutors', href: tutorsRoute().url },
];

export default function TutorsPage({ tutors }: TutorsPageProps) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Tutors" />

      <div className="flex flex-1 flex-col gap-6 overflow-x-auto p-4 lg:p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Users className="size-8 text-green-500" />
            <h1 className="text-3xl font-bold">Tutors</h1>
          </div>
          <p className="text-muted-foreground">
            Connect with your tutors and get help with your learning.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tutors.data.map((tutor) => (
            <Card key={tutor.id}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Avatar className="size-12">
                    <AvatarImage src={tutor.avatar} />
                    <AvatarFallback>{tutor.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-base">{tutor.name}</CardTitle>
                    {tutor.cohort && (
                      <CardDescription>{tutor.cohort.name}</CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {tutor.rating && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="size-4 fill-yellow-500 text-yellow-500" />
                    <span>{tutor.rating.toFixed(1)}</span>
                  </div>
                )}
                {tutor.expertise && tutor.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tutor.expertise.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Link
                  href={`${messages().url}?partner=${tutor.id}`}
                  className="w-full"
                >
                  <Button className="w-full" size="sm">
                    <MessageSquare className="mr-2 size-4" />
                    Contact Tutor
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {tutors.data.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No tutors found.
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
