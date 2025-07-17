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

            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Create Account</h2>
                    <p className="text-slate-600 text-sm">Join GarbCollect today</p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <InputLabel htmlFor="name" value="First Name" className="text-xs font-medium text-slate-700 mb-1" />
                            <TextInput
                                id="name"
                                name="name"
                                value={data.name}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-slate-50 focus:bg-white"
                                autoComplete="name"
                                isFocused={true}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            <InputError message={errors.name} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="lastname" value="Last Name" className="text-xs font-medium text-slate-700 mb-1" />
                            <TextInput
                                id="lastname"
                                name="lastname"
                                value={data.lastname}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-slate-50 focus:bg-white"
                                autoComplete="lastname"
                                onChange={(e) => setData('lastname', e.target.value)}
                                required
                            />
                            <InputError message={errors.lastname} className="mt-1" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <InputLabel htmlFor="middlename" value="Middle Name" className="text-xs font-medium text-slate-700 mb-1" />
                            <TextInput
                                id="middlename"
                                name="middlename"
                                value={data.middlename}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-slate-50 focus:bg-white"
                                autoComplete="middlename"
                                onChange={(e) => setData('middlename', e.target.value)}
                            />
                            <InputError message={errors.middlename} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="suffix" value="Suffix" className="text-xs font-medium text-slate-700 mb-1" />
                            <TextInput
                                id="suffix"
                                name="suffix"
                                value={data.suffix}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-slate-50 focus:bg-white"
                                autoComplete="suffix"
                                onChange={(e) => setData('suffix', e.target.value)}
                            />
                            <InputError message={errors.suffix} className="mt-1" />
                        </div>
                    </div>

                    <div>
                        <InputLabel value="Gender" className="text-xs font-medium text-slate-700 mb-2" />
                        <div className="flex gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <RadioButton
                                name="gender"
                                value="male"
                                checked={data.gender === 'male'}
                                onChange={() => setData('gender', 'male')}
                                className="flex items-center space-x-2"
                            >
                                <span className="text-sm font-medium text-slate-700">Male</span>
                            </RadioButton>

                            <RadioButton
                                name="gender"
                                value="female"
                                checked={data.gender === 'female'}
                                onChange={() => setData('gender', 'female')}
                                className="flex items-center space-x-2"
                            >
                                <span className="text-sm font-medium text-slate-700">Female</span>
                            </RadioButton>

                            <RadioButton
                                name="gender"
                                value="other"
                                checked={data.gender === 'other'}
                                onChange={() => setData('gender', 'other')}
                                className="flex items-center space-x-2"
                            >
                                <span className="text-sm font-medium text-slate-700">Other</span>
                            </RadioButton>
                        </div>
                        <InputError message={errors.gender} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Email Address" className="text-xs font-medium text-slate-700 mb-1" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-slate-50 focus:bg-white"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <InputError message={errors.email} className="mt-1" />
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <div>
                            <InputLabel htmlFor="password" value="Password" className="text-xs font-medium text-slate-700 mb-1" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-slate-50 focus:bg-white"
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            <InputError message={errors.password} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="password_confirmation"
                                value="Confirm Password"
                                className="text-xs font-medium text-slate-700 mb-1"
                            />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-slate-50 focus:bg-white"
                                autoComplete="new-password"
                                onChange={(e) =>
                                    setData('password_confirmation', e.target.value)
                                }
                                required
                            />
                            <InputError
                                message={errors.password_confirmation}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <PrimaryButton 
                            className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold text-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center" 
                            disabled={processing}
                        >
                            {processing ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
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

                    <div className="text-center pt-2">
                        <Link
                            href={route('login')}
                            className="text-xs text-slate-600 hover:text-emerald-600 transition-colors duration-200 font-medium"
                        >
                            Already have an account? <span className="text-emerald-600 font-semibold">Sign in</span>
                        </Link>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}