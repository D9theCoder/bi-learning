import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { messages } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Messages',
    href: messages().url,
  },
];

export default function MessagesPage() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Messages" />

      <div className="flex flex-1 flex-col gap-6 overflow-x-auto p-4 lg:p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="size-8 text-blue-400" />
            <h1 className="text-3xl font-bold">Messages</h1>
          </div>
          <p className="text-muted-foreground">
            Stay connected with your tutors and peers.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your messages interface is being prepared. Check back soon!
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
