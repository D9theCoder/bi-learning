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
  home,
  messages,
  rewards,
  tutors,
} from '@/routes';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
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
import { useRoles } from '@/hooks/use-roles';

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
  const { isAdmin, isStudent, isTutor } = useRoles();
  const { url } = usePage();

  const hideStudentOnly = isTutor && !isAdmin && !isStudent;
  const studentOnlyTitles = new Set(['Dashboard', 'Achievements', 'Rewards', 'Calendar']);
  const filteredNavItems = hideStudentOnly
    ? mainNavItems.filter((item) => !studentOnlyTitles.has(item.title))
    : mainNavItems;
  const navItems: NavItem[] = [...filteredNavItems];

  if (isAdmin || isTutor) {
    const manageLink: NavItem = {
      title: 'Manage Courses',
      href: '/courses/manage',
      icon: Folder,
    };

    const insertIndex = navItems.findIndex((item) => item.title === 'My Courses');
    if (insertIndex >= 0) {
      navItems.splice(insertIndex + 1, 0, manageLink);
    } else {
      navItems.unshift(manageLink);
    }
  }

  // Fix active state for My Courses to avoid highlighting when in Manage Courses
  const myCoursesIndex = navItems.findIndex((item) => item.title === 'My Courses');
  if (myCoursesIndex >= 0) {
    navItems[myCoursesIndex].isActive =
      url === '/courses' || (url.startsWith('/courses/') && !url.startsWith('/courses/manage'));
  }

  const homeHref = navItems[0]?.href ?? home().url;

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={homeHref} prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavFooter items={footerNavItems} className="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
