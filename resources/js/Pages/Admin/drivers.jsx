import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Dashboard from '@/Pages/Admin/components/drivers/Dashboard';

export default function Drivers() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Truck Drivers
                </h2>
            }
        >
            <Head title='Drivers'/>
            <Dashboard />
        </AuthenticatedLayout>
    );
}