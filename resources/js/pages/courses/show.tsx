import { EnrollModal } from '@/components/courses/enroll-modal';
import {
  CourseHeader,
  CourseTabs,
  SessionTabContent,
} from '@/components/courses/show';
import { useRoles } from '@/hooks/use-roles';
import AppLayout from '@/layouts/app-layout';
import {
  Assessment,
  AssessmentSubmission,
  Course,
  CourseContent,
  Lesson,
  User,
} from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { AssessmentTab, AttendanceTab, GradebookTab, ScoringTab } from './tabs';

interface CourseShowProps {
  course: Course & {
    instructor: User;
    lessons: (Lesson & {
      contents: CourseContent[];
    })[];
  };
  isEnrolled: boolean;
  isTutor?: boolean;
  students?: any[];
  assessments?: Assessment[];
  submissions?: AssessmentSubmission[];
}

export default function CourseShow({
  course,
  isEnrolled,
  isTutor = false,
  students = [],
  assessments = [],
  submissions = [],
}: CourseShowProps) {
  // Read initial session from URL query parameter
  const getInitialSessionId = (): string => {
    if (typeof window === 'undefined')
      return course.lessons.length > 0 ? course.lessons[0].id.toString() : '';

    const params = new URLSearchParams(window.location.search);
    const sessionParam = params.get('session');

    if (
      sessionParam &&
      course.lessons.some((l) => l.id.toString() === sessionParam)
    ) {
      return sessionParam;
    }

    return course.lessons.length > 0 ? course.lessons[0].id.toString() : '';
  };

  const [activeSessionId, setActiveSessionId] =
    useState<string>(getInitialSessionId);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const { isAdmin } = useRoles();
  const page = usePage<{ auth?: { user?: { id: number } } }>();
  const currentUserId = page.props.auth?.user?.id;

  const canManageCourse =
    isAdmin ||
    (isTutor &&
      currentUserId !== undefined &&
      course.instructor_id === currentUserId);

  const canViewContent = isAdmin || canManageCourse || isEnrolled;

  const handleSessionChange = (sessionId: string) => {
    setActiveSessionId(sessionId);

    // Update URL with new session parameter
    const url = new URL(window.location.href);
    url.searchParams.set('session', sessionId);

    router.get(
      url.pathname + url.search,
      {},
      {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      },
    );
  };

  // Listen to browser navigation changes
  useEffect(() => {
    const handlePopState = () => {
      setActiveSessionId(getInitialSessionId());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const activeSession = course.lessons.find(
    (l) => l.id.toString() === activeSessionId,
  );

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Courses', href: '/courses' },
        { title: course.title, href: '#' },
      ]}
    >
      <Head title={course.title} />

      <div className="flex flex-col gap-4 p-4 lg:p-6">
        <CourseHeader
          title={course.title}
          category={course.category}
          durationMinutes={course.duration_minutes}
          difficulty={course.difficulty}
          instructor={course.instructor}
        />

        <CourseTabs
          sessionContent={
            <SessionTabContent
              lessons={course.lessons}
              activeSessionId={activeSessionId}
              onSessionChange={handleSessionChange}
              activeSession={activeSession}
              canViewContent={canViewContent}
              canManageCourse={canManageCourse}
              isEnrolled={isEnrolled}
              courseId={course.id}
              isAdmin={isAdmin}
              isTutor={isTutor}
              onEnrollClick={() => setIsEnrollModalOpen(true)}
            />
          }
          assessmentContent={
            <AssessmentTab
              course={course}
              assessments={assessments}
              submissions={submissions}
              isTutor={isTutor}
            />
          }
          gradebookContent={
            <GradebookTab
              course={course}
              isEnrolled={isEnrolled}
              isTutor={isTutor}
              students={students}
              assessments={assessments}
              submissions={submissions}
            />
          }
          scoringContent={
            <ScoringTab
              course={course}
              isEnrolled={isEnrolled}
              isTutor={isTutor}
              students={students}
              assessments={assessments}
              submissions={submissions}
            />
          }
          attendanceContent={
            <AttendanceTab
              course={course}
              isEnrolled={isEnrolled}
              isTutor={isTutor}
              students={students}
            />
          }
        />
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
