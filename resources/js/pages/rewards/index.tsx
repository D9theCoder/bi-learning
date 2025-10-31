import { PointsBalanceCard } from '@/components/rewards/points-balance-card';
import { RewardCard } from '@/components/rewards/reward-card';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import AppLayout from '@/layouts/app-layout';
import { rewards as rewardsRoute } from '@/routes';
import type { BreadcrumbItem, RewardsPageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { Gift } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Rewards', href: rewardsRoute().url },
];

export default function RewardsPage({ user, rewards }: RewardsPageProps) {
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
