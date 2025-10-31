import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AchievementsSummaryProps {
  summary: {
    total: number;
    earned: number;
    nextMilestone?: { title: string } | null;
  };
}

export function AchievementsSummary({ summary }: AchievementsSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Total Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.total}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Earned</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.earned}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((summary.earned / summary.total) * 100)}% complete
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Next Milestone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm font-medium">
            {summary.nextMilestone
              ? summary.nextMilestone.title
              : 'All complete!'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
