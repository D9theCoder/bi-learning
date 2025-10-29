import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  achievements,
  calendar,
  courses,
  dashboard,
  messages,
  rewards,
  tutors,
} from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
  BookOpen,
  Calendar as CalendarIcon,
  Folder,
  Gift,
  LayoutGrid,
  MessageSquare,
  Trophy,
  Users,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: dashboard().url,
    icon: LayoutGrid,
  },
  {
    title: 'My Courses',
    href: courses().url,
    icon: BookOpen,
  },
  {
    title: 'Achievements',
    href: achievements().url,
    icon: Trophy,
  },
  {
    title: 'Rewards',
    href: rewards().url,
    icon: Gift,
  },
  {
    title: 'Tutors',
    href: tutors().url,
    icon: Users,
  },
  {
    title: 'Calendar',
    href: calendar().url,
    icon: CalendarIcon,
  },
  {
    title: 'Messages',
    href: messages().url,
    icon: MessageSquare,
  },
];

const footerNavItems: NavItem[] = [
  {
    title: 'Repository',
    href: 'https://github.com/laravel/react-starter-kit',
    icon: Folder,
  },
  {
    title: 'Documentation',
    href: 'https://laravel.com/docs/starter-kits#react',
    icon: BookOpen,
  },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={dashboard().url} prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={mainNavItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavFooter items={footerNavItems} className="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
