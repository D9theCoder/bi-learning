import {
  EnrollPromptCard,
  ManageCourseCard,
  MeetingCard,
  SessionDetails,
  SessionSelector,
  SessionTodoList,
} from '@/components/courses/show';
import type { Assessment, CourseContent, Lesson } from '@/types';

interface SessionTabContentProps {
  lessons: (Lesson & { contents: CourseContent[] })[];
  activeSessionId: string;
  onSessionChange: (sessionId: string) => void;
  activeSession: (Lesson & { contents: CourseContent[] }) | undefined;
  canViewContent: boolean;
  canManageCourse: boolean;
  isEnrolled: boolean;
  courseId: number;
  assessments: Assessment[];
  isAdmin: boolean;
  isTutor: boolean;
  onEnrollClick: () => void;
}

export function SessionTabContent({
  lessons,
  activeSessionId,
  onSessionChange,
  activeSession,
  canViewContent,
  canManageCourse,
  isEnrolled,
  courseId,
  assessments,
  isAdmin,
  isTutor,
  onEnrollClick,
}: SessionTabContentProps) {
  const sessionContentCount = activeSession
    ? activeSession.contents.filter((content) => content.type !== 'assessment')
        .length
    : 0;
  const sessionAssessmentCount = activeSession
    ? assessments.filter((assessment) => assessment.lesson_id === activeSession.id)
        .length
    : 0;

  return (
    <div className="space-y-6">
      <SessionSelector
        lessons={lessons}
        activeSessionId={activeSessionId}
        onSessionChange={onSessionChange}
      />

      {activeSession ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <SessionDetails
              session={activeSession}
              contentCount={sessionContentCount}
              assessmentCount={sessionAssessmentCount}
            />

            {activeSession.meeting_url && (
              <MeetingCard
                lessonId={activeSession.id}
                meetingUrl={activeSession.meeting_url}
                meetingStartTime={activeSession.meeting_start_time ?? null}
                meetingEndTime={activeSession.meeting_end_time ?? null}
                hasAttended={activeSession.has_attended}
                isAdmin={isAdmin}
                isTutor={isTutor}
              />
            )}
          </div>

          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            {canManageCourse ? (
              <ManageCourseCard courseId={courseId} />
            ) : !isEnrolled ? (
              <EnrollPromptCard onEnrollClick={onEnrollClick} />
            ) : null}

            <SessionTodoList
              contents={activeSession.contents}
              canViewContent={canViewContent}
              assessments={assessments}
              currentLessonId={activeSession.id}
              courseId={courseId}
            />
          </div>
        </div>
      ) : (
        <div className="py-12 text-center text-gray-500">
          No sessions available for this course.
        </div>
      )}
    </div>
  );
}
