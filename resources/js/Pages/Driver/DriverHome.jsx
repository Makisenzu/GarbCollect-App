import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import CalendarForm from '@/Components/CalendarForm';

export default function DriverHome() {
    // Static schedule data
    const scheduleData = {
        '2023-11-15': [
            {
                id: '1',
                address: '123 Main St',
                time: '9:00 AM',
                status: 'pending',
                type: 'residential'
            },
            {
                id: '2',
                address: '456 Oak Ave',
                time: '2:30 PM',
                status: 'completed',
                type: 'commercial'
            }
        ],
        '2023-11-16': [
            {
                id: '3',
                address: '789 Pine Rd',
                time: '10:15 AM',
                status: 'overdue',
                type: 'recycling'
            }
        ],
        '2023-11-17': [
            {
                id: '4',
                address: '101 Maple Ln',
                time: '8:45 AM',
                status: 'pending',
                type: 'residential'
            },
            {
                id: '5',
                address: '202 Birch Blvd',
                time: '11:30 AM',
                status: 'pending',
                type: 'commercial'
            },
            {
                id: '6',
                address: '303 Cedar Ct',
                time: '3:00 PM',
                status: 'pending',
                type: 'recycling'
            }
        ],
        '2023-11-20': [
            {
                id: '7',
                address: '404 Spruce St',
                time: '9:30 AM',
                status: 'completed',
                type: 'residential'
            },
            {
                id: '8',
                address: '505 Willow Way',
                time: '1:15 PM',
                status: 'completed',
                type: 'commercial'
            }
        ],
        '2023-11-21': [
            {
                id: '9',
                address: '606 Elm Dr',
                time: '10:00 AM',
                status: 'overdue',
                type: 'residential'
            }
        ],
        '2023-11-22': [
            {
                id: '10',
                address: '707 Redwood Rd',
                time: '8:00 AM',
                status: 'pending',
                type: 'commercial'
            },
            {
                id: '11',
                address: '808 Sequoia St',
                time: '2:00 PM',
                status: 'pending',
                type: 'recycling'
            }
        ]
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Driver Dashboard
                </h2>
            }
        >
            <Head title="Driver Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <CalendarForm scheduleData={scheduleData} />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}