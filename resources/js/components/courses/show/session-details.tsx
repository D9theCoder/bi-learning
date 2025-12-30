import { Lesson } from '@/types';

interface SessionDetailsProps {
  session: Lesson;
}

export function SessionDetails({ session }: SessionDetailsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
          {session.title}
        </h2>
        <div
          className="prose prose-sm dark:prose-invert max-w-none text-gray-600"
          dangerouslySetInnerHTML={{
            __html: session.description || '',
          }}
        />
      </div>

      <div className="space-y-4 border-t pt-4">
        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <span className="block text-gray-500">Duration</span>
            <span className="font-medium">
              {session.duration_minutes
                ? `${session.duration_minutes} mins`
                : 'Not specified'}
            </span>
          </div>
          <div>
            <span className="block text-gray-500">Order</span>
            <span className="font-medium">Session {session.order ?? '-'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
