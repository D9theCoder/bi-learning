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
import { rewards as rewardsRoute } from '@/routes';
import type { BreadcrumbItem, RewardsPageProps } from '@/types';
import { Form, Head } from '@inertiajs/react';
import { Coins, Gift } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Rewards', href: rewardsRoute().url },
];

const rarityColors = {
  common: 'bg-gray-500/20 text-gray-400',
  rare: 'bg-blue-500/20 text-blue-400',
  epic: 'bg-purple-500/20 text-purple-400',
  legendary: 'bg-yellow-500/20 text-yellow-400',
};

export default function RewardsPage({ user, rewards }: RewardsPageProps) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Rewards" />

      <div className="flex flex-1 flex-col gap-6 overflow-x-auto p-4 lg:p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Gift className="size-8 text-pink-500" />
            <h1 className="text-3xl font-bold">Rewards</h1>
          </div>
          <p className="text-muted-foreground">
            Redeem your points for awesome rewards.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="size-5 text-yellow-500" />
              Your Points: {user.points_balance}
            </CardTitle>
          </CardHeader>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rewards.data.map((reward) => (
            <Card key={reward.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{reward.name}</CardTitle>
                  {reward.rarity && (
                    <Badge
                      className={rarityColors[reward.rarity]}
                      variant="outline"
                    >
                      {reward.rarity}
                    </Badge>
                  )}
                </div>
                <CardDescription>{reward.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-lg font-bold">
                  <Coins className="size-5 text-yellow-500" />
                  {reward.cost} points
                </div>
                {reward.remaining_stock !== null && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {reward.remaining_stock} left in stock
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Form
                  action={`/rewards/${reward.id}/redeem`}
                  method="post"
                  className="w-full"
                >
                  <Button
                    type="submit"
                    disabled={!reward.can_redeem}
                    className="w-full"
                    size="sm"
                  >
                    {reward.can_redeem ? 'Redeem' : 'Insufficient Points'}
                  </Button>
                </Form>
              </CardFooter>
            </Card>
          ))}
        </div>

        {rewards.data.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No rewards available at the moment.
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
