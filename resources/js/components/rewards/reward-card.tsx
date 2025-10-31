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
import type { Reward } from '@/types';
import { Form } from '@inertiajs/react';
import { Coins } from 'lucide-react';

const rarityColors = {
  common: 'bg-gray-500/20 text-gray-400',
  rare: 'bg-blue-500/20 text-blue-400',
  epic: 'bg-purple-500/20 text-purple-400',
  legendary: 'bg-yellow-500/20 text-yellow-400',
};

interface RewardCardProps {
  reward: Reward & {
    can_redeem: boolean;
    remaining_stock?: number;
  };
}

export function RewardCard({ reward }: RewardCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{reward.name}</CardTitle>
          {reward.rarity && (
            <Badge className={rarityColors[reward.rarity]} variant="outline">
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
  );
}
