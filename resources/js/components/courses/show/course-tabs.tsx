import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  CalendarCheck,
  CheckCircle,
  ClipboardList,
  Star,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface CourseTabsProps {
  sessionContent: ReactNode;
  assessmentContent: ReactNode;
  gradebookContent: ReactNode;
  scoringContent: ReactNode;
  attendanceContent: ReactNode;
}

export function CourseTabs({
  sessionContent,
  assessmentContent,
  gradebookContent,
  scoringContent,
  attendanceContent,
}: CourseTabsProps) {
  return (
    <Tabs defaultValue="session" className="w-full">
      <div className="border-b">
        <TabsList className="flex h-auto w-full flex-wrap items-center justify-start gap-0 rounded-none bg-transparent p-0">
          <TabsTrigger
            value="session"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm data-[state=active]:border-yellow-500 data-[state=active]:text-yellow-600 data-[state=active]:shadow-none"
          >
            <BookOpen className="mr-1.5 h-4 w-4" />
            Session
          </TabsTrigger>
          <TabsTrigger
            value="assessment"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm data-[state=active]:border-yellow-500 data-[state=active]:text-yellow-600 data-[state=active]:shadow-none"
          >
            <ClipboardList className="mr-1.5 h-4 w-4" />
            Assessment
          </TabsTrigger>
          <TabsTrigger
            value="gradebook"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm data-[state=active]:border-yellow-500 data-[state=active]:text-yellow-600 data-[state=active]:shadow-none"
          >
            <Star className="mr-1.5 h-4 w-4" />
            Gradebook
          </TabsTrigger>
          <TabsTrigger
            value="scoring"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm data-[state=active]:border-yellow-500 data-[state=active]:text-yellow-600 data-[state=active]:shadow-none"
          >
            <CheckCircle className="mr-1.5 h-4 w-4" />
            Scoring
          </TabsTrigger>
          <TabsTrigger
            value="attendance"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm data-[state=active]:border-yellow-500 data-[state=active]:text-yellow-600 data-[state=active]:shadow-none"
          >
            <CalendarCheck className="mr-1.5 h-4 w-4" />
            Attendance
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="session" className="mt-4 space-y-6">
        {sessionContent}
      </TabsContent>

      <TabsContent value="assessment" className="mt-4">
        {assessmentContent}
      </TabsContent>

      <TabsContent value="gradebook" className="mt-4">
        {gradebookContent}
      </TabsContent>

      <TabsContent value="scoring" className="mt-4">
        {scoringContent}
      </TabsContent>

      <TabsContent value="attendance" className="mt-4">
        {attendanceContent}
      </TabsContent>
    </Tabs>
  );
}
