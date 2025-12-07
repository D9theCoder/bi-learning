import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Course, User } from '@/types';
import { Scale } from 'lucide-react';

interface RubricTabProps {
  course: Course & {
    instructor: User;
  };
}

// Dummy rubric data
const getRubricData = () => ({
  criteria: [
    {
      id: 1,
      name: 'Technical Implementation',
      weight: 30,
      levels: [
        {
          score: 4,
          label: 'Excellent',
          description:
            'Code is well-structured, efficient, and follows best practices',
        },
        {
          score: 3,
          label: 'Good',
          description: 'Code works correctly with minor improvements possible',
        },
        {
          score: 2,
          label: 'Satisfactory',
          description: 'Code works but has notable issues',
        },
        {
          score: 1,
          label: 'Needs Improvement',
          description: 'Code has significant problems',
        },
      ],
    },
    {
      id: 2,
      name: 'Documentation',
      weight: 20,
      levels: [
        {
          score: 4,
          label: 'Excellent',
          description: 'Comprehensive documentation with clear explanations',
        },
        {
          score: 3,
          label: 'Good',
          description: 'Adequate documentation covering key aspects',
        },
        {
          score: 2,
          label: 'Satisfactory',
          description: 'Basic documentation present',
        },
        {
          score: 1,
          label: 'Needs Improvement',
          description: 'Documentation is missing or unclear',
        },
      ],
    },
    {
      id: 3,
      name: 'Problem Solving',
      weight: 25,
      levels: [
        {
          score: 4,
          label: 'Excellent',
          description: 'Creative and efficient problem-solving approach',
        },
        {
          score: 3,
          label: 'Good',
          description: 'Solid problem-solving with good logic',
        },
        {
          score: 2,
          label: 'Satisfactory',
          description: 'Basic problem-solving skills demonstrated',
        },
        {
          score: 1,
          label: 'Needs Improvement',
          description: 'Limited problem-solving approach',
        },
      ],
    },
    {
      id: 4,
      name: 'Presentation',
      weight: 25,
      levels: [
        {
          score: 4,
          label: 'Excellent',
          description: 'Clear, engaging, and well-organized presentation',
        },
        {
          score: 3,
          label: 'Good',
          description: 'Good presentation with minor areas for improvement',
        },
        {
          score: 2,
          label: 'Satisfactory',
          description: 'Adequate presentation',
        },
        {
          score: 1,
          label: 'Needs Improvement',
          description: 'Presentation needs significant improvement',
        },
      ],
    },
  ],
});

export function RubricTab({ course }: RubricTabProps) {
  const rubric = getRubricData();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <Scale className="h-5 w-5 text-yellow-600" />
            Assessment Rubric
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Grading criteria and scoring levels for course assessments.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                    Criteria
                  </th>
                  <th className="w-20 px-4 py-3 text-center font-semibold text-gray-900 dark:text-gray-100">
                    Weight
                  </th>
                  <th className="px-2 py-3 text-center font-semibold text-green-600">
                    4
                  </th>
                  <th className="px-2 py-3 text-center font-semibold text-blue-600">
                    3
                  </th>
                  <th className="px-2 py-3 text-center font-semibold text-yellow-600">
                    2
                  </th>
                  <th className="px-2 py-3 text-center font-semibold text-red-600">
                    1
                  </th>
                </tr>
              </thead>
              <tbody>
                {rubric.criteria.map((criterion) => (
                  <tr
                    key={criterion.id}
                    className="border-b last:border-0 dark:border-gray-700"
                  >
                    <td className="px-4 py-4">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {criterion.name}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Badge
                        variant="outline"
                        className="bg-gray-100 dark:bg-gray-800"
                      >
                        {criterion.weight}%
                      </Badge>
                    </td>
                    {criterion.levels.map((level) => {
                      const bgColors: Record<number, string> = {
                        4: 'bg-green-50 dark:bg-green-900/20',
                        3: 'bg-blue-50 dark:bg-blue-900/20',
                        2: 'bg-yellow-50 dark:bg-yellow-900/20',
                        1: 'bg-red-50 dark:bg-red-900/20',
                      };
                      const textColors: Record<number, string> = {
                        4: 'text-green-700 dark:text-green-400',
                        3: 'text-blue-700 dark:text-blue-400',
                        2: 'text-yellow-700 dark:text-yellow-400',
                        1: 'text-red-700 dark:text-red-400',
                      };

                      return (
                        <td
                          key={level.score}
                          className={`px-2 py-4 text-center ${bgColors[level.score]}`}
                        >
                          <div className="space-y-1">
                            <p
                              className={`text-xs font-medium ${textColors[level.score]}`}
                            >
                              {level.label}
                            </p>
                            <p className="hidden text-xs text-gray-500 lg:block dark:text-gray-400">
                              {level.description}
                            </p>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Score Legend */}
      <Card className="bg-gray-50 dark:bg-gray-800/50">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Score Legend:
            </span>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-green-500"></span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                4 = Excellent (90-100%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-blue-500"></span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                3 = Good (75-89%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-yellow-500"></span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                2 = Satisfactory (60-74%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-red-500"></span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                1 = Needs Improvement (&lt;60%)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
