import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: number;
  variant?: 'default' | 'accent';
  className?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  variant = 'default',
  className,
}: StatCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="flex items-center gap-4 p-6">
        <div
          className={cn(
            'flex size-12 items-center justify-center rounded-lg',
            variant === 'accent' ? 'bg-primary/10 text-primary' : 'bg-muted',
          )}
        >
          <Icon className="size-6" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend !== undefined && (
            <Badge
              variant={trend >= 0 ? 'default' : 'secondary'}
              className="mt-1"
            >
              {trend >= 0 ? '+' : ''}
              {trend}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
