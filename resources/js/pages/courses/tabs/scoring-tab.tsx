import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRoles } from '@/hooks/use-roles';
import { Assessment, AssessmentSubmission, Course, User } from '@/types';
import { router } from '@inertiajs/react';
import { Award, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { useState } from 'react';

interface ScoringTabProps {
  course: Course & {
    instructor: User;
  };
  isEnrolled: boolean;
  isTutor?: boolean;
  assessments?: Assessment[];
  students?: any[];
  submissions?: AssessmentSubmission[];
}

export function ScoringTab({
  course,
  isEnrolled,
  isTutor = false,
  assessments = [],
  students = [],
  submissions = [], // This is for student view (my submissions)
}: ScoringTabProps) {
  const { isAdmin } = useRoles();
  const canView = isEnrolled || isAdmin || isTutor;

  // State for expanding assessment grading view
  const [expandedAssessmentId, setExpandedAssessmentId] = useState<
    number | null
  >(null);

  // State for form inputs (simple key-based store to avoid complex re-renders)
  const [scores, setScores] = useState<Record<string, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});

  if (!canView) {
    return (
      <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/10">
        <CardContent className="py-12 text-center">
          <Award className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
          <h3 className="mb-2 text-lg font-semibold text-yellow-800 dark:text-yellow-400">
            Scoring Not Available
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-500">
            Enroll in this course to view your grades and scoring details.
          </p>
        </CardContent>
      </Card>
    );
  }

  // TUTOR VIEW
  if (isTutor) {
    if (assessments.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No assessments available to grade.
          </CardContent>
        </Card>
      );
    }

    const handleSave = (
      assessmentId: number,
      studentId: number,
      maxScore: number,
    ) => {
      const key = `${assessmentId}-${studentId}`;
      const scoreVal = scores[key];
      const feedbackVal = feedbacks[key];

      if (scoreVal === undefined && feedbackVal === undefined) return;

      // Get submission to check existing values if not dirty?
      // Logic: Only send if we have a value.
      // Actually, we must send valid data.

      router.post(
        `/assessments/${assessmentId}/score`,
        {
          user_id: studentId,
          score: scoreVal, // Controller validation handles numbers
          feedback: feedbackVal,
        },
        {
          preserveScroll: true,
          onSuccess: () => {
            // Optional: show toast
          },
        },
      );
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Grading Dashboard</h3>
        </div>

        {assessments.map((assessment) => (
          <Card key={assessment.id} className="overflow-hidden">
            <div
              className="flex cursor-pointer items-center justify-between p-6 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
              onClick={() =>
                setExpandedAssessmentId(
                  expandedAssessmentId === assessment.id ? null : assessment.id,
                )
              }
            >
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-blue-500" />
                <div>
                  <h4 className="text-lg font-medium">{assessment.title}</h4>
                  <p className="text-sm text-gray-500">
                    Max Score: {assessment.max_score} • Due:{' '}
                    {assessment.due_date
                      ? new Date(assessment.due_date).toLocaleDateString()
                      : 'No due date'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                {expandedAssessmentId === assessment.id ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>

            {expandedAssessmentId === assessment.id && (
              <div className="border-t bg-gray-50/50 p-6 dark:bg-gray-900/20">
                <div className="space-y-4">
                  {students.length > 0 ? (
                    students.map((student) => {
                      // Find specific submission for this student and assessment
                      const submission = student.submissions?.find(
                        (s: any) => s.assessment_id === assessment.id,
                      );
                      const key = `${assessment.id}-${student.id}`;
                      const currentScore =
                        scores[key] ?? submission?.score ?? '';
                      const currentFeedback =
                        feedbacks[key] ?? submission?.feedback ?? '';

                      return (
                        <div
                          key={student.id}
                          className="flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between dark:border-gray-700 dark:bg-gray-800"
                        >
                          <div className="flex min-w-[200px] items-center gap-3">
                            <Avatar>
                              <AvatarImage src={student.avatar} />
                              <AvatarFallback>
                                {student.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-xs text-gray-500">
                                {student.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-1 flex-col gap-3">
                            <div className="flex gap-4">
                              <div className="w-32">
                                <Label
                                  htmlFor={`score-${key}`}
                                  className="text-xs"
                                >
                                  Score (/{assessment.max_score})
                                </Label>
                                <Input
                                  id={`score-${key}`}
                                  type="number"
                                  max={assessment.max_score}
                                  value={currentScore}
                                  onChange={(e) =>
                                    setScores({
                                      ...scores,
                                      [key]: e.target.value,
                                    })
                                  }
                                  placeholder="0"
                                />
                              </div>
                              <div className="flex-1">
                                <Label
                                  htmlFor={`feedback-${key}`}
                                  className="text-xs"
                                >
                                  Feedback
                                </Label>
                                <Input
                                  id={`feedback-${key}`}
                                  value={currentFeedback}
                                  onChange={(e) =>
                                    setFeedbacks({
                                      ...feedbacks,
                                      [key]: e.target.value,
                                    })
                                  }
                                  placeholder="Good job..."
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-end">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSave(
                                  assessment.id,
                                  student.id,
                                  assessment.max_score,
                                );
                              }}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save className="mr-1 h-4 w-4" />
                              Save
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-gray-500">
                      No students enrolled.
                    </p>
                  )}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    );
  }

  // STUDENT VIEW
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            My Scores
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Performance on assessments and quizzes.
          </p>
        </CardHeader>
        <CardContent>
          {assessments.length > 0 ? (
            <div className="space-y-4">
              {assessments.map((assessment) => {
                const submission = submissions.find(
                  (s) => s.assessment_id === assessment.id,
                );
                return (
                  <div
                    key={assessment.id}
                    className="flex items-center justify-between rounded-lg border p-4 dark:border-gray-700"
                  >
                    <div>
                      <h4 className="font-medium">{assessment.title}</h4>
                      <p className="text-xs text-gray-500">
                        Due:{' '}
                        {assessment.due_date
                          ? new Date(assessment.due_date).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      {submission ? (
                        <div>
                          <span className="block text-xl font-bold">
                            {submission.score ?? '-'}
                            <span className="text-sm font-normal text-gray-500">
                              /{assessment.max_score}
                            </span>
                          </span>
                          {submission.feedback && (
                            <p
                              className="mt-1 max-w-[200px] truncate text-xs text-blue-500"
                              title={submission.feedback}
                            >
                              "{submission.feedback}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground dark:border-gray-700">
              No assessments published yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
