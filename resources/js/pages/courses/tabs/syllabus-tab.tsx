import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Course, Lesson, User } from '@/types';
import {
  BookOpen,
  BookText,
  CheckCircle,
  ClipboardList,
  GraduationCap,
  Target,
} from 'lucide-react';

interface SyllabusTabProps {
  course: Course & {
    instructor: User;
    lessons: Lesson[];
  };
}

// Dummy syllabus data - in a real app, this would come from the backend
const getSyllabusData = (course: Course) => ({
  courseDescription: `${course.description || 'This course provides comprehensive coverage of the subject matter, enabling students to develop both theoretical understanding and practical skills. Students will engage with real-world examples and hands-on exercises to reinforce learning objectives.'}`,

  studentOutcomes: [
    'Able to communicate effectively in a variety of professional contexts',
    'Able to recognize professional responsibilities and make informed judgments in computing practice based on legal and ethical principles',
    'Able to function effectively as a member or leader of a team engaged in activities appropriate to computer science',
    'Able to apply computer science theory and software development fundamentals to produce computing-based solutions',
  ],

  learningOutcomes: [
    {
      code: 'LO1',
      level: 'C2',
      type: 'Comprehension',
      description: 'Describe concept of web programming',
    },
    {
      code: 'LO2',
      level: 'C3',
      type: 'Application',
      description: 'Design web-based applications with structured approach',
    },
    {
      code: 'LO3',
      level: 'C4',
      type: 'Knowledge',
      description:
        'Identify a proper web programming technic to build web based application',
    },
    {
      code: 'LO4',
      level: 'C5',
      type: 'Synthesis',
      description:
        'Create web-based applications using PHP Framework to solve problems that occur in the IT field',
    },
  ],

  evaluations: [
    {
      activity: 'THEORY: GROUP PROJECT',
      weight: 50,
      learningOutcomes: [1, 2, 3, 4],
    },
    { activity: 'THEORY: MID EXAM', weight: 20, learningOutcomes: [1, 2] },
    {
      activity: 'THEORY: FINAL EXAM',
      weight: 30,
      learningOutcomes: [1, 2, 3, 4],
    },
  ],

  teachingStrategies: [
    'Brainstorming',
    'Case Study',
    'Project-Based Learning',
    'Collaborative Learning',
    'Lectures and Demonstrations',
  ],

  textbooks: [
    {
      title: 'Web Development with PHP and Laravel',
      author: 'Matt Stauffer',
      year: 2023,
    },
    {
      title: 'Modern JavaScript for Web Developers',
      author: 'Nicholas Zakas',
      year: 2022,
    },
    {
      title: 'Full-Stack Web Development',
      author: 'Maximilian Schwarzmüller',
      year: 2023,
    },
  ],
});

export function SyllabusTab({ course }: SyllabusTabProps) {
  const syllabus = getSyllabusData(course);

  return (
    <div className="space-y-6">
      {/* Sub-tabs for syllabus sections */}
      <Tabs defaultValue="description" className="w-full">
        <div className="scrollbar-hide overflow-x-auto pb-2">
          <TabsList className="inline-flex w-max gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
            <TabsTrigger
              value="description"
              className="rounded-md px-3 py-1.5 text-xs data-[state=active]:bg-white data-[state=active]:text-yellow-600 sm:text-sm dark:data-[state=active]:bg-gray-700"
            >
              <BookOpen className="mr-1.5 hidden h-4 w-4 sm:inline" />
              Course Description
            </TabsTrigger>
            <TabsTrigger
              value="outcomes"
              className="rounded-md px-3 py-1.5 text-xs data-[state=active]:bg-white data-[state=active]:text-yellow-600 sm:text-sm dark:data-[state=active]:bg-gray-700"
            >
              <Target className="mr-1.5 hidden h-4 w-4 sm:inline" />
              Student Outcomes/Competency Goals
            </TabsTrigger>
            <TabsTrigger
              value="learning"
              className="rounded-md px-3 py-1.5 text-xs data-[state=active]:bg-white data-[state=active]:text-yellow-600 sm:text-sm dark:data-[state=active]:bg-gray-700"
            >
              <GraduationCap className="mr-1.5 hidden h-4 w-4 sm:inline" />
              Learning Outcomes
            </TabsTrigger>
            <TabsTrigger
              value="evaluation"
              className="rounded-md px-3 py-1.5 text-xs data-[state=active]:bg-white data-[state=active]:text-yellow-600 sm:text-sm dark:data-[state=active]:bg-gray-700"
            >
              <ClipboardList className="mr-1.5 hidden h-4 w-4 sm:inline" />
              Evaluation
            </TabsTrigger>
            <TabsTrigger
              value="strategies"
              className="rounded-md px-3 py-1.5 text-xs data-[state=active]:bg-white data-[state=active]:text-yellow-600 sm:text-sm dark:data-[state=active]:bg-gray-700"
            >
              <CheckCircle className="mr-1.5 hidden h-4 w-4 sm:inline" />
              Teaching & Learning Strategies
            </TabsTrigger>
            <TabsTrigger
              value="textbooks"
              className="rounded-md px-3 py-1.5 text-xs data-[state=active]:bg-white data-[state=active]:text-yellow-600 sm:text-sm dark:data-[state=active]:bg-gray-700"
            >
              <BookText className="mr-1.5 hidden h-4 w-4 sm:inline" />
              Textbooks
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Course Description */}
        <TabsContent value="description" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Course Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-gray-600 dark:text-gray-400">
                {syllabus.courseDescription}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student Outcomes */}
        <TabsContent value="outcomes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Student Outcomes/Competency Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {syllabus.studentOutcomes.map((outcome, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 text-sm font-medium text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                      {index + 1}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {outcome}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Outcomes */}
        <TabsContent value="learning" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Learning Outcomes
              </CardTitle>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                On successful completion of this course, student will be able
                to:
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {syllabus.learningOutcomes.map((lo, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-yellow-200 bg-yellow-50 text-yellow-600 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                      >
                        {lo.code}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                      >
                        {lo.level}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-green-200 bg-green-50 text-green-600 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
                      >
                        {lo.type}
                      </Badge>
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">
                      {lo.description}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evaluation */}
        <TabsContent value="evaluation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Evaluation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                        Activity
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-gray-100">
                        Weight
                      </th>
                      {[1, 2, 3, 4].map((num) => (
                        <th
                          key={num}
                          className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-gray-100"
                        >
                          {num}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {syllabus.evaluations.map((evaluation, index) => (
                      <tr
                        key={index}
                        className="border-b last:border-0 dark:border-gray-700"
                      >
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                          {evaluation.activity}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">
                          {evaluation.weight}%
                        </td>
                        {[1, 2, 3, 4].map((num) => (
                          <td key={num} className="px-4 py-3 text-center">
                            {evaluation.learningOutcomes.includes(num) ? (
                              <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                            ) : (
                              <span className="text-gray-300 dark:text-gray-600">
                                —
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-semibold dark:bg-gray-800/50">
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                        TOTAL
                      </td>
                      <td className="px-4 py-3 text-center text-gray-900 dark:text-gray-100">
                        100%
                      </td>
                      <td colSpan={4}></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teaching & Learning Strategies */}
        <TabsContent value="strategies" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Teaching & Learning Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {syllabus.teachingStrategies.map((strategy, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
                  >
                    <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                    {strategy}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Textbooks */}
        <TabsContent value="textbooks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Textbooks & References
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {syllabus.textbooks.map((book, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <BookText className="mt-0.5 h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {book.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        by {book.author} ({book.year})
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
