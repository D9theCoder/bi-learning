import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { TutorDashboardData } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Calendar as CalendarIcon } from 'lucide-react';
import { memo } from 'react';

interface TutorCourseListSectionProps {
  courses: TutorDashboardData['courses'];
}

export const TutorCourseListSection = memo(
  ({ courses }: TutorCourseListSectionProps) => (
    <section aria-labelledby="tutor-courses-heading" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2
          id="tutor-courses-heading"
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground"
        >
          <BookOpen className="size-5 text-primary" />
          Courses you teach
        </h2>
        <Link
          href="/courses/manage"
          prefetch
          className="text-sm font-semibold text-primary transition hover:opacity-80"
        >
          Manage courses
        </Link>
      </div>
      {courses.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No courses yet. Create your first course to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="group relative overflow-hidden"
            >
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-base font-semibold text-foreground">
                      {course.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {course.student_count} students · {course.active_students}{' '}
                      active
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      course.is_published
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {course.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Avg progress</span>
                    <span className="font-semibold text-foreground">
                      {course.average_progress}%
                    </span>
                  </div>
                  <Progress value={course.average_progress} />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Attendance rate</span>
                    <span className="font-semibold text-foreground">
                      {course.attendance_rate}%
                    </span>
                  </div>
                  <Progress value={course.attendance_rate} />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Assignment completion</span>
                    <span className="font-semibold text-foreground">
                      {course.assignment_rate}%
                    </span>
                  </div>
                  <Progress value={course.assignment_rate} />
                </div>
                {course.next_due_date && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarIcon className="size-4" />
                    Next deadline: {course.next_due_date}
                  </div>
                )}
              </CardContent>

              <div className="pointer-events-none absolute inset-0 flex items-end justify-end bg-gradient-to-l from-background/95 via-background/70 to-transparent p-4 opacity-0 transition-all duration-300 group-hover:opacity-100">
                <div className="flex gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="pointer-events-auto translate-y-2 shadow-lg transition-transform duration-300 group-hover:translate-y-0"
                  >
                    <Link href={`/courses/${course.id}`} prefetch>
                      View course
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="pointer-events-auto translate-y-2 shadow-lg transition-transform duration-300 group-hover:translate-y-0"
                  >
                    <Link href={`/courses/manage/${course.id}/edit`} prefetch>
                      Manage course
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  ),
);

TutorCourseListSection.displayName = 'TutorCourseListSection';
