import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { CollectionChart, WasteChart } from '@/Pages/Admin/components/dashboard/chart';
import { FaCommentDots } from "react-icons/fa";
import { WelcomeHero } from './components/dashboard/WelcomeHero';

export default function AdminDashboard() {
    const {drivers, driverCount, sites, siteCount, driverTotal, pendingCount, schedules, chartData, garbageTypes, averageRating, todaysCollections, inProgress, completedToday} = usePage().props;
    
    return (
        <AuthenticatedLayout header="Dashboard">
            <Head title='Dashboard'/>

            <div className="py-6">
                <div className="mx-auto max-w-7xl">
                    <WelcomeHero 
                        schedules={schedules} 
                        todaysCollections={todaysCollections}
                        inProgress={inProgress}
                        completedToday={completedToday}
                    />
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Drivers</p>
                                    <p className="text-3xl font-semibold text-gray-900 mt-2">{driverCount}</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Collection Sites</p>
                                    <p className="text-3xl font-semibold text-gray-900 mt-2">{siteCount}</p>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                                    <p className="text-3xl font-semibold text-gray-900 mt-2">{pendingCount}</p>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-lg">
                                    <FaCommentDots className="w-6 h-6 text-purple-600"/>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Average Rating</p>
                                    <p className="text-3xl font-semibold text-gray-900 mt-2">
                                        {averageRating > 0 ? averageRating : 'N/A'}
                                    </p>
                                </div>
                                <div className="p-3 bg-amber-50 rounded-lg">
                                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <CollectionChart chartData={chartData} />
                        <WasteChart chartData={chartData} garbageTypes={garbageTypes} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}