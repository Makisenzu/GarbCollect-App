import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function drivers () {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Truck Drivers
                </h2>
            }
        >
            <Head title='Truck Drivers'/>

        </AuthenticatedLayout>
    );
}