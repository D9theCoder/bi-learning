import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Course, User } from '@/types';
import {
  Award,
  CheckCircle,
  Clock,
  Star,
  Target,
  TrendingUp,
} from 'lucide-react';

interface ScoringTabProps {
  course: Course & {
    instructor: User;
  };
  isEnrolled: boolean;
}

// Dummy scoring data - in a real app, this would come from the backend
const getScoringData = (isEnrolled: boolean) => {
  if (!isEnrolled) {
    return null;
  }

  return {
    overallGrade: 'A',
    overallScore: 87.5,
    gradePointAverage: 3.75,

    components: [
      {
        id: 1,
        name: 'Group Project',
        weight: 50,
        score: 90,
        maxScore: 100,
        status: 'graded',
        gradedAt: '2025-11-15',
      },
      {
        id: 2,
        name: 'Mid Exam',
        weight: 20,
        score: 82,
        maxScore: 100,
        status: 'graded',
        gradedAt: '2025-10-20',
      },
      {
        id: 3,
        name: 'Final Exam',
        weight: 30,
        score: null,
        maxScore: 100,
        status: 'pending',
        gradedAt: null,
      },
    ],

    rank: {
      position: 5,
      totalStudents: 45,
      percentile: 89,
    },

    attendance: {
      attended: 12,
      total: 14,
      percentage: 85.7,
    },
  };
};

const getGradeColor = (grade: string) => {
  const colors: Record<string, string> = {
    A: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'A-': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'B+': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    B: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'B-': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'C+': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    C: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    D: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    F: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    colors[grade] ||
    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  );
};

export function ScoringTab({ course, isEnrolled }: ScoringTabProps) {
  const scoring = getScoringData(isEnrolled);

  if (!isEnrolled || !scoring) {
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

  return (
    <div className="space-y-6">
      {/* Overall Grade Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardContent className="py-6 text-center">
            <div
              className={`mb-3 inline-flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold ${getGradeColor(scoring.overallGrade)}`}
            >
              {scoring.overallGrade}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Overall Grade
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardContent className="py-6 text-center">
            <TrendingUp className="mx-auto mb-2 h-8 w-8 text-blue-500" />
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {scoring.overallScore}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Overall Score
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardContent className="py-6 text-center">
            <Star className="mx-auto mb-2 h-8 w-8 text-yellow-500" />
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {scoring.gradePointAverage}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">GPA</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardContent className="py-6 text-center">
            <Target className="mx-auto mb-2 h-8 w-8 text-green-500" />
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              #{scoring.rank.position}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              of {scoring.rank.totalStudents} students
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Component Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Score Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scoring.components.map((component) => (
              <div key={component.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {component.name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {component.weight}%
                    </Badge>
                    {component.status === 'graded' ? (
                      <Badge className="border-green-200 bg-green-100 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Graded
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    {component.score !== null ? (
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {component.score}/{component.maxScore}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                </div>
                <Progress
                  value={
                    component.score !== null
                      ? (component.score / component.maxScore) * 100
                      : 0
                  }
                  className="h-2"
                />
                {component.gradedAt && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Graded on{' '}
                    {new Date(component.gradedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Class Rank
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-yellow-600">
                  Top {100 - scoring.rank.percentile}%
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  You're in the top {100 - scoring.rank.percentile}% of your
                  class
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Rank #{scoring.rank.position}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  out of {scoring.rank.totalStudents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-green-600">
                  {scoring.attendance.percentage.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Attendance rate
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {scoring.attendance.attended}/{scoring.attendance.total}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Sessions attended
                </p>
              </div>
            </div>
            <Progress
              value={scoring.attendance.percentage}
              className="mt-3 h-2"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
