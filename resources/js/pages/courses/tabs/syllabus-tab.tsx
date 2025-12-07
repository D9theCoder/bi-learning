import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Course, Lesson, User } from '@/types';
import {
  BookOpen,
  ClipboardList,
} from 'lucide-react';

interface SyllabusTabProps {
  course: Course & {
    instructor: User;
    lessons: Lesson[];
  };
}

export function SyllabusTab({ course }: SyllabusTabProps) {
  const lessons = course.lessons ?? [];

  return (
    <div className="space-y-6">
      {/* Sub-tabs for syllabus sections */}
      <Tabs defaultValue="description" className="w-full">
        <div className="scrollbar-hide overflow-x-auto pb-2">
          <TabsList className="inline-flex w-max gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
            <TabsTrigger
              value="description"
              className="rounded-md px-3 py-1.5 text-xs data-[state=active]:bg-white data-[state=active]:text-yellow-600 sm:text-sm dark:data-[state=active]:bg-gray-700"
            >
              <BookOpen className="mr-1.5 hidden h-4 w-4 sm:inline" />
              Course Overview
            </TabsTrigger>
            <TabsTrigger
              value="lessons"
              className="rounded-md px-3 py-1.5 text-xs data-[state=active]:bg-white data-[state=active]:text-yellow-600 sm:text-sm dark:data-[state=active]:bg-gray-700"
            >
              <ClipboardList className="mr-1.5 hidden h-4 w-4 sm:inline" />
              Lessons
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Course Description */}
        <TabsContent value="description" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Course Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-gray-600 dark:text-gray-400">
                {course.description ||
                  'This course description has not been provided yet.'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lessons" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Lessons
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lessons.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No lessons have been added yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {lessons.map((lesson: Lesson, index: number) => (
                    <div
                      key={lesson.id}
                      className="rounded-lg border p-3 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            Session {index + 1}: {lesson.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {lesson.duration_minutes
                              ? `${lesson.duration_minutes} mins`
                              : 'Duration not set'}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {lesson.order ? `Order ${lesson.order}` : 'Unordered'}
                        </Badge>
                      </div>
                      {lesson.description ? (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          {lesson.description}
                        </p>
                      ) : null}
                      {lesson.contents && lesson.contents.length > 0 && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {lesson.contents.length} material
                          {lesson.contents.length > 1 ? 's' : ''} attached
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
