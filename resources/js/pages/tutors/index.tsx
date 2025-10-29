import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { tutors } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Tutors',
    href: tutors().url,
  },
];

export default function TutorsPage() {
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

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your tutors list is being prepared. Check back soon!
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
