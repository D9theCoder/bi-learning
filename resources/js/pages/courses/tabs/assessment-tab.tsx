import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Course, User } from '@/types';
import { ClipboardList, FileText, Percent } from 'lucide-react';

interface AssessmentTabProps {
  course: Course & {
    instructor: User;
  };
}

// Dummy assessment data - in a real app, this would come from the backend
const getAssessmentData = () => [
  {
    id: 1,
    title: 'THEORY: GROUP PROJECT',
    assessmentCount: 0,
    weight: 50,
    description:
      'Collaborative project to build a web application using modern frameworks.',
  },
  {
    id: 2,
    title: 'THEORY: MID EXAM',
    assessmentCount: 0,
    weight: 20,
    description:
      'Mid-term examination covering fundamental concepts and theories.',
  },
  {
    id: 3,
    title: 'THEORY: FINAL EXAM',
    assessmentCount: 0,
    weight: 30,
    description:
      'Comprehensive final examination covering all course materials.',
  },
];

export function AssessmentTab({ course }: AssessmentTabProps) {
  const assessments = getAssessmentData();

  return (
    <div className="space-y-6">
      {/* Assessment Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {assessments.map((assessment) => (
          <Card
            key={assessment.id}
            className="cursor-pointer border-gray-200 transition-shadow hover:shadow-md dark:border-gray-700"
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-start gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
                <ClipboardList className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
                {assessment.title}
              </CardTitle>
              <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                {assessment.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <FileText className="h-4 w-4 text-yellow-500" />
                <span className="text-yellow-600 dark:text-yellow-400">
                  {assessment.assessmentCount} assessment
                  {assessment.assessmentCount !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Percent className="h-4 w-4 text-blue-500" />
                <Badge
                  variant="outline"
                  className="border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                >
                  {assessment.weight}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Info */}
      <Card className="bg-gray-50 dark:bg-gray-800/50">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {assessments.length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Assessment Types
                </p>
              </div>
              <div className="h-10 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">100%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Total Weight
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              All assessments are graded and contribute to your final score.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
