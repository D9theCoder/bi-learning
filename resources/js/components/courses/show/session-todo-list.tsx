import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Assessment, CourseContent } from '@/types';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import {
  BookOpen,
  CheckCircle,
  Download,
  FileText,
  Link as LinkIcon,
  Video,
  Wifi,
} from 'lucide-react';
import { useState } from 'react';

interface SessionTodoListProps {
  contents: CourseContent[];
  assessments: Assessment[];
  currentLessonId: number | null;
  courseId: number;
  canViewContent: boolean;
}

function getIconForType(type: string) {
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
}

function getAssessmentTypeLabel(type: Assessment['type']) {
  if (type === 'practice') {
    return 'Practice';
  }

  if (type === 'final_exam') {
    return 'Final Exam';
  }

  return 'Quiz';
}

function getAssessmentIcon(type: Assessment['type']) {
  if (type === 'final_exam') {
    return <FileText className="h-5 w-5" />;
  }

  return <CheckCircle className="h-5 w-5" />;
}

export function SessionTodoList({
  contents,
  assessments,
  currentLessonId,
  courseId,
  canViewContent,
}: SessionTodoListProps) {
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());
  const sessionContents = contents.filter((content) => content.type !== 'assessment');
  const sessionAssessments = currentLessonId
    ? assessments.filter((assessment) => assessment.lesson_id === currentLessonId)
    : [];
  const hasItems = sessionContents.length > 0 || sessionAssessments.length > 0;

  const handleContentClick = async (content: CourseContent) => {
    if (!canViewContent) {
      return;
    }

    // Mark content as complete in the backend using axios (not Inertia)
    try {
      await axios.post(`/contents/${content.id}/complete`);
      setCompletedIds((prev) => new Set([...prev, content.id]));
    } catch (error) {
      console.error('Failed to mark content as complete:', error);
    }

    // Open content in new tab
    if (content.type === 'file' && content.file_path) {
      window.open(`/storage/${content.file_path}`, '_blank');
    } else if (
      (content.type === 'video' || content.type === 'link') &&
      content.url
    ) {
      window.open(content.url, '_blank');
    }
  };

  return (
    <Card className="border-none bg-yellow-600 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">
          Things to do in this session
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {hasItems ? (
          <>
            {sessionContents.map((content) => {
              const isCompleted = completedIds.has(content.id);
              return (
                <div
                  key={`content-${content.id}`}
                  onClick={() => handleContentClick(content)}
                  className={`flex items-center justify-between rounded-lg p-3 ${
                    canViewContent
                      ? 'cursor-pointer bg-white/10 hover:bg-white/20'
                      : 'cursor-not-allowed bg-white/5 opacity-70'
                  } transition-colors`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-md p-2 ${isCompleted ? 'bg-green-500 text-white' : 'bg-white text-yellow-600'}`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        getIconForType(content.type)
                      )}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${isCompleted ? 'line-through opacity-80' : ''}`}
                      >
                        {content.title}
                      </p>
                      <p className="text-xs opacity-80">
                        {content.duration_minutes
                          ? `• ${content.duration_minutes}m`
                          : ''}
                        {isCompleted && ' • Completed'}
                      </p>
                    </div>
                  </div>
                  {canViewContent && (content.file_path || content.url) && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContentClick(content);
                      }}
                    >
                      {content.type === 'file' ? (
                        <Download className="h-4 w-4" />
                      ) : (
                        <LinkIcon className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              );
            })}
            {sessionAssessments.map((assessment) => {
              const typeLabel = getAssessmentTypeLabel(assessment.type);
              const dueDate = assessment.due_date
                ? new Date(assessment.due_date).toLocaleDateString()
                : null;
              const containerClass = `flex items-center justify-between rounded-lg p-3 ${
                canViewContent
                  ? 'cursor-pointer bg-white/10 hover:bg-white/20'
                  : 'cursor-not-allowed bg-white/5 opacity-70'
              } transition-colors`;

              const content = (
                <>
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-white p-2 text-yellow-600">
                      {getAssessmentIcon(assessment.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{assessment.title}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs opacity-80">
                        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">
                          {typeLabel}
                        </span>
                        {dueDate ? <span>Due {dueDate}</span> : null}
                      </div>
                    </div>
                  </div>
                  {canViewContent ? (
                    <span className="text-xs opacity-80">View</span>
                  ) : null}
                </>
              );

              if (!canViewContent) {
                return (
                  <div key={`assessment-${assessment.id}`} className={containerClass}>
                    {content}
                  </div>
                );
              }

              return (
                <Link
                  key={`assessment-${assessment.id}`}
                  href={`/courses/${courseId}/quiz/${assessment.id}`}
                  className={containerClass}
                >
                  {content}
                </Link>
              );
            })}
          </>
        ) : (
          <p className="text-sm italic opacity-80">
            No materials listed for this session.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
