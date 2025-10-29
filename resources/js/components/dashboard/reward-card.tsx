import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Reward } from '@/types';
import { Gift, Lock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RewardCardProps {
    reward: Reward;
    claimed?: boolean;
    canClaim?: boolean;
    onClaim?: () => void;
    className?: string;
}

export function RewardCard({ reward, claimed = false, canClaim = false, onClaim, className }: RewardCardProps) {
    return (
        <Card className={cn(
            'transition-all hover:shadow-md',
            !canClaim && !claimed && 'opacity-50',
            className
        )}>
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    <div className={cn(
                        'flex size-14 shrink-0 items-center justify-center rounded-full',
                        claimed 
                            ? 'bg-green-500/10 text-green-500'
                            : canClaim 
                                ? 'bg-purple-500/10 text-purple-500'
                                : 'bg-muted text-muted-foreground'
                    )}>
                        {claimed ? (
                            <CheckCircle2 className="size-7" />
                        ) : canClaim ? (
                            <Gift className="size-7" />
                        ) : (
                            <Lock className="size-7" />
                        )}
                    </div>
                    <div className="flex-1 space-y-2">
                        <div>
                            <h4 className="font-semibold">{reward.name}</h4>
                            <p className="text-xs text-muted-foreground">
                                {reward.description}
                            </p>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2">
                            {reward.cost && (
                                <Badge variant="outline">
                                    {reward.cost} points required
                                </Badge>
                            )}
                            {reward.rarity && (
                                <Badge 
                                    variant={
                                        reward.rarity === 'legendary' ? 'default' :
                                        reward.rarity === 'epic' ? 'secondary' :
                                        'outline'
                                    }
                                >
                                    {reward.rarity}
                                </Badge>
                            )}
                        </div>

                        {!claimed && canClaim && onClaim && (
                            <Button 
                                size="sm" 
                                className="w-full"
                                onClick={onClaim}
                            >
                                Claim Reward
                            </Button>
                        )}
                        
                        {claimed && (
                            <Badge variant="outline" className="w-full justify-center">
                                Claimed
                            </Badge>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
