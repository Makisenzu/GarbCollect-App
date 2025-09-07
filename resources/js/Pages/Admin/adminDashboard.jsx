import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import { CollectionChart, WasteChart } from '@/Pages/Admin/components/dashboard/chart';

export default function AdminDashboard() {
    const {drivers, driverCount, sites, siteCount, driverTotal} = usePage().props;
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title='Dashboard'/>

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
                        
                        <div className="p-6 bg-white rounded-lg shadow">
                            <div className="flex items-center justify-between">
                                <div className="mr-4">
                                    <p className="text-sm font-medium text-gray-600">Active Drivers</p>
                                    <p className="text-2xl font-semibold text-gray-900">{driverCount} <span className="text-sm text-green-600">+2 from yesterday</span></p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-white rounded-lg shadow">
                            <div className="flex items-center justify-between">
                                <div className="mr-4">
                                    <p className="text-sm font-medium text-gray-600">Collection Sites</p>
                                    <p className="text-2xl font-semibold text-gray-900">{siteCount} <span className="text-sm text-green-600">+5 this week</span></p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-white rounded-lg shadow">
                            <div className="flex items-center justify-between">
                                <div className="mr-4">
                                    <p className="text-sm font-medium text-gray-600">Registered Driver</p>
                                    <p className="text-2xl font-semibold text-gray-900">{driverTotal} <span className="text-sm text-green-600">+12% this month</span></p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-white rounded-lg shadow">
                            <div className="flex items-center justify-between">
                                <div className="mr-4">
                                    <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                                    <p className="text-2xl font-semibold text-gray-900">4.8 <span className="text-sm text-green-600">+0.2 from last month</span></p>
                                </div>
                                <div className="p-3 bg-yellow-100 rounded-full">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    

                    <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-1">

                    <div className="p-6 bg-white rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                        <ul className="divide-y divide-gray-200">
                            <li className="py-3">
                                <div className="flex space-x-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">Collection completed at Maple Street</p>
                                        <p className="text-sm text-gray-500">John Doe • 2 minutes ago</p>
                                    </div>
                                </div>
                            </li>
                            <li className="py-3">
                                <div className="flex space-x-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">New route assigned to Driver Mike</p>
                                        <p className="text-sm text-gray-500">Mike Johnson • 15 minutes ago</p>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
                    <CollectionChart />
                    <WasteChart />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}