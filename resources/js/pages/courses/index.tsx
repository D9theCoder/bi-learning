import { CourseCard } from '@/components/courses/course-card';
import { CourseFilters } from '@/components/courses/course-filters';
import { CoursePagination } from '@/components/courses/course-pagination';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import AppLayout from '@/layouts/app-layout';
import { courses as coursesRoute } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'My Courses',
    href: coursesRoute().url,
  },
];

// ! Removed CoursesPageProps

// ! Dummy Data
const dummyCourses = {
  data: [
    {
      id: 1,
      title: 'Introduction to React',
      slug: 'intro-to-react',
      description: 'Learn the basics of React.',
      thumbnail: 'https://placehold.co/600x400/png',
      level: 'beginner',
      duration: '5 hours',
      rating: 4.5,
      total_students: 1200,
      modules_count: 5,
      price: 0,
      teacher: {
        id: 1,
        name: 'John Doe',
        avatar: 'https://ui-avatars.com/api/?name=John+Doe',
      },
      category: {
        id: 1,
        name: 'Web Development',
        slug: 'web-development',
      },
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
    },
    {
      id: 2,
      title: 'Advanced React Patterns',
      slug: 'advanced-react-patterns',
      description: 'Master advanced React concepts.',
      thumbnail: 'https://placehold.co/600x400/png',
      level: 'advanced',
      duration: '8 hours',
      rating: 4.8,
      total_students: 500,
      modules_count: 8,
      price: 0,
      teacher: {
        id: 2,
        name: 'Jane Smith',
        avatar: 'https://ui-avatars.com/api/?name=Jane+Smith',
      },
      category: {
        id: 1,
        name: 'Web Development',
        slug: 'web-development',
      },
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
    },
  ],
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 2,
};

const dummyFilters = {
  search: '',
  difficulty: 'all',
  category: 'all',
  sort: 'newest',
};

// ! Modified component to use dummy data
export default function CoursesPage() {
  const courses = dummyCourses;
  const filters = dummyFilters;
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const handleFilterChange = useCallback(
    (key: keyof typeof filters, value: string) => {
      // ! Disabled router visits for prototyping
      console.log('Filter changed:', key, value);
    },
    [filters, searchTerm],
  );

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm !== (filters.search || '')) {
        handleFilterChange('search', searchTerm);
      }
    }, 100);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, filters.search, handleFilterChange]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="My Courses" />

      <div className="flex flex-1 flex-col gap-6 overflow-x-auto p-4 lg:p-6">
        <PageHeader
          icon={BookOpen}
          title="My Courses"
          description="Explore and manage your enrolled courses."
        />

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
