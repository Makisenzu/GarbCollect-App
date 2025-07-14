import appLogo from '@/images/app-logo.png';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">

            <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
                <div className="flex w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-lg">
                    <div className="hidden w-1/2 md:flex items-center justify-center p-8">
                        <img 
                        src={appLogo}
                        alt="GarbCollect"
                        className="h-50 w-50 object-cover rounded-lg"
                        />
                    </div>

                    <div className="w-full p-8 md:w-1/2">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-800">GarbCollect</h1>
                            <h2 className="mt-2 text-xl font-semibold text-gray-600">LOGIN</h2>
                        </div>
                        {children}
                    </div>
                 </div>
            </div>
        </div>
    );
}
