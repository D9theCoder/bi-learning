import { Lesson } from '@/types';

interface SessionSelectorProps {
  lessons: Lesson[];
  activeSessionId: string;
  onSessionChange: (sessionId: string) => void;
}

export function SessionSelector({
  lessons,
  activeSessionId,
  onSessionChange,
}: SessionSelectorProps) {
  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
      {lessons.map((lesson, index) => (
        <button
          key={lesson.id}
          onClick={() => onSessionChange(lesson.id.toString())}
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
  );
}
