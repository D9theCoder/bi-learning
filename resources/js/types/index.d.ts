import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
  user: User;
}

export interface BreadcrumbItem {
  title: string;
  href: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface NavItem {
  title: string;
  href: NonNullable<InertiaLinkProps['href']>;
  icon?: LucideIcon | null;
  isActive?: boolean;
}

export interface SharedData {
  name: string;
  quote: { message: string; author: string };
  auth: Auth;
  sidebarOpen: boolean;
  [key: string]: unknown;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  email_verified_at: string | null;
  two_factor_enabled?: boolean;
  cohort_id?: number;
  total_xp?: number;
  level?: number;
  points_balance?: number;
  created_at: string;
  updated_at: string;
  [key: string]: unknown; // This allows for additional properties...
}

export interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail?: string;
  instructor_id: number;
  instructor?: User;
  duration_minutes?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  content?: string;
  duration_minutes: number;
  order: number;
  video_url?: string;
  is_completed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  course?: Course;
  progress_percentage: number;
  status: 'active' | 'completed' | 'paused';
  last_activity_at?: string;
  enrolled_at: string;
  completed_at?: string;
  next_lesson?: Lesson;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum';
  criteria?: string;
  xp_reward: number;
  earned_at?: string;
  created_at: string;
  category?: string;
  progress?: number;
  target?: number;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  created_at: string;
}

export interface Streak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
}

export interface DailyTask {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  type: 'lesson' | 'quiz' | 'practice' | 'reading';
  lesson_id?: number;
  lesson?: Lesson;
  estimated_minutes: number;
  xp_reward: number;
  is_completed: boolean;
  completed_at?: string;
  due_date: string;
  created_at: string;
}

export interface TutorMessage {
  id: number;
  tutor_id: number;
  user_id: number;
  tutor?: User;
  content: string;
  is_read: boolean;
  sent_at: string;
  created_at: string;
}

export interface LearningStats {
  streak: number;
  xp_this_week: number;
  hours_learned: number;
  active_courses: number;
  total_xp: number;
  level: number;
  points_balance: number;
}

export interface Reward {
  id: number;
  name: string;
  description: string;
  cost: number;
  icon: string;
  category?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  is_active: boolean;
  stock?: number;
  is_claimed?: boolean;
  created_at: string;
}

export interface LeaderboardEntry {
  id: number;
  name: string;
  avatar?: string;
  xp: number;
  level: number;
  rank: number;
  isCurrentUser?: boolean;
}

export interface Activity {
  id: number;
  user_id: number;
  type:
    | 'lesson_completed'
    | 'achievement_earned'
    | 'course_enrolled'
    | 'reward_claimed'
    | 'level_up';
  title?: string;
  description: string;
  xp_earned: number;
  icon?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface Cohort {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

export interface WeeklyActivityDataPoint {
  day: string;
  minutes: number;
  xp: number;
}

// Page Props Interfaces

export interface AchievementsPageProps {
  achievements: Array<Achievement & { earned: boolean; earned_at?: string }>;
  summary: {
    total: number;
    earned: number;
    nextMilestone?: {
      id: number;
      title: string;
      progress: number;
    };
  };
}

export interface CalendarPageProps {
  tasksByDate: Record<
    string,
    Array<{
      id: number;
      title: string;
      due_date: string;
      completed: boolean;
      xp_reward?: number;
    }>
  >;
  stats: {
    total: number;
    completed: number;
    overdue: number;
  };
  cursor?: {
    start: string;
    end: string;
  };
}

export interface CoursesPageProps {
  filters: {
    search?: string;
    category?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    sort?: string;
  };
  courses: {
    data: Array<
      Course & {
        lessons_count: number;
        user_progress?: {
          progress_percentage: number;
          next_lesson?: Lesson;
        };
      }
    >;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface MessagesPageProps {
  threads: Array<{
    partner: {
      id: number;
      name: string;
      avatar?: string;
    };
    latest_message_at: string;
    unread_count: number;
  }>;
  activeThread?: {
    partner: {
      id: number;
      name: string;
      avatar?: string;
    };
    messages: {
      data: Array<{
        id: number;
        body: string;
        sender_id: number;
        created_at: string;
        read_at?: string;
      }>;
      current_page: number;
      last_page: number;
    };
  };
}

export interface RewardsPageProps {
  user: {
    points_balance: number;
  };
  rewards: {
    data: Array<
      Reward & {
        can_redeem: boolean;
        remaining_stock?: number;
      }
    >;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters?: {
    rarity?: string;
  };
}

export interface TutorsPageProps {
  filters: {
    search?: string;
    expertise?: string;
    cohort_id?: number;
  };
  tutors: {
    data: Array<{
      id: number;
      name: string;
      avatar?: string;
      cohort?: {
        id: number;
        name: string;
      };
      expertise?: string[];
      rating?: number;
    }>;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
