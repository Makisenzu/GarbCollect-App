import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import RadioButton from '@/Components/RadioButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        middlename: '',
        lastname: '',
        suffix: '',
        gender: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register - GarbCollect" />

            <div className="space-y-6">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Get started with GarbCollect today
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="name" value="First name" className="text-sm font-medium text-gray-900" />
                            <TextInput
                                id="name"
                                name="name"
                                value={data.name}
                                className="mt-1.5 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900"
                                autoComplete="given-name"
                                isFocused={true}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="John"
                                required
                            />
                            <InputError message={errors.name} className="mt-1.5" />
                        </div>

                        <div>
                            <InputLabel htmlFor="lastname" value="Last name" className="text-sm font-medium text-gray-900" />
                            <TextInput
                                id="lastname"
                                name="lastname"
                                value={data.lastname}
                                className="mt-1.5 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900"
                                autoComplete="family-name"
                                onChange={(e) => setData('lastname', e.target.value)}
                                placeholder="Doe"
                                required
                            />
                            <InputError message={errors.lastname} className="mt-1.5" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="middlename" value="Middle name" className="text-sm font-medium text-gray-900" />
                            <TextInput
                                id="middlename"
                                name="middlename"
                                value={data.middlename}
                                className="mt-1.5 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900"
                                autoComplete="additional-name"
                                onChange={(e) => setData('middlename', e.target.value)}
                                placeholder="Optional"
                            />
                            <InputError message={errors.middlename} className="mt-1.5" />
                        </div>

                        <div>
                            <InputLabel htmlFor="suffix" value="Suffix" className="text-sm font-medium text-gray-900" />
                            <TextInput
                                id="suffix"
                                name="suffix"
                                value={data.suffix}
                                className="mt-1.5 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900"
                                autoComplete="honorific-suffix"
                                onChange={(e) => setData('suffix', e.target.value)}
                                placeholder="Jr., Sr., III"
                            />
                            <InputError message={errors.suffix} className="mt-1.5" />
                        </div>
                    </div>

                    {/* Gender */}
                    <div>
                        <InputLabel value="Gender" className="text-sm font-medium text-gray-900 mb-3" />
                        <div className="flex gap-4">
                            <RadioButton
                                name="gender"
                                value="male"
                                checked={data.gender === 'male'}
                                onChange={() => setData('gender', 'male')}
                                className="flex items-center space-x-2"
                            >
                                <span className="text-sm text-gray-700">Male</span>
                            </RadioButton>

                            <RadioButton
                                name="gender"
                                value="female"
                                checked={data.gender === 'female'}
                                onChange={() => setData('gender', 'female')}
                                className="flex items-center space-x-2"
                            >
                                <span className="text-sm text-gray-700">Female</span>
                            </RadioButton>

                            <RadioButton
                                name="gender"
                                value="other"
                                checked={data.gender === 'other'}
                                onChange={() => setData('gender', 'other')}
                                className="flex items-center space-x-2"
                            >
                                <span className="text-sm text-gray-700">Other</span>
                            </RadioButton>
                        </div>
                        <InputError message={errors.gender} className="mt-1.5" />
                    </div>

                    {/* Email */}
                    <div>
                        <InputLabel htmlFor="email" value="Email address" className="text-sm font-medium text-gray-900" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1.5 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900"
                            autoComplete="email"
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="john.doe@example.com"
                            required
                        />
                        <InputError message={errors.email} className="mt-1.5" />
                    </div>

                    {/* Password Fields */}
                    <div className="grid grid-cols-1 gap-5">
                        <div>
                            <InputLabel htmlFor="password" value="Password" className="text-sm font-medium text-gray-900" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1.5 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900"
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="At least 8 characters"
                                required
                            />
                            <InputError message={errors.password} className="mt-1.5" />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="password_confirmation"
                                value="Confirm password"
                                className="text-sm font-medium text-gray-900"
                            />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="mt-1.5 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900"
                                autoComplete="new-password"
                                onChange={(e) =>
                                    setData('password_confirmation', e.target.value)
                                }
                                placeholder="Re-enter your password"
                                required
                            />
                            <InputError
                                message={errors.password_confirmation}
                                className="mt-1.5"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {processing ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating account...
                                </div>
                            ) : (
                                'Create account'
                            )}
                        </button>
                    </div>

                    {/* Sign in Link */}
                    <div className="text-center pt-2">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link
                                href={route('login')}
                                className="font-medium text-gray-900 hover:text-gray-700 transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}