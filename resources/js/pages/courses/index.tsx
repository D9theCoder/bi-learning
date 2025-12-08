import { CourseCard } from '@/components/courses/course-card';
import { CourseFilters } from '@/components/courses/course-filters';
import { CoursePagination } from '@/components/courses/course-pagination';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { useRoles } from '@/hooks/use-roles';
import AppLayout from '@/layouts/app-layout';
import { courses as coursesRoute } from '@/routes';
import type { BreadcrumbItem, CoursesPageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { BookOpen, Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'My Courses',
    href: coursesRoute().url,
  },
];

export default function CoursesPage({ courses, filters }: CoursesPageProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const { isAdmin, isTutor } = useRoles();
  const canManageCourses = isAdmin || isTutor;

  const handleFilterChange = useCallback(
    (key: keyof typeof filters, value: string) => {
      router.get(
        coursesRoute().url,
        { ...filters, [key]: value, page: 1 },
        { preserveState: true, replace: true },
      );
    },
    [filters],
  );

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm !== (filters.search || '')) {
        handleFilterChange('search', searchTerm);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, filters.search, handleFilterChange]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="My Courses" />

      <div className="flex flex-1 flex-col gap-6 overflow-x-auto p-4 lg:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <PageHeader
            icon={BookOpen}
            title="My Courses"
            description="Explore and manage your enrolled courses."
          />
          {canManageCourses && (
            <Button className="self-start" size="sm" asChild>
              <Link href="/courses/manage/create" prefetch>
                <Plus className="mr-2 size-4" />
                Add Course
              </Link>
            </Button>
          )}
        </div>

        <CourseFilters
          filters={filters}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onFilterChange={handleFilterChange}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.data.map((course) => (
            // @ts-ignore
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {courses.data.length === 0 && (
          <EmptyState message="No courses found. Try adjusting your filters." />
        )}

        <CoursePagination
          currentPage={courses.current_page}
          lastPage={courses.last_page}
          filters={filters as Record<string, string>}
          searchTerm={searchTerm}
        />
      </div>
    </AppLayout>
  );
}
