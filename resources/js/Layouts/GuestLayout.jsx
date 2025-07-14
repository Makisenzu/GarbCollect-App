import appLogo from '@/images/app-logo.png';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen relative overflow-hidden">
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
                <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
            </div>

            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <div className="w-small max-w-5xl rounded-3xl">
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-300">
                        <div className="flex flex-col lg:flex-row min-h-96">
                            <div className="hidden lg:flex lg:w-1/2 p-8 lg:p-12 items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100 border-r border-emerald-20">
                                <div className="text-center">
                                    <div className="mb-8 inline-block">
                                        <div className="p-6 bg-white rounded-3xl shadow-lg border border-slate-200">
                                            <img 
                                                src={appLogo}
                                                alt="GarbCollect"
                                                className="h-20 w-20 object-contain"
                                            />
                                        </div>
                                    </div>
                                    <h1 className="text-4xl font-bold text-slate-800 mb-4">GarbCollect</h1>
                                    <p className="text-slate-600 text-lg leading-relaxed max-w-sm">
                                        Smart waste management for a cleaner tomorrow
                                    </p>
                                    
                                    <div className="mt-8 flex justify-center space-x-2">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                        <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:w-1/2 p-8 lg:p-12 bg-white">
                                <div className="max-w-md mx-auto">
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}