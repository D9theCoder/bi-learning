import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Assessment } from '@/types';

interface GradebookTutorMatrixProps {
  students: any[];
  assessments: Assessment[];
}

export function GradebookTutorMatrix({
  students,
  assessments,
}: GradebookTutorMatrixProps) {
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
    <Card className="gap-0 overflow-hidden py-0">
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr className="border-b">
              <th className="sticky left-0 z-10 bg-gray-50 p-4 font-medium dark:bg-gray-800">
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
                let totalScore = 0;
                let maxTotal = 0;

                return (
                  <tr
                    key={student.id}
                    className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="sticky left-0 bg-white p-4 dark:bg-gray-900">
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
