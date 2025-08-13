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
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

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

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href={getDashboardRoute()}>
                                    <ApplicationLogo className="block h-10 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">

                                {user.roles === 'admin' && (
                                    <>
                                        <NavLink
                                            href={route('admin.dashboard')}
                                            active={route().current('admin.dashboard')}
                                        >
                                            <SlGraph className="mr-3" size={20} />Dashboard
                                        </NavLink>

                                        <NavLink
                                            href={route('admin.drivers')}
                                            active={route().current('admin.drivers')}
                                        >
                                            <FaTruckMoving className="mr-3" size={20}/>Drivers
                                        </NavLink>

                                        <NavLink
                                            href={route('admin.residents')}
                                            active={route().current('admin.residents')}
                                        >
                                            <FaPeopleGroup className="mr-3" size={20} />Residents
                                        </NavLink>

                                        <NavLink
                                            href={route('admin.truckRoutes')}
                                            active={route().current('admin.truckRoutes')}
                                        >
                                            <GrMapLocation className="mr-3" size={20}/>Sites
                                        </NavLink>
                                    </>
                                )}

                                
                                {user.roles === 'user' && (
                                    <NavLink
                                        href={route('dashboard')}
                                        active={route().current('dashboard')}
                                    >
                                        Dashboard
                                    </NavLink>
                                )}

                                {/* {user.roles === 'driver' && (
                                    <NavLink
                                        href={route('driver.dashboard')}
                                        active={route().current('driver.dashboard')}
                                    >
                                        Driver Panel
                                    </NavLink>
                                )} */}
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
                                        <div className="flex items-center"> {/* New wrapper div */}
                                          <FaUser className="mr-2" size={15} />
                                          <span>{user.name}</span>
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
                <div className="border-t border-gray-200 pb-1 pt-4">
                        {/* <div className="px-4">
                            <div className="text-base font-medium text-gray-800">
                                {user.name} ({user.roles})
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div> */}

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                            <FaUserGear className="mr-3" size={20}/> Profile
                            </ResponsiveNavLink>
                            {/* <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink> */}
                        </div>
                    </div>
                    <div className="space-y-1 pb-3 pt-2">
                        {/* <ResponsiveNavLink
                            href={getDashboardRoute()}
                            active={route().current(getDashboardRoute().split('?')[0])}
                        >
                            Dashboard
                        </ResponsiveNavLink> */}

                        {user.roles === 'admin' && (
                            <>
                                <ResponsiveNavLink
                                    href={route('admin.dashboard')}
                                    active={route().current('admin.dashboard')}
                                >
                                    <SlGraph className="mr-3" size={20} />Dashboard
                                </ResponsiveNavLink>

                                <ResponsiveNavLink
                                    href={route('admin.drivers')}
                                    active={route().current('admin.drivers')}
                                >
                                    <FaTruckMoving className="mr-3" size={20}/>Drivers
                                </ResponsiveNavLink>

                                <ResponsiveNavLink
                                    href={route('admin.residents')}
                                    active={route().current('admin.residents')}
                                >
                                    <FaPeopleGroup className="mr-3" size={20} />Residents
                                </ResponsiveNavLink>

                                <ResponsiveNavLink
                                    href={route('admin.truckRoutes')}
                                    active={route().current('admin.truckRoutes')}
                                >
                                    <GrMapLocation className="mr-3" size={20}/> Sites
                                </ResponsiveNavLink>

                            </>
                        )}

                        {user.roles === 'driver' && (
                            <ResponsiveNavLink
                                href={route('driver.dashboard')}
                                active={route().current('driver.dashboard')}
                            >
                                Driver Panel
                            </ResponsiveNavLink>
                        )}
                    </div>

                    {/* <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">
                                {user.name} ({user.roles})
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div> */}
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}