import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import { Link, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`${className}`}>
            <div className="space-y-4">
                <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">Delete account</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                    </p>
                    
                    <button
                        type="button"
                        onClick={confirmUserDeletion}
                        className="px-4 py-1.5 text-sm font-medium text-white bg-red-600 border border-red-700 rounded-md hover:bg-red-700"
                    >
                        Delete your account
                    </button>
                </div>
            </div>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Are you absolutely sure?
                    </h2>

                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-gray-800">
                            <strong className="font-semibold text-yellow-800">Warning:</strong> This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                        </p>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                        Please type your password to confirm.
                    </p>

                    <form onSubmit={deleteUser}>
                        <div className="mb-6">
                            <InputLabel
                                htmlFor="password"
                                value="Confirm your password"
                                className="text-sm font-semibold text-gray-900"
                            />

                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                className="mt-1.5 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                                isFocused
                                placeholder="Enter your password"
                            />

                            <InputError
                                message={errors.password}
                                className="mt-1.5"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-1.5 text-sm font-medium text-white bg-red-600 border border-red-700 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Deleting...' : 'I understand, delete my account'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </section>
    );
}