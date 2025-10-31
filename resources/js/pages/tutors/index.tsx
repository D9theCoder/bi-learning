import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import { TutorCard } from '@/components/tutors/tutor-card';
import AppLayout from '@/layouts/app-layout';
import { tutors as tutorsRoute } from '@/routes';
import type { BreadcrumbItem, TutorsPageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Tutors', href: tutorsRoute().url },
];

export default function TutorsPage({ tutors }: TutorsPageProps) {
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
