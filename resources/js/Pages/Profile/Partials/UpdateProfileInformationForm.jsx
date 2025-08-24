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
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Profile Information
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Update your account's profile information.
                </p>
            </header>

            <div className="flex items-center mt-6 mb-6">
                <div className="relative">
                    {/* Profile Picture */}
                    <img
                        src={user.picture ? `/storage/profile-pictures/${user.picture}` : '/default-avatar.png'}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    {/* Edit Picture Overlay */}
                    <label htmlFor="picture" className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        <input
                            id="picture"
                            name="name"
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                    </label>
                </div>
                
                <div className="ml-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                        {user.name} {user.middlename && user.middlename + ' '}{user.lastname} {user.suffix}
                    </h3>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-gray-500 text-sm">{user.phone_num}</p>
                </div>
            </div>

            {data.picture && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">New picture selected: {data.picture.name}</p>
                </div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                        <InputLabel htmlFor="name" value="First Name *" />
                        <TextInput
                            id="name"
                            name="name"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            isFocused
                            autoComplete="given-name"
                        />
                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    {/* Middle Name */}
                    <div>
                        <InputLabel htmlFor="middlename" value="Middle Name" />
                        <TextInput
                            id="middlename"
                            name="middlename"
                            className="mt-1 block w-full"
                            value={data.middlename}
                            onChange={(e) => setData('middlename', e.target.value)}
                            autoComplete="additional-name"
                        />
                        <InputError className="mt-2" message={errors.middlename} />
                    </div>

                    {/* Last Name */}
                    <div>
                        <InputLabel htmlFor="lastname" value="Last Name *" />
                        <TextInput
                            id="lastname"
                            name="lastname"
                            className="mt-1 block w-full"
                            value={data.lastname}
                            onChange={(e) => setData('lastname', e.target.value)}
                            required
                            autoComplete="family-name"
                        />
                        <InputError className="mt-2" message={errors.lastname} />
                    </div>

                    {/* Suffix */}
                    <div>
                        <InputLabel htmlFor="suffix" value="Suffix" />
                        <TextInput
                            id="suffix"
                            name="suffix"
                            className="mt-1 block w-full"
                            value={data.suffix}
                            onChange={(e) => setData('suffix', e.target.value)}
                            placeholder="Jr., Sr., III, etc."
                            autoComplete="honorific-suffix"
                        />
                        <InputError className="mt-2" message={errors.suffix} />
                    </div>

                    {/* Gender */}
                    <div>
                        <InputLabel htmlFor="gender" value="Gender" />
                        <select
                            id="gender"
                            name="gender"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={data.gender}
                            onChange={(e) => setData('gender', e.target.value)}
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                        <InputError className="mt-2" message={errors.gender} />
                    </div>

                    {/* Phone Number */}
                    <div>
                        <InputLabel htmlFor="phone_num" value="Phone Number *" />
                        <TextInput
                            id="phone_num"
                            name="phone_num"
                            type="tel"
                            className="mt-1 block w-full"
                            value={data.phone_num}
                            onChange={(e) => setData('phone_num', e.target.value)}
                            required
                            autoComplete="tel"
                            placeholder="+63"
                        />
                        <InputError className="mt-2" message={errors.phone_num} />
                    </div>
                </div>

                {/* Email */}
                <div>
                    <InputLabel htmlFor="email" value="Email Address *" />
                    <TextInput
                        id="email"
                        name="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="email"
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ml-1"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                A new verification link has been sent to your email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Saving...' : 'Save Changes'}
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-green-600">
                            Profile updated successfully!
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}