import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { achievements } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Trophy } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Achievements',
    href: achievements().url,
  },
];

export default function AchievementsPage() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Achievements" />

      <div className="flex flex-1 flex-col gap-6 overflow-x-auto p-4 lg:p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Trophy className="size-8 text-yellow-500" />
            <h1 className="text-3xl font-bold">Achievements</h1>
          </div>
          <p className="text-muted-foreground">
            Earn badges and unlock achievements by completing challenges and
            milestones.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your achievement collection is being prepared. Check back soon!
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
