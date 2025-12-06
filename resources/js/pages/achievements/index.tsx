import { AchievementCard } from '@/components/achievements/achievement-card';
import { AchievementsSummary } from '@/components/achievements/achievements-summary';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { achievements } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Search, Trophy } from 'lucide-react';
import { useState } from 'react';

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
    category: 'Learning',
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
    category: 'Learning',
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
    category: 'Analysis',
  },
  {
    id: 4,
    name: 'Streak Master',
    description: 'Maintain a 30-day streak',
    icon: 'flame',
    updated_at: '2024-01-01',
    progress: 12,
    target: 30,
    rarity: 'platinum' as const,
    xp_reward: 1000,
    created_at: '2024-01-01',
    earned: false,
    category: 'Streak',
  },
];

const dummySummary = {
  total: 4,
  earned: 1,
  nextMilestone: {
    title: 'Bookworm',
  },
};

const categories = ['All', 'Learning', 'Analysis', 'Streak'];

// ! Modified component to use dummy data and local filtering
export default function AchievementsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredAchievements = dummyAchievements.filter((achievement) => {
    const matchesSearch = achievement.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || achievement.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

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

        <AchievementsSummary summary={dummySummary} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search achievements..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAchievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <EmptyState message="No achievements found matching your criteria." />
        )}
      </div>
    </AppLayout>
  );
}
