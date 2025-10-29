import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    
    return (
        <AuthenticatedLayout
            header="Settings"
            auth={auth}
        >
            <Head title="Profile" />

            <div className="py-8">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    {/* Navigation Tabs */}
                    {/* <div className="border-b border-gray-200 mb-8">
                        <nav className="flex space-x-8">
                            <a href="#" className="border-b-2 border-orange-500 py-4 px-1 text-sm font-semibold text-gray-900">
                                Public profile
                            </a>
                            <a href="#" className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-gray-300">
                                Account
                            </a>
                            <a href="#" className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-gray-300">
                                Security
                            </a>
                        </nav>
                    </div> */}

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-8">
                                <div className="mb-6">
                                    <img
                                        src={auth.user.picture ? `/storage/profile-pictures/${auth.user.picture}` : '/default-avatar.png'}
                                        alt="Profile"
                                        className="w-full aspect-square rounded-full object-cover border border-gray-200"
                                    />
                                </div>
                                <h1 className="text-2xl font-semibold text-gray-900 mb-1">{auth.user.name}</h1>
                                <p className="text-lg text-gray-600 mb-3">{auth.user.email}</p>
                                <span className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full border border-gray-300 capitalize">
                                    {auth.user.roles}
                                </span>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* Profile Information */}
                            <div className="border border-gray-200 rounded-md">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-base font-semibold text-gray-900">Profile</h2>
                                </div>
                                <div className="bg-white px-6 py-6">
                                    <UpdateProfileInformationForm
                                        mustVerifyEmail={mustVerifyEmail}
                                        status={status}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="border border-gray-200 rounded-md">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-base font-semibold text-gray-900">Change password</h2>
                                </div>
                                <div className="bg-white px-6 py-6">
                                    <UpdatePasswordForm />
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="border border-red-300 rounded-md">
                                <div className="bg-red-50 px-6 py-4 border-b border-red-200">
                                    <h2 className="text-base font-semibold text-red-900">Danger zone</h2>
                                </div>
                                <div className="bg-white px-6 py-6">
                                    <DeleteUserForm />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}