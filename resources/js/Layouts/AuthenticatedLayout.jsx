import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { GrMapLocation } from "react-icons/gr";
import { FaPeopleGroup } from "react-icons/fa6";
import { FaTruckMoving } from "react-icons/fa";
import { SlGraph } from "react-icons/sl";
import { FaUser } from "react-icons/fa6";
import { FaUserGear } from "react-icons/fa6";
import { TbLogout } from "react-icons/tb";

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const getDashboardRoute = () => {
        switch(user.roles) {
            case 'admin':
                return route('admin.dashboard');
            case 'driver':
                return route('driver.dashboard');
            default:
                return route('dashboard');
        }
    };

    const toggleMobileSidebar = () => {
        setMobileSidebarOpen(!mobileSidebarOpen);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <div className="hidden md:flex md:flex-col w-64 bg-white shadow-lg">
                <div className="flex items-center p-4 border-b border-gray-200">
                    <div className="h-10 w-10 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold mr-3">
                        TL
                    </div>
                    <span className="text-xl font-semibold">TrashLocator</span>
                </div>

                <div className="flex flex-col flex-1 overflow-y-auto">
                    <nav className="flex-1 p-4">
                        <div className="space-y-2">
                            {user.roles === 'admin' && (
                                <>
                                    <NavLink
                                        href={route('admin.dashboard')}
                                        active={route().current('admin.dashboard')}
                                        className="flex items-center w-full px-4 py-3 rounded-md transition-colors duration-200"
                                    >
                                        <div className="w-6 h-6 flex items-center justify-center mr-3">
                                            <SlGraph size={18} />
                                        </div>
                                        Dashboard
                                    </NavLink>

                                    <NavLink
                                        href={route('admin.drivers')}
                                        active={route().current('admin.drivers')}
                                        className="flex items-center w-full px-4 py-3 rounded-md transition-colors duration-200"
                                    >
                                        <div className="w-6 h-6 flex items-center justify-center mr-3">
                                            <FaTruckMoving size={16}/>
                                        </div>
                                        Drivers
                                    </NavLink>

                                    <NavLink
                                        href={route('admin.residents')}
                                        active={route().current('admin.residents')}
                                        className="flex items-center w-full px-4 py-3 rounded-md transition-colors duration-200"
                                    >
                                        <div className="w-6 h-6 flex items-center justify-center mr-3">
                                            <FaPeopleGroup size={16} />
                                        </div>
                                        Residents
                                    </NavLink>

                                    <NavLink
                                        href={route('admin.truckRoutes')}
                                        active={route().current('admin.truckRoutes')}
                                        className="flex items-center w-full px-4 py-3 rounded-md transition-colors duration-200"
                                    >
                                        <div className="w-6 h-6 flex items-center justify-center mr-3">
                                            <GrMapLocation size={18}/>
                                        </div>
                                        Sites
                                    </NavLink>
                                </>
                            )}

                            {user.roles === 'user' && (
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                    className="flex items-center w-full px-4 py-3 rounded-md transition-colors duration-200"
                                >
                                    <div className="w-6 h-6 flex items-center justify-center mr-3">
                                        <SlGraph size={18} />
                                    </div>
                                    Dashboard
                                </NavLink>
                            )}
                        </div>
                    </nav>

                    <div className="border-t border-gray-200 my-2"></div>

                    <div className="p-4">
                        <div className="relative">
                            <div className="flex items-center px-3 py-2">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <FaUser size={14} className="text-blue-600" />
                                    </div>
                                </div>
                                <div className="ms-3 flex-1">
                                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                    <p className="text-xs text-gray-500 capitalize">{user.roles}</p>
                                </div>
                            </div>
                            
                            <div className="mt-3 space-y-1">
                                <Dropdown.Link 
                                    href={route('profile.edit')} 
                                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                                >
                                    <FaUserGear className="mr-2" size={14} />
                                    Profile
                                </Dropdown.Link>
                                <Dropdown.Link 
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md w-full text-left"
                                >
                                    <TbLogout className="mr-2" size={14}/>
                                    Log Out
                                </Dropdown.Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {mobileSidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                ></div>
            )}

            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:hidden ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center">
                        <div className="h-10 w-10 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold mr-3">
                            TL
                        </div>
                        <span className="text-xl font-semibold">TrashLocator</span>
                    </div>
                    <button 
                        onClick={() => setMobileSidebarOpen(false)}
                        className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex flex-col flex-1 overflow-y-auto">
                    <nav className="flex-1 p-4">
                        <div className="space-y-2">
                            {user.roles === 'admin' && (
                                <>
                                    <ResponsiveNavLink
                                        href={route('admin.dashboard')}
                                        active={route().current('admin.dashboard')}
                                        className="flex items-center w-full px-4 py-3 rounded-md"
                                    >
                                        <div className="w-6 h-6 flex items-center justify-center mr-3">
                                            <SlGraph size={18} />
                                        </div>
                                        Dashboard
                                    </ResponsiveNavLink>

                                    <ResponsiveNavLink
                                        href={route('admin.drivers')}
                                        active={route().current('admin.drivers')}
                                        className="flex items-center w-full px-4 py-3 rounded-md"
                                    >
                                        <div className="w-6 h-6 flex items-center justify-center mr-3">
                                            <FaTruckMoving size={16}/>
                                        </div>
                                        Drivers
                                    </ResponsiveNavLink>

                                    <ResponsiveNavLink
                                        href={route('admin.residents')}
                                        active={route().current('admin.residents')}
                                        className="flex items-center w-full px-4 py-3 rounded-md"
                                    >
                                        <div className="w-6 h-6 flex items-center justify-center mr-3">
                                            <FaPeopleGroup size={16} />
                                        </div>
                                        Residents
                                    </ResponsiveNavLink>

                                    <ResponsiveNavLink
                                        href={route('admin.truckRoutes')}
                                        active={route().current('admin.truckRoutes')}
                                        className="flex items-center w-full px-4 py-3 rounded-md"
                                    >
                                        <div className="w-6 h-6 flex items-center justify-center mr-3">
                                            <GrMapLocation size={18}/>
                                        </div>
                                        Sites
                                    </ResponsiveNavLink>
                                </>
                            )}

                            {user.roles === 'user' && (
                                <ResponsiveNavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                    className="flex items-center w-full px-4 py-3 rounded-md"
                                >
                                    <div className="w-6 h-6 flex items-center justify-center mr-3">
                                        <SlGraph size={18} />
                                    </div>
                                    Dashboard
                                </ResponsiveNavLink>
                            )}
                        </div>
                    </nav>

                    <div className="border-t border-gray-200 my-2"></div>


                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm z-10">
                    <div className="flex items-center justify-between mx-auto px-4 sm:px-6 lg:px-8 h-16">
                        <div className="flex items-center">
                            <button 
                                onClick={toggleMobileSidebar}
                                className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            {header && (
                                <div className="ml-2">

                                    {typeof header === 'string' ? (
                                        <h1 className="text-xl font-semibold text-gray-900">{header}</h1>
                                    ) : (
                                        <div className="text-xl font-semibold text-gray-900">{header}</div>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        <div className="md:hidden">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="inline-flex rounded-md">
                                        <button
                                            type="button"
                                            className="inline-flex items-center p-2 border border-transparent rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
                                        >
                                            <FaUser size={20} />
                                        </button>
                                    </span>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <div className="text-sm font-medium text-gray-800">{user.name}</div>
                                        <div className="text-xs text-gray-500 capitalize">{user.roles}</div>
                                    </div>
                                    <Dropdown.Link href={route('profile.edit')} className="flex items-center hover:text-blue-600">
                                        <FaUserGear className="mr-2" size={16} />
                                        Profile
                                    </Dropdown.Link>
                                    <Dropdown.Link className="flex items-center hover:text-red-600"
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                    >
                                        <TbLogout className="mr-2" size={16}/>
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 bg-gray-100">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}