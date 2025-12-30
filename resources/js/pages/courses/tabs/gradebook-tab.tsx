import { AccessGateWarningCard } from '@/components/courses/shared';
import {
  GradebookStudentGrid,
  GradebookTutorMatrix,
} from '@/components/courses/tabs/gradebook';
import { useRoles } from '@/hooks/use-roles';
import {
  Assessment,
  AssessmentSubmission,
  Course,
  StudentWithSubmissions,
  User,
} from '@/types';
import { BookCheck } from 'lucide-react';

interface GradebookTabProps {
  course: Course & {
    instructor: User;
  };
  isEnrolled: boolean;
  isTutor?: boolean;
  students?: StudentWithSubmissions[];
  assessments?: Assessment[];
  submissions?: AssessmentSubmission[];
}

export function GradebookTab({
  isEnrolled,
  isTutor = false,
  students = [],
  assessments = [],
  submissions = [],
}: GradebookTabProps) {
  const { isAdmin } = useRoles();
  const canView = isEnrolled || isAdmin || isTutor;

  if (!canView) {
    return (
      <AccessGateWarningCard
        icon={BookCheck}
        title="Gradebook Not Available"
        description="Enroll in this course to view your gradebook."
      />
    );
  }

  if (isTutor) {
    return (
      <GradebookTutorMatrix students={students} assessments={assessments} />
    );
  }

  return (
    <GradebookStudentGrid assessments={assessments} submissions={submissions} />
  );
}
