import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useRoles } from '@/hooks/use-roles';
import { Assessment, AssessmentSubmission, Course, User } from '@/types';
import { BookCheck } from 'lucide-react';

interface GradebookTabProps {
  course: Course & {
    instructor: User;
  };
  isEnrolled: boolean;
  isTutor?: boolean;
  students?: any[];
  assessments?: Assessment[];
  submissions?: AssessmentSubmission[];
}

export function GradebookTab({
  course,
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
      <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/10">
        <CardContent className="py-12 text-center">
          <BookCheck className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
          <h3 className="mb-2 text-lg font-semibold text-yellow-800 dark:text-yellow-400">
            Gradebook Not Available
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-500">
            Enroll in this course to view your gradebook.
          </p>
        </CardContent>
      </Card>
    );
  }

  // TUTOR VIEW: Matrix (Students x Assessments)
  if (isTutor) {
    if (assessments.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No assessments to display in gradebook.
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50">
              <tr className="border-b">
                <th className="sticky left-0 z-10 bg-gray-50 p-4 font-medium dark:bg-gray-900">
                  Student
                </th>
                {assessments.map((a) => (
                  <th
                    key={a.id}
                    className="min-w-[60px] p-4 text-center font-medium whitespace-nowrap"
                  >
                    {a.title}
                  </th>
                ))}
                <th className="p-4 text-center font-medium">Average</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((student) => {
                  // Calculate average
                  let totalScore = 0;
                  let maxTotal = 0;

                  return (
                    <tr
                      key={student.id}
                      className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="sticky left-0 bg-white p-4 dark:bg-gray-950">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={student.avatar} />
                            <AvatarFallback>
                              {student.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{student.name}</div>
                        </div>
                      </td>
                      {assessments.map((a) => {
                        const sub = student.submissions?.find(
                          (s: any) => s.assessment_id === a.id,
                        );
                        const score = sub?.score;
                        if (score !== undefined && score !== null) {
                          totalScore += Number(score);
                          maxTotal += a.max_score;
                        }

                        return (
                          <td key={a.id} className="p-4 text-center">
                            {score !== undefined && score !== null ? (
                              <span
                                className={`font-medium ${score < a.max_score * 0.6 ? 'text-red-500' : 'text-green-600'}`}
                              >
                                {score}
                              </span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-4 text-center font-bold">
                        {maxTotal > 0
                          ? Math.round((totalScore / maxTotal) * 100)
                          : 0}
                        %
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={assessments.length + 2}
                    className="p-8 text-center text-muted-foreground"
                  >
                    No students enrolled.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    );
  }

  // STUDENT VIEW (Detailed Breakdown)
  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <BookCheck className="h-5 w-5 text-yellow-600" />
          <h3 className="text-lg font-semibold">My Gradebook</h3>
        </div>

        {assessments.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assessments.map((assessment) => {
              const submission = submissions.find(
                (s) => s.assessment_id === assessment.id,
              );
              const score = submission?.score ?? 0;
              const percentage = Math.round(
                (score / assessment.max_score) * 100,
              );

              return (
                <div
                  key={assessment.id}
                  className="rounded-lg border bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <h4
                      className="truncate pr-2 font-medium"
                      title={assessment.title}
                    >
                      {assessment.title}
                    </h4>
                    <span className="text-xs text-gray-400">
                      {assessment.max_score} pts
                    </span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold">
                      {submission ? score : '-'}
                    </span>
                    <span className="mb-1 text-sm text-gray-500">
                      {submission ? `${percentage}%` : 'Pending'}
                    </span>
                  </div>
                  {submission?.feedback && (
                    <div className="mt-3 rounded bg-blue-50 p-2 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                      {submission.feedback}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            No grades available.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
