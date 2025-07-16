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
            <Head title="Register" />

            <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create Your Account</h2>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg">
                    <form onSubmit={submit} className="space-y-6">

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-2">
                                <InputLabel htmlFor="name" value="First Name" className="text-sm font-semibold text-gray-700" />
                                <TextInput
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    autoComplete="name"
                                    isFocused={true}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div className="space-y-2">
                                <InputLabel htmlFor="lastname" value="Last Name" className="text-sm font-semibold text-gray-700" />
                                <TextInput
                                    id="lastname"
                                    name="lastname"
                                    value={data.lastname}
                                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    autoComplete="lastname"
                                    onChange={(e) => setData('lastname', e.target.value)}
                                    required
                                />
                                <InputError message={errors.lastname} className="mt-2" />
                            </div>
                        </div>


                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-2">
                                <InputLabel htmlFor="middlename" value="Middle Name" className="text-sm font-semibold text-gray-700" />
                                <TextInput
                                    id="middlename"
                                    name="middlename"
                                    value={data.middlename}
                                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    autoComplete="middlename"
                                    onChange={(e) => setData('middlename', e.target.value)}
                                />
                                <InputError message={errors.middlename} className="mt-2" />
                            </div>

                            <div className="space-y-2">
                                <InputLabel htmlFor="suffix" value="Suffix" className="text-sm font-semibold text-gray-700" />
                                <TextInput
                                    id="suffix"
                                    name="suffix"
                                    value={data.suffix}
                                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    autoComplete="suffix"
                                    onChange={(e) => setData('suffix', e.target.value)}
                                />
                                <InputError message={errors.suffix} className="mt-2" />
                            </div>
                        </div>


                        <div className="space-y-4">
                            <InputLabel value="Gender" className="text-sm font-semibold text-gray-700" />
                            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                                <RadioButton
                                    name="gender"
                                    value="male"
                                    checked={data.gender === 'male'}
                                    onChange={() => setData('gender', 'male')}
                                    className="flex items-center space-x-2 sm:space-x-3"
                                >
                                    <span className="text-sm font-medium text-gray-700">Male</span>
                                </RadioButton>

                                <RadioButton
                                    name="gender"
                                    value="female"
                                    checked={data.gender === 'female'}
                                    onChange={() => setData('gender', 'female')}
                                    className="flex items-center space-x-2 sm:space-x-3"
                                >
                                    <span className="text-sm font-medium text-gray-700">Female</span>
                                </RadioButton>

                                <RadioButton
                                    name="gender"
                                    value="other"
                                    checked={data.gender === 'other'}
                                    onChange={() => setData('gender', 'other')}
                                    className="flex items-center space-x-2 sm:space-x-3"
                                >
                                    <span className="text-sm font-medium text-gray-700">Other</span>
                                </RadioButton>
                            </div>
                            <InputError message={errors.gender} className="mt-2" />
                        </div>


                        <div className="space-y-2">
                            <InputLabel htmlFor="email" value="Email Address" className="text-sm font-semibold text-gray-700" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>


                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-2">
                                <InputLabel htmlFor="password" value="Password" className="text-sm font-semibold text-gray-700" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div className="space-y-2">
                                <InputLabel
                                    htmlFor="password_confirmation"
                                    value="Confirm Password"
                                    className="text-sm font-semibold text-gray-700"
                                />
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    autoComplete="new-password"
                                    onChange={(e) =>
                                        setData('password_confirmation', e.target.value)
                                    }
                                    required
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                    className="mt-2"
                                />
                            </div>
                        </div>


                        <div className="pt-6 border-t border-gray-200">
                            <div className="flex flex-col space-y-4">
                                <div className="text-center">
                                    <Link
                                        href={route('login')}
                                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
                                    >
                                        Already have an account? <span className="text-blue-600">Sign in</span>
                                    </Link>
                                </div>

                                <div className="w-full">
                                    <PrimaryButton 
                                        className="w-full min-h-[48px] px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center" 
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <div className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Creating Account...</span>
                                            </div>
                                        ) : (
                                            <span>Create Account</span>
                                        )}
                                    </PrimaryButton>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </GuestLayout>
    );
}