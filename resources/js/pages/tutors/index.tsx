import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import { TutorCard } from '@/components/tutors/tutor-card';
import AppLayout from '@/layouts/app-layout';
import { tutors as tutorsRoute } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Tutors', href: tutorsRoute().url },
];

// ! Removed TutorsPageProps

// ! Dummy Data
const dummyTutors = {
  data: [
    {
      id: 1,
      name: 'John Doe',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe',
      cohort: {
        id: 1,
        name: 'Web Dev Cohort 1',
      },
      expertise: ['React', 'TypeScript', 'Node.js'],
      rating: 4.8,
    },
    {
      id: 2,
      name: 'Jane Smith',
      avatar: 'https://ui-avatars.com/api/?name=Jane+Smith',
      cohort: {
        id: 2,
        name: 'Data Science Cohort 1',
      },
      expertise: ['Python', 'Machine Learning', 'SQL'],
      rating: 4.9,
    },
  ],
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 2,
};

// ! Modified component to use dummy data
export default function TutorsPage() {
  const tutors = dummyTutors;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Tutors" />

      <div className="flex flex-1 flex-col gap-6 overflow-x-auto p-4 lg:p-6">
        <PageHeader
          icon={Users}
          title="Tutors"
          description="Connect with your tutors and get help with your learning."
          iconClassName="text-green-500"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tutors.data.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </div>

        {tutors.data.length === 0 && <EmptyState message="No tutors found." />}
      </div>
    </AppLayout>
  );
}
