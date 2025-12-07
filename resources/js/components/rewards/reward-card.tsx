import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import React from 'react';

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
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const canRedeem = reward.can_redeem;
  const stockText =
    reward.remaining_stock !== undefined && reward.remaining_stock !== null
      ? `${reward.remaining_stock} left in stock`
      : null;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
          {stockText && (
            <p className="mt-2 text-xs text-muted-foreground">{stockText}</p>
          )}
        </CardContent>
        <CardFooter>
          <DialogTrigger asChild>
            <Button
              type="button"
              disabled={!canRedeem}
              className="w-full"
              size="sm"
            >
              {canRedeem ? 'Redeem' : 'Insufficient Points'}
            </Button>
          </DialogTrigger>
        </CardFooter>
      </Card>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Redeem {reward.name}?</DialogTitle>
          <DialogDescription>
            This will spend {reward.cost} points. You cannot undo this action.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button" size="sm">
              Cancel
            </Button>
          </DialogClose>
          <Form
            action={`/rewards/${reward.id}/redeem`}
            method="post"
            className="w-full sm:w-auto"
          >
            <Button
              type="submit"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => setIsDialogOpen(false)}
            >
              Confirm Redeem
            </Button>
          </Form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
