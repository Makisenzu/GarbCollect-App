import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name || '',
            middlename: user.middlename || '',
            lastname: user.lastname || '',
            suffix: user.suffix || '',
            gender: user.gender || '',
            phone_num: user.phone_num || '',
            email: user.email || '',
            picture: null,
        });

    const submit = (e) => {
        e.preventDefault();
        
        post(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setData('picture', null);
            }
        });
    };

    const handleFileChange = (e) => {
        setData('picture', e.target.files[0]);
    };

    return (
        <section className={className}>
            <form onSubmit={submit} className="space-y-4">
                {/* Profile Picture */}
                <div className="pb-4 border-b border-gray-200">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <img
                                src={user.picture ? `/storage/profile-pictures/${user.picture}` : '/default-avatar.png'}
                                alt="Profile"
                                className="w-16 h-16 rounded-full object-cover border border-gray-300"
                            />
                        </div>
                        <div className="ml-4 flex-1">
                            <label htmlFor="picture" className="inline-block">
                                <span className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                                    Upload new picture
                                </span>
                                <input
                                    id="picture"
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                />
                            </label>
                            {data.picture && (
                                <p className="mt-2 text-xs text-gray-600">Selected: {data.picture.name}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                Upload a photo to personalize your account
                            </p>
                        </div>
                    </div>
                </div>

                {/* Name Fields */}
                <div className="space-y-4">
                    <div>
                        <InputLabel htmlFor="name" value="First name" className="text-sm font-semibold text-gray-900" />
                        <TextInput
                            id="name"
                            className="mt-1.5 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError className="mt-1.5" message={errors.name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="middlename" value="Middle name" className="text-sm font-semibold text-gray-900" />
                        <TextInput
                            id="middlename"
                            className="mt-1.5 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={data.middlename}
                            onChange={(e) => setData('middlename', e.target.value)}
                        />
                        <InputError className="mt-1.5" message={errors.middlename} />
                    </div>

                    <div>
                        <InputLabel htmlFor="lastname" value="Last name" className="text-sm font-semibold text-gray-900" />
                        <TextInput
                            id="lastname"
                            className="mt-1.5 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={data.lastname}
                            onChange={(e) => setData('lastname', e.target.value)}
                            required
                        />
                        <InputError className="mt-1.5" message={errors.lastname} />
                    </div>

                    <div>
                        <InputLabel htmlFor="suffix" value="Suffix" className="text-sm font-semibold text-gray-900" />
                        <TextInput
                            id="suffix"
                            className="mt-1.5 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={data.suffix}
                            onChange={(e) => setData('suffix', e.target.value)}
                            placeholder="Jr., Sr., III, etc."
                        />
                        <InputError className="mt-1.5" message={errors.suffix} />
                    </div>

                    <div>
                        <InputLabel htmlFor="gender" value="Gender" className="text-sm font-semibold text-gray-900" />
                        <select
                            id="gender"
                            className="mt-1.5 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={data.gender}
                            onChange={(e) => setData('gender', e.target.value)}
                        >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                        <InputError className="mt-1.5" message={errors.gender} />
                    </div>

                    <div>
                        <InputLabel htmlFor="phone_num" value="Phone number" className="text-sm font-semibold text-gray-900" />
                        <TextInput
                            id="phone_num"
                            type="tel"
                            className="mt-1.5 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={data.phone_num}
                            onChange={(e) => setData('phone_num', e.target.value)}
                            required
                            placeholder="+63"
                        />
                        <InputError className="mt-1.5" message={errors.phone_num} />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Email" className="text-sm font-semibold text-gray-900" />
                        <TextInput
                            id="email"
                            type="email"
                            className="mt-1.5 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <InputError className="mt-1.5" message={errors.email} />
                        
                        {mustVerifyEmail && user.email_verified_at === null && (
                            <div className="mt-2">
                                <p className="text-xs text-gray-700">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="text-blue-600 underline hover:text-blue-800"
                                    >
                                        Click here to re-send the verification email.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-1.5 text-xs text-green-700">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-1.5 text-sm font-medium text-white bg-green-600 border border-green-700 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Saving...' : 'Update profile'}
                        </button>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-green-700">
                                Saved!
                            </p>
                        </Transition>
                    </div>
                </div>
            </form>
        </section>
    );
}