import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Dashboard from '@/Pages/Admin/components/drivers/Dashboard';

export default function Drivers() {
    return (
        <AuthenticatedLayout header="Drivers">
            <Head title='Drivers'/>
            <Dashboard />
        </AuthenticatedLayout>
    );
}