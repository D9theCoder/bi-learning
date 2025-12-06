import { AchievementCard } from '@/components/achievements/achievement-card';
import { AchievementsSummary } from '@/components/achievements/achievements-summary';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
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
// ! Removed AchievementsPageProps

// ! Dummy Data
const dummyAchievements = [
  {
    id: 1,
    name: 'Fast Learner',
    description: 'Completed 5 lessons in a day',
    icon: 'zap',
    updated_at: '2024-05-15',
    progress: 100,
    target: 100,
    rarity: 'bronze' as const,
    xp_reward: 50,
    created_at: '2024-01-01',
    earned_at: '2024-05-15',
    earned: true,
  },
  {
    id: 2,
    name: 'Bookworm',
    description: 'Read 1,000 articles',
    icon: 'book',
    updated_at: '2024-01-01',
    progress: 45,
    target: 100,
    rarity: 'silver' as const,
    xp_reward: 100,
    created_at: '2024-01-01',
    earned: false,
  },
  {
    id: 3,
    name: 'Trophy Hunter',
    description: 'Collect 10 trophies',
    icon: 'trophy',
    updated_at: '2024-01-01',
    progress: 2,
    target: 10,
    rarity: 'gold' as const,
    xp_reward: 500,
    created_at: '2024-01-01',
    earned: false,
  },
];

const dummySummary = {
  total: 3,
  earned: 1,
  nextMilestone: {
    title: 'Bookworm',
  },
};

// ! Modified component to use dummy data
export default function AchievementsPage() {
  const achievementsData = dummyAchievements;
  const summary = dummySummary;

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
