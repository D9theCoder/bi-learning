import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { calendar } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Calendar as CalendarIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Calendar',
    href: calendar().url,
  },
];

export default function CalendarPage() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Calendar" />

      <div className="flex flex-1 flex-col gap-6 overflow-x-auto p-4 lg:p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <CalendarIcon className="size-8 text-purple-500" />
            <h1 className="text-3xl font-bold">Calendar</h1>
          </div>
          <p className="text-muted-foreground">
            View your learning schedule and track your activities.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your calendar is being prepared. Check back soon!
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
