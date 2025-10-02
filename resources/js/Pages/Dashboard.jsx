import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import StatCard from './Admin/components/drivers/StatCard';
import Schedule from './Driver/components/Schedule';
import useScheduleUpdates from '@/Hooks/useScheduleUpdates';

export default function Dashboard() {
    const { stats, hasDriver, auth } = usePage().props;
    const { schedules, notification, setNotification } = useScheduleUpdates();

    console.log('Current driver ID:', auth?.user?.driver?.id);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Driver Dashboard
                </h2>
            }
        >
            <Head title="Driver Dashboard" />

            {notification && (
                <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border border-green-200">
                    <div className="p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                    {notification.title}
                                </p>
                                <p className="mt-1 text-sm text-gray-600">
                                    {notification.message}
                                </p>
                                {/* {notification.schedule && (
                                    <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                        <div><strong>Barangay:</strong> {notification.schedule.barangay?.baranggay_name}</div>
                                        <div><strong>Date:</strong> {notification.schedule.collection_date}</div>
                                        <div><strong>Time:</strong> {notification.schedule.collection_time}</div>
                                    </div>
                                )} */}
                            </div>
                            <button
                                onClick={() => setNotification(null)}
                                className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {stats && Array.isArray(stats) && stats.map((stat, index) => (
                                <StatCard 
                                    key={index}
                                    title={stat.title}
                                    value={stat.value}
                                    description={stat.description}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {hasDriver ? (
                                <Schedule 
                                    drivers={[]}
                                    barangays={[]}
                                    schedules={schedules}
                                />
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">Complete your driver profile to view schedules.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}