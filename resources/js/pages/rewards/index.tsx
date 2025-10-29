import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { rewards } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Gift } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Rewards',
        href: rewards().url,
    },
];

export default function RewardsPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rewards" />

            <div className="flex flex-1 flex-col gap-6 overflow-x-auto p-4 lg:p-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Gift className="size-8 text-pink-500" />
                        <h1 className="text-3xl font-bold">Rewards</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Claim your rewards and redeem your hard-earned points.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Coming Soon</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Your rewards collection is being prepared. Check back soon!
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
