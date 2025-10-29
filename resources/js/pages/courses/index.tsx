import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { courses } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'My Courses',
        href: courses().url,
    },
];

export default function CoursesPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Courses" />

            <div className="flex flex-1 flex-col gap-6 overflow-x-auto p-4 lg:p-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <BookOpen className="size-8 text-blue-500" />
                        <h1 className="text-3xl font-bold">My Courses</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Explore and manage your enrolled courses.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Coming Soon</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Your courses list is being prepared. Check back soon!
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
