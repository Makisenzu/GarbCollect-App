import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { GrMapLocation } from "react-icons/gr";
import { FaPeopleGroup } from "react-icons/fa6";
import { FaTruckMoving } from "react-icons/fa";
import { SlGraph } from "react-icons/sl";
import { FaUser } from "react-icons/fa6";
import { FaUserGear } from "react-icons/fa6";
import { TbLogout } from "react-icons/tb";

export default function Header({ header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-10 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href="/"
                                    active={route().current('home')}
                                >
                                    <SlGraph className="mr-3" size={20} />Home
                                </NavLink>

                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    <FaTruckMoving className="mr-3" size={20}/>Track Collection
                                </NavLink>

                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    <GrMapLocation className="mr-3" size={20}/>Schedule
                                </NavLink>

                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    <FaPeopleGroup className="mr-3" size={20} />Locations
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                            >
                                                <div className="flex items-center">
                                                    <FaUser className="mr-2" size={15} />
                                                    Menu
                                                    <svg
                                                        className="ml-2 h-4 w-4"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('login')} className="flex items-center hover:text-blue-600">
                                            <FaUserGear className="mr-2" size={16} />
                                            Login
                                        </Dropdown.Link>
                                        <Dropdown.Link href={route('register')} className="flex items-center hover:text-green-600">
                                            <FaUser className="mr-2" size={16} />
                                            Register
                                        </Dropdown.Link>
                                        <Dropdown.Link className="flex items-center hover:text-red-600"
                                            href={route('dashboard')}
                                        >
                                            <TbLogout className="mr-2" size={16}/>
                                            Contact Us
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={`${showingNavigationDropdown ? 'block' : 'hidden'} sm:hidden`}>
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href="/"
                            active={route().current('home')}
                        >
                            <SlGraph className="mr-3" size={20} />Home
                        </ResponsiveNavLink>

                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            <FaTruckMoving className="mr-3" size={20}/>Track Collection
                        </ResponsiveNavLink>

                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            <GrMapLocation className="mr-3" size={20}/>Schedule
                        </ResponsiveNavLink>

                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            <FaPeopleGroup className="mr-3" size={20} />Locations
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('login')}>
                                <FaUserGear className="mr-3" size={20}/> Login
                            </ResponsiveNavLink>
                            <ResponsiveNavLink href={route('register')}>
                                <FaUser className="mr-3" size={20}/> Register
                            </ResponsiveNavLink>
                            <ResponsiveNavLink href={route('dashboard')}>
                                <TbLogout className="mr-3" size={20}/> Contact Us
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="pt-16">
                {header && (
                    <header className="bg-white shadow">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                <main className="pb-8">
                    {children}
                </main>
                <footer className="bg-green-800 text-white py-8 mt-12">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p>© 2025 GarbCollect. All rights reserved.</p>
            <p className="mt-2 text-green-200">San Francisco Garbage Collection Routing</p>
          </div>
        </footer>
            </div>
        </div>
    );
}