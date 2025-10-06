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
        console.log('Task completed with data:', taskData);
        
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

    console.log('Current driver ID:', auth?.user?.driver?.id);

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

            {isTaskActive && activeTask ? (
                <div className="fixed inset-0 z-40 lg:left-64 lg:top-16 top-16">
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
                <div className="py-6">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="mb-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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

                        <div className="mb-8">
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <CalendarWidget schedules={schedules} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                {hasDriver ? (
                                    <Schedule 
                                        drivers={[]}
                                        barangays={[]}
                                        schedules={schedules}
                                        onStartTask={handleStartTask}
                                        mapboxKey={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
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
            )}
        </AuthenticatedLayout>
    );
}