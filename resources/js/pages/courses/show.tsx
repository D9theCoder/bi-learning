import { EnrollModal } from '@/components/courses/enroll-modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Course, CourseContent, Lesson, User } from '@/types';
import { Head } from '@inertiajs/react';
import {
  BookOpen,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Globe,
  Link as LinkIcon,
  Video,
  Wifi,
} from 'lucide-react';
import { useState } from 'react';

interface CourseShowProps {
  course: Course & {
    instructor: User;
    lessons: (Lesson & {
      contents: CourseContent[];
    })[];
  };
  isEnrolled: boolean;
}

export default function CourseShow({ course, isEnrolled }: CourseShowProps) {
  const [activeSessionId, setActiveSessionId] = useState<string>(
    course.lessons.length > 0 ? course.lessons[0].id.toString() : '',
  );
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  const activeSession = course.lessons.find(
    (l) => l.id.toString() === activeSessionId,
  );

  const getIconForType = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'pdf':
      case 'file':
        return <FileText className="h-5 w-5" />;
      case 'quiz':
        return <CheckCircle className="h-5 w-5" />;
      case 'attendance':
        return <Wifi className="h-5 w-5" />;
      case 'link':
        return <LinkIcon className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Courses', href: '/courses' },
        { title: course.title, href: '#' },
      ]}
    >
      <Head title={course.title} />

      <div className="flex flex-col gap-6 p-4 lg:p-6">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-gray-100">
              {course.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Globe className="h-4 w-4" /> {course.category || 'General'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> {course.duration_minutes} mins
              </span>
              <BatchBadge difficulty={course.difficulty || 'All Levels'} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={course.instructor.avatar} />
              <AvatarFallback>
                {course.instructor.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">
                Primary Instructor
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {course.instructor.name}
              </p>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="session" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="session"
              className="rounded-t-lg border-b-2 border-transparent px-4 py-2 data-[state=active]:border-yellow-500 data-[state=active]:text-yellow-600 data-[state=active]:shadow-none"
            >
              Session
            </TabsTrigger>
            <TabsTrigger
              value="syllabus"
              className="rounded-t-lg border-b-2 border-transparent px-4 py-2 data-[state=active]:border-yellow-500 data-[state=active]:text-yellow-600 data-[state=active]:shadow-none"
            >
              Syllabus
            </TabsTrigger>
            {/* Add more tabs as needed */}
          </TabsList>

          <TabsContent value="session" className="mt-6 space-y-6">
            {/* Session Navigation (Horizontal Scroll) */}
            <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
              {course.lessons.map((lesson, index) => (
                <button
                  key={lesson.id}
                  onClick={() => setActiveSessionId(lesson.id.toString())}
                  className={`flex-shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    activeSessionId === lesson.id.toString()
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  Session {index + 1}
                </button>
              ))}
            </div>

            {activeSession ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left Column: Session Details */}
                <div className="space-y-6 lg:col-span-2">
                  <div>
                    <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {activeSession.title}
                    </h2>
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none text-gray-600"
                      dangerouslySetInnerHTML={{
                        __html: activeSession.description || '',
                      }}
                    />
                  </div>

                  {/* Example metadata mimicking the screenshot */}
                  <div className="space-y-4 border-t pt-4">
                    <div>
                      <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                        Learning Outcome
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Understanding the core concepts of {activeSession.title}
                        .
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="block text-gray-500">Start</span>
                        <span className="font-medium">
                          {new Date().toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="block text-gray-500">
                          Delivery Mode
                        </span>
                        <span className="font-medium">Online</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Things to do */}
                <div>
                  {!isEnrolled ? (
                    <Card className="mb-6 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/10">
                      <CardContent className="pt-6">
                        <h3 className="mb-2 font-semibold text-yellow-800 dark:text-yellow-500">
                          Start Learning
                        </h3>
                        <p className="mb-4 text-sm text-yellow-700 dark:text-yellow-600">
                          Enroll in this course to access materials and track
                          your progress.
                        </p>
                        <Button
                          className="w-full bg-yellow-600 text-white hover:bg-yellow-700"
                          onClick={() => setIsEnrollModalOpen(true)}
                        >
                          Enroll Now
                        </Button>
                      </CardContent>
                    </Card>
                  ) : null}

                  <Card className="border-none bg-yellow-600 text-white">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-medium">
                        Things to do in this session
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {activeSession.contents.length > 0 ? (
                        activeSession.contents.map((content) => (
                          <div
                            key={content.id}
                            className={`flex items-center justify-between rounded-lg p-3 ${
                              isEnrolled
                                ? 'cursor-pointer bg-white/10 hover:bg-white/20'
                                : 'cursor-not-allowed bg-white/5 opacity-70'
                            } transition-colors`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="rounded-md bg-white p-2 text-yellow-600">
                                {getIconForType(content.type)}
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  {content.title}
                                </p>
                                <p className="text-xs opacity-80">
                                  {content.duration_minutes
                                    ? `• ${content.duration_minutes}m`
                                    : ''}
                                </p>
                              </div>
                            </div>
                            {isEnrolled && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm italic opacity-80">
                          No materials listed for this session.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500">
                No sessions available for this course.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <EnrollModal
        courseId={course.id}
        courseTitle={course.title}
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
      />
    </AppLayout>
  );
}

function BatchBadge({ difficulty }: { difficulty: string }) {
  const color =
    {
      beginner:
        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      intermediate:
        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    }[difficulty.toLowerCase()] ||
    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';

  return (
    <span
      className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${color}`}
    >
      {difficulty}
    </span>
  );
}
