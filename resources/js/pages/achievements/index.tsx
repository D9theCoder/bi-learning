import { AchievementCard } from '@/components/achievements/achievement-card';
import { AchievementsSummary } from '@/components/achievements/achievements-summary';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import AppLayout from '@/layouts/app-layout';
import { achievements } from '@/routes';
import type { AchievementsPageProps, BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Trophy } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Achievements',
    href: achievements().url,
  },
];

export default function AchievementsPage({
  achievements: achievementsData,
  summary,
}: AchievementsPageProps) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Achievements" />

      <div className="flex flex-1 flex-col gap-6 overflow-x-auto p-4 lg:p-6">
        <PageHeader
          icon={Trophy}
          title="Achievements"
          description="Earn badges and unlock achievements by completing challenges and milestones."
          iconClassName="text-yellow-500"
        />

        <AchievementsSummary summary={summary} />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {achievementsData.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>

        {achievementsData.length === 0 && (
          <EmptyState message="No achievements yet. Start learning to unlock them!" />
        )}
      </div>
    </AppLayout>
  );
}
