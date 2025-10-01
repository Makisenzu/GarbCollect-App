import { CheckCircle } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Applicant() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="max-w-sm w-full bg-white rounded-xl shadow-md p-8 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-xl font-semibold text-gray-800 mb-3">
                        Application Submitted
                    </h1>
                    <p className="text-gray-600">
                        Your application has been received. Please wait for our response.
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}