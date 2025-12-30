import { DashedEmptyState } from '@/components/courses/shared';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Assessment, AssessmentSubmission } from '@/types';

interface MyScoresCardProps {
  assessments: Assessment[];
  submissions: AssessmentSubmission[];
}

export function MyScoresCard({ assessments, submissions }: MyScoresCardProps) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
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
          <DashedEmptyState message="No assessments published yet." />
        )}
      </CardContent>
    </Card>
  );
}
