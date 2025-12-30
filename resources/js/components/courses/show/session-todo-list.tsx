import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CourseContent } from '@/types';
import {
  BookOpen,
  CheckCircle,
  Download,
  FileText,
  Link as LinkIcon,
  Video,
  Wifi,
} from 'lucide-react';

interface SessionTodoListProps {
  contents: CourseContent[];
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

export function SessionTodoList({
  contents,
  canViewContent,
}: SessionTodoListProps) {
  const handleContentClick = (content: CourseContent) => {
    if (!canViewContent) {
      return;
    }

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
        {contents.length > 0 ? (
          contents.map((content) => (
            <div
              key={content.id}
              onClick={() => handleContentClick(content)}
              className={`flex items-center justify-between rounded-lg p-3 ${
                canViewContent
                  ? 'cursor-pointer bg-white/10 hover:bg-white/20'
                  : 'cursor-not-allowed bg-white/5 opacity-70'
              } transition-colors`}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-white p-2 text-yellow-600">
                  {getIconForType(content.type)}
                </div>
                <div>
                  <p className="text-sm font-medium">{content.title}</p>
                  <p className="text-xs opacity-80">
                    {content.duration_minutes
                      ? `• ${content.duration_minutes}m`
                      : ''}
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
          ))
        ) : (
          <p className="text-sm italic opacity-80">
            No materials listed for this session.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
