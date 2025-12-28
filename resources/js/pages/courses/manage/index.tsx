import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { ManageCoursesPageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, ShieldCheck, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ManageCourses({ courses, filters }: ManageCoursesPageProps) {
  const [search, setSearch] = useState(filters?.search || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (filters?.search || '')) {
        router.get(
          '/courses/manage',
          { search },
          { preserveState: true, replace: true, preserveScroll: true }
        );
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Courses', href: '/courses' },
        { title: 'Manage', href: '/courses/manage' },
      ]}
    >
      <Head title="Manage Courses" />

      <div className="flex flex-col gap-6 p-4 lg:p-8">
        <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Admin / Tutor</p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Courses</h1>
            <p className="text-sm text-muted-foreground">
              Create and maintain courses. Tutors only see their own courses; admins see everything.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64"
            />
            <Link href="/courses/manage/create" prefetch>
              <Button className="inline-flex items-center gap-2">
                <Plus className="size-4" />
                New Course
              </Button>
            </Link>
          </div>
        </header>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <ShieldCheck className="size-4 text-primary" />
              Courses
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              Total: {courses.total} | Page {courses.current_page} of {courses.last_page}
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {courses.data.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
                  <p className="text-base font-semibold text-foreground">No courses yet</p>
                  <p className="text-sm text-muted-foreground">
                    Create your first course to get started.
                  </p>
                  <Link href="/courses/manage/create" prefetch>
                    <Button size="sm">Create course</Button>
                  </Link>
                </div>
              )}

              {courses.data.map((course) => (
                <div key={course.id} className="flex flex-col gap-3 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-foreground">{course.title}</h3>
                      {course.is_published ? (
                        <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-semibold text-green-600 dark:text-green-400">
                          Published
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {course.category ?? 'Uncategorized'} · {course.difficulty ?? 'Unspecified'}
                    </p>
                    {course.instructor && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="size-3" />
                        <span>Instructor: {course.instructor.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/courses/${course.id}`} prefetch>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    <Link href={`/courses/manage/${course.id}/edit`} prefetch>
                      <Button variant="secondary" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex items-center justify-between px-6 pt-4 text-xs text-muted-foreground">
              <span>
                Showing {courses.data.length} of {courses.total}
              </span>
              <div className="flex items-center gap-1">
                {courses.links.map((link, i) =>
                  link.url ? (
                    <Link
                      key={i}
                      href={link.url}
                      className={`flex h-8 min-w-8 items-center justify-center rounded-md border px-3 ${
                        link.active
                          ? 'bg-primary text-primary-foreground'
                          : 'border-transparent hover:bg-muted'
                      }`}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ) : (
                    <span
                      key={i}
                      className="flex h-8 min-w-8 items-center justify-center px-3 text-muted-foreground opacity-50"
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  )
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

