import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function addDrivers () {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Residents
                </h2>
            }
        >
            <Head title='Residents'/>

        </AuthenticatedLayout>
    );
}