import { PointsBalanceCard } from '@/components/rewards/points-balance-card';
import { RewardCard } from '@/components/rewards/reward-card';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import AppLayout from '@/layouts/app-layout';
import { rewards as rewardsRoute } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Gift } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Rewards', href: rewardsRoute().url },
];

// ! Removed RewardsPageProps

// ! Dummy Data
const dummyUser = {
  points_balance: 1250,
};

const dummyRewards = {
  data: [
    {
      id: 1,
      name: '1 Hour Mentorship',
      description: 'Get 1-on-1 mentorship with an expert.',
      cost: 500,
      icon: 'users',
      category: 'Mentorship',
      rarity: 'rare' as const,
      is_active: true,
      stock: 5,
      is_claimed: false,
      can_redeem: true,
      remaining_stock: 5,
      created_at: '2024-01-01',
    },
    {
      id: 2,
      name: 'Sticker Pack',
      description: 'Exclusive Bi-Learning sticker pack.',
      cost: 200,
      icon: 'smile',
      category: 'Merch',
      rarity: 'common' as const,
      is_active: true,
      stock: 100,
      is_claimed: false,
      can_redeem: true,
      remaining_stock: 95,
      created_at: '2024-01-01',
    },
  ],
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 2,
};

// ! Modified component to use dummy data
export default function RewardsPage() {
  const user = dummyUser;
  const rewards = dummyRewards;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Rewards" />

      <div className="flex flex-1 flex-col gap-6 overflow-x-auto p-4 lg:p-6">
        <PageHeader
          icon={Gift}
          title="Rewards"
          description="Redeem your points for awesome rewards."
          iconClassName="text-pink-500"
        />

        <PointsBalanceCard balance={user.points_balance} />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rewards.data.map((reward) => (
            <RewardCard key={reward.id} reward={reward} />
          ))}
        </div>

        {rewards.data.length === 0 && (
          <EmptyState message="No rewards available at the moment." />
        )}
      </div>
    </AppLayout>
  );
}
