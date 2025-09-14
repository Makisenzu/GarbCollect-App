import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import { CollectionChart, WasteChart } from '@/Pages/Admin/components/dashboard/chart';
import { FaCommentDots } from "react-icons/fa";
import { WelcomeHero } from './components/dashboard/WelcomeHero';


export default function AdminDashboard() {
    const {drivers, driverCount, sites, siteCount, driverTotal, pendingCount} = usePage().props;
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-semibold text-gray-900">
                    Dashboard
                </h2>
            }
        >
            <Head title='Dashboard'/>

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <WelcomeHero/>
                    
                    <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
                        <CollectionChart />
                        <WasteChart />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-5 mb-8 md:grid-cols-2 lg:grid-cols-4">
                        
                        <div className="p-5 bg-white rounded-lg border border-gray-100 shadow-sm">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 p-3 bg-blue-50 rounded-lg">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Active Drivers</p>
                                    <p className="text-2xl font-semibold text-gray-900">{driverCount} <span className="text-xs font-medium text-green-500 ml-1">+2 from yesterday</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 bg-white rounded-lg border border-gray-100 shadow-sm">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 p-3 bg-green-50 rounded-lg">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 11111.314 0z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Collection Sites</p>
                                    <p className="text-2xl font-semibold text-gray-900">{siteCount} <span className="text-xs font-medium text-green-500 ml-1">+5 this week</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 bg-white rounded-lg border border-gray-100 shadow-sm">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 p-3 bg-purple-50 rounded-lg">
                                    <FaCommentDots className="w-5 h-5 text-purple-600"/>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Pending Reviews</p>
                                    <p className="text-2xl font-semibold text-gray-900">{pendingCount} <span className="text-xs font-medium text-green-500 ml-1">+12% this month</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 bg-white rounded-lg border border-gray-100 shadow-sm">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 p-3 bg-amber-50 rounded-lg">
                                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Avg Rating</p>
                                    <p className="text-2xl font-semibold text-gray-900">4.8 <span className="text-xs font-medium text-green-500 ml-1">+0.2 from last month</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 mb-8">
                        <div className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-5">Recent Activity</h3>
                            <ul className="divide-y divide-gray-100">
                                <li className="py-4">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center mt-0.5">
                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-900">Collection completed at Maple Street</p>
                                            <p className="text-sm text-gray-500 mt-1">John Doe • 2 minutes ago</p>
                                        </div>
                                    </div>
                                </li>
                                <li className="py-4">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center mt-0.5">
                                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-900">New route assigned to Driver Mike</p>
                                            <p className="text-sm text-gray-500 mt-1">Mike Johnson • 15 minutes ago</p>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}