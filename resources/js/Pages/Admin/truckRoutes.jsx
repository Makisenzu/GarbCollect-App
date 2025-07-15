import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function truckRoutes () {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Routes
                </h2>
            }
        >
            <Head title='Routes'/>

        </AuthenticatedLayout>
    );
}