import { Coins } from 'lucide-react';
import { useRoles } from '@/hooks/use-roles';
interface DashboardWelcomeHeaderProps {
  userName: string;
  pointsBalance: number;
  isTutor?: boolean;
}

export function DashboardWelcomeHeader({
  userName,
  pointsBalance,
  isTutor = false,
}: DashboardWelcomeHeaderProps) {
  const { isStudent } = useRoles();
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-2">
        <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight lg:text-4xl">
          Welcome back, {userName}!
        </h1>
        <p className="text-muted-foreground">
          {isTutor
            ? 'Monitor your classes, student activity, and upcoming deadlines at a glance.'
            : "Ready to continue your learning streak? You're doing great!"}
        </p>
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground">
        {isStudent && (
          <>
            <Coins className="size-4 text-primary" />
            <span className="text-foreground">Points</span>
            <span className="text-lg font-bold text-foreground">
              {pointsBalance}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
