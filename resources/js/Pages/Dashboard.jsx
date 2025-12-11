import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import StatCard from './Admin/components/drivers/StatCard';
import Schedule from './Driver/components/Schedule';
import TaskMap from './Driver/components/TaskMap';
import useScheduleUpdates from '@/Hooks/useScheduleUpdates';
import { useMemo, useState } from 'react';
import CalendarWidget from './Driver/components/CalendarWidget';

export default function Dashboard() {
    const { stats: initialStats, hasDriver, auth } = usePage().props;
    const { schedules, notification, setNotification } = useScheduleUpdates();
    
    const [activeTask, setActiveTask] = useState(null);
    const [isTaskActive, setIsTaskActive] = useState(false);

    const realTimeStats = useMemo(() => {
        if (!hasDriver || schedules.length === 0) {
            return initialStats;
        }

        return [
            {
                'title': 'Total Schedules',
                'value': schedules.length,
                'description': 'All your schedules'
            },
            {
                'title': 'Completed',
                'value': schedules.filter(s => s.status === 'completed').length,
                'description': 'Successful collections'
            },
            {
                'title': 'Pending',
                'value': schedules.filter(s => s.status === 'active').length,
                'description': 'Upcoming schedules'
            },
            {
                'title': 'Failed',
                'value': schedules.filter(s => s.status === 'failed').length,
                'description': 'Failed collections'
            }
        ];
    }, [schedules, hasDriver, initialStats]);

    const handleStartTask = (schedule) => {
        setActiveTask(schedule);
        setIsTaskActive(true);
    };

    const handleTaskComplete = (taskData) => {
        
        setActiveTask(null);
        setIsTaskActive(false);

        setNotification({
            type: 'success',
            title: 'Task Completed',
            message: `Collection task has been completed successfully.`
        });
    };

    const handleTaskCancel = () => {
        setActiveTask(null);
        setIsTaskActive(false);
        
        setNotification({
            type: 'info',
            title: 'Task Cancelled',
            message: 'The collection task has been cancelled.'
        });
    };

    const handleLocationSelect = (location) => {
        console.log('Location selected:', location);
    };

    const handleEditSite = (site) => {
        console.log('Edit site:', site);
    };

    const handleDeleteSite = (site) => {
        console.log('Delete site:', site);
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {isTaskActive ? 'Site Routes' : 'Driver Dashboard'}
                </h2>
            }
        >
            <Head title={isTaskActive ? 'Active Task' : 'Driver Dashboard'} />

            {notification && (
                <div className="fixed top-4 right-4 z-50 max-w-sm w-full animate-in slide-in-from-right duration-300">
                    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                        <div className="p-4">
                            <div className="flex items-start gap-3">
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                    notification.type === 'success' ? 'bg-green-100' :
                                    notification.type === 'error' ? 'bg-red-100' :
                                    'bg-blue-100'
                                }`}>
                                    {notification.type === 'success' && (
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                    {notification.type === 'error' && (
                                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                    {notification.type === 'info' && (
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {notification.title}
                                    </p>
                                    <p className="mt-1 text-sm text-gray-600">
                                        {notification.message}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setNotification(null)}
                                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isTaskActive && activeTask ? (
                <div className="fixed inset-0 z-40 lg:left-64 lg:top-16 top-16 bg-gray-50">
                    <TaskMap
                        mapboxKey={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
                        onLocationSelect={handleLocationSelect}
                        refreshTrigger={activeTask.id}
                        onEditSite={handleEditSite}
                        onDeleteSite={handleDeleteSite}
                        scheduleId={activeTask.id}
                        onTaskComplete={handleTaskComplete}
                        onTaskCancel={handleTaskCancel}
                    />
                </div>
            ) : (
                <div className="py-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Stats Section */}
                        <div className="mb-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {realTimeStats && Array.isArray(realTimeStats) && realTimeStats.map((stat, index) => (
                                    <StatCard 
                                        key={index}
                                        title={stat.title}
                                        value={stat.value}
                                        description={stat.description}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Calendar and Schedule Section */}
                        {hasDriver ? (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Calendar Widget */}
                                <div className="lg:col-span-1">
                                    <CalendarWidget schedules={schedules} />
                                </div>

                                {/* Schedule List */}
                                <div className="lg:col-span-2">
                                    <Schedule 
                                        drivers={[]}
                                        barangays={[]}
                                        schedules={schedules}
                                        onStartTask={handleStartTask}
                                        mapboxKey={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Complete Your Driver Profile
                                    </h3>
                                    <p className="text-gray-500 mb-6">
                                        To view and manage schedules, please complete your driver profile first.
                                    </p>
                                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                                        Complete Profile
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}