import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="GarbCollect" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <div className="text-center mb-8">
                <h2 className="mt-2 text-xl font-semibold text-gray-600">LOGIN</h2>
            </div>

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Remember me
                        </span>
                    </label>
                </div>

        <div className="mt-6 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
             <div className="flex items-center gap-3">
            {canResetPassword && (
                <Link
                    href={route('password.request')}
                    className="text-xs font-medium text-gray-600 hover:text-gray-900 hover:underline focus:rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Forgot password?
                </Link>
            )}
        
                <span className="hidden text-sm text-gray-400 sm:inline">|</span>
        
                <Link
                    href={route('register')}
                    className="text-xs font-small text-gray-600 hover:text-gray-900 hover:underline focus:rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Don't have an account?
                </Link>
            </div>

    <PrimaryButton 
        className="w-full sm:w-auto justify-center px-6 py-2.5 text-lg" 
        disabled={processing}
    >
        Log in
    </PrimaryButton>
</div>
            </form>
        </GuestLayout>
    );
}
