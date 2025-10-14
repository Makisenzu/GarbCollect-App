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
import { IoHome } from "react-icons/io5";
import { FaCalendarAlt } from "react-icons/fa";
import { MdOutlineReviews } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { TiThMenu } from "react-icons/ti";
import { CiTrash } from "react-icons/ci";
import { BsFillTrash3Fill } from "react-icons/bs";

export default function Header({ header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    const preventDrag = (e) => {
        e.preventDefault();
        return false;
    };

    return (
        <div className="bg-gray-100 prevent-drag">
            <nav 
                className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white shadow-sm prevent-drag"
                onDragStart={preventDrag}
                onSelect={preventDrag}
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link 
                                    href="/"
                                    onDragStart={preventDrag}
                                    className="prevent-drag"
                                >
                                    <ApplicationLogo 
                                        className="block h-10 w-auto fill-current text-gray-800 prevent-drag" 
                                        onDragStart={preventDrag}
                                    />
                                </Link>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md prevent-drag">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none prevent-drag"
                                                onDragStart={preventDrag}
                                            >
                                                <div className="flex items-center prevent-drag">
                                                    <TiThMenu className="mr-2 prevent-drag" size={17} />
                                                </div>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content className="prevent-drag">
                                        <Dropdown.Link 
                                            href={route('barangay.schedule')} 
                                            className="flex items-center hover:text-blue-600 prevent-drag"
                                            onDragStart={preventDrag}
                                        >
                                            <FaCalendarAlt className="mr-2" size={16}/>
                                            Schedule
                                        </Dropdown.Link>
                                        <Dropdown.Link 
                                            className="flex items-center hover:text-green-600 prevent-drag"
                                            href={route('barangay.routes')}
                                            onDragStart={preventDrag}
                                        >
                                            <FaTruckMoving className="mr-2" size={16}/>
                                            Routes
                                        </Dropdown.Link>

                                        <Dropdown.Link 
                                            className="flex items-center hover:text-pink-600 prevent-drag"
                                            href={route('site.location')}
                                            onDragStart={preventDrag}
                                        >
                                            <CiTrash className="mr-2" size={16}/>
                                            Near Site
                                        </Dropdown.Link>

                                        <Dropdown.Link 
                                            className="flex items-center hover:text-yellow-600 prevent-drag"
                                            href={route('show.reviews')}
                                            onDragStart={preventDrag}
                                        >
                                            <MdOutlineReviews className="mr-2" size={16} />
                                            Reviews
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none prevent-drag"
                                onDragStart={preventDrag}
                            >
                                <svg
                                    className="h-6 w-6 prevent-drag"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    onDragStart={preventDrag}
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

                <div 
                    className={`${showingNavigationDropdown ? 'block' : 'hidden'} sm:hidden prevent-drag`}
                    onDragStart={preventDrag}
                >
                    <div className="space-y-1 pb-3 pt-2 prevent-drag">
                        <ResponsiveNavLink
                            href="/"
                            active={route().current('home')}
                            className="prevent-drag"
                            onDragStart={preventDrag}
                        >
                            <IoHome className="mr-3" size={20} />Home
                        </ResponsiveNavLink>

                        <ResponsiveNavLink
                            href={route('barangay.routes')}
                            active={route().current('barangay.routes')}
                            className="prevent-drag"
                            onDragStart={preventDrag}
                        >
                            <FaTruckMoving className="mr-3" size={20}/>Routes
                        </ResponsiveNavLink>

                        <ResponsiveNavLink
                            href={route('barangay.schedule')}
                            active={route().current('barangay.schedule')}
                            className="prevent-drag"
                            onDragStart={preventDrag}
                        >
                            <FaCalendarAlt className="mr-3" size={20}/>Schedule
                        </ResponsiveNavLink>

                        <ResponsiveNavLink
                            href={route('site.location')}
                            active={route().current('site.location')}
                            className="prevent-drag"
                            onDragStart={preventDrag}
                        >
                            <BsFillTrash3Fill className="mr-3" size={20} /> Near Site
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4 prevent-drag">
                        <div className="mt-3 space-y-1 prevent-drag">
                            <ResponsiveNavLink 
                                href={route('login')}
                                className="prevent-drag"
                                onDragStart={preventDrag}
                            >
                                <MdOutlineReviews className="mr-3" size={20}/> Reviews
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="pt-16 prevent-drag">
                {header && (
                    <header className="bg-white shadow prevent-drag">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 prevent-drag">
                            {header}
                        </div>
                    </header>
                )}

                <main className="pb-8 prevent-drag">
                    {children}
                </main>
            </div>
        </div>
    );
}