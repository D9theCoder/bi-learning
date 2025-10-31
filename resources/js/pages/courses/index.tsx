import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { courses as coursesRoute } from '@/routes';
import type { BreadcrumbItem, CoursesPageProps } from '@/types';
import { Form, Head, router } from '@inertiajs/react';
import { BookOpen, Play } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'My Courses',
    href: coursesRoute().url,
  },
];

const difficultyColors = {
  beginner: 'bg-green-500/20 text-green-400',
  intermediate: 'bg-yellow-500/20 text-yellow-400',
  advanced: 'bg-red-500/20 text-red-400',
};

const sortLabels: Record<string, string> = {
  latest: 'Latest',
  popular: 'Popular',
  progress: 'Progress',
};

export default function CoursesPage({ courses, filters }: CoursesPageProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const handleFilterChange = useCallback((key: keyof typeof filters, value: string) => {
    // Always start from current props, then inject the latest search term
    const updatedFilters: Record<string, string> = { ...filters } as Record<string, string>;

    // Keep the current input value in the query (trimmed). If empty, drop it.
    const currentTerm = (key === 'search' ? value : searchTerm).trim();
    if (currentTerm) {
      updatedFilters.search = currentTerm;
    } else {
      delete updatedFilters.search;
    }

    // For non-search filters, treat "all" as unset (remove from query)
    if (key !== 'search') {
      if (value === 'all') {
        delete updatedFilters[key as string];
      } else {
        updatedFilters[key as string] = value;
      }
    }

    router.get(coursesRoute().url, updatedFilters, {
      preserveState: true,
      preserveScroll: true,
    });
  }, [filters, searchTerm]);

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
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <BookOpen className="size-8 text-blue-500" />
            <h1 className="text-3xl font-bold">My Courses</h1>
          </div>
          <p className="text-muted-foreground">
            Explore and manage your enrolled courses.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <Input
            type="search"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Select
            value={filters.difficulty || 'all'}
            onValueChange={(value) => handleFilterChange('difficulty', value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.sort ?? 'latest'}
            onValueChange={(value) => handleFilterChange('sort', value)}
          >
            <SelectTrigger className="w-40">
              {/* Show a human-friendly label even when using a controlled value */}
              <SelectValue>
                {(() => {
                  const current = filters.sort ?? 'latest';
                  return sortLabels[current] ?? 'Latest';
                })()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Courses Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.data.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{course.title}</CardTitle>
                  {course.difficulty && (
                    <Badge
                      className={difficultyColors[course.difficulty]}
                      variant="secondary"
                    >
                      {course.difficulty}
                    </Badge>
                  )}
                </div>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  {course.lessons_count} lessons
                </div>
                {course.instructor && (
                  <div className="text-xs text-muted-foreground">
                    By {course.instructor.name}
                  </div>
                )}
                {course.user_progress && (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">
                      {Math.round(course.user_progress.progress_percentage)}%
                      complete
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${course.user_progress.progress_percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {course.user_progress ? (
                  <Button className="w-full" size="sm">
                    <Play className="mr-2 size-4" />
                    Continue Learning
                  </Button>
                ) : (
                  <Form
                    action={`/courses/${course.id}/enroll`}
                    method="post"
                    className="w-full"
                  >
                    <Button
                      type="submit"
                      className="w-full"
                      size="sm"
                      variant="outline"
                    >
                      Enroll Now
                    </Button>
                  </Form>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {courses.data.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No courses found. Try adjusting your filters.
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {courses.last_page > 1 && (
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: courses.last_page }, (_, i) => i + 1).map(
              (page) => (
                <Button
                  key={page}
                  variant={
                    page === courses.current_page ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => {
                    const params: Record<string, string> = {
                      ...filters,
                      page: page.toString(),
                    } as Record<string, string>;

                    const term = searchTerm.trim();
                    if (term) {
                      params.search = term;
                    } else {
                      delete params.search;
                    }

                    router.get(coursesRoute().url, params, {
                      preserveState: true,
                      preserveScroll: true,
                    });
                  }}
                >
                  {page}
                </Button>
              ),
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
