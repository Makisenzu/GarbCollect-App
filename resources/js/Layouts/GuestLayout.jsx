import appLogo from '@/images/app-logo.png';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-20 right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                <div className="absolute top-40 left-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            {/* Geometric Grid Pattern */}
            <div className="absolute inset-0 opacity-5">
                <svg width="100%" height="100%">
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-6xl">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                        <div className="flex flex-col lg:flex-row">
                            {/* Left Panel - Branding */}
                            <div className="hidden lg:flex lg:w-1/2 p-12 items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
                                {/* Decorative Elements */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
                                
                                {/* Floating Shapes */}
                                <div className="absolute top-10 right-10 w-20 h-20 border-2 border-blue-500/20 rounded-lg rotate-12 animate-float"></div>
                                <div className="absolute bottom-10 right-20 w-16 h-16 border-2 border-indigo-500/20 rounded-full animate-float animation-delay-2000"></div>
                                <div className="absolute top-1/2 left-10 w-12 h-12 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg -rotate-12 animate-float animation-delay-4000"></div>

                                <div className="relative text-center max-w-md">
                                    <div className="mb-8 inline-block">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-50"></div>
                                            <div className="relative p-6 bg-white rounded-2xl shadow-2xl">
                                                <img 
                                                    src={appLogo}
                                                    alt="GarbCollect"
                                                    className="h-16 w-16 object-contain"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">GarbCollect</h1>
                                    <p className="text-gray-400 text-lg leading-relaxed">
                                        Smart waste management for a cleaner tomorrow
                                    </p>
                            

                                    {/* Feature badges */}
                                    <div className="mt-8 flex flex-wrap gap-2 justify-center">
                                        <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs text-gray-300 border border-white/10">Real-time Tracking</span>
                                        <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs text-gray-300 border border-white/10">Smart Routing</span>
                                        <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs text-gray-300 border border-white/10">Eco-Friendly</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel - Form */}
                            <div className="lg:w-1/2 p-8 lg:p-12 bg-white relative">
                                {/* Decorative corner accent */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-bl-full opacity-50"></div>
                                
                                {/* Mobile Logo */}
                                <div className="lg:hidden flex justify-center mb-8 relative">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl blur-lg opacity-30"></div>
                                        <div className="relative p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                                            <img 
                                                src={appLogo}
                                                alt="GarbCollect"
                                                className="h-12 w-12 object-contain"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="max-w-md mx-auto relative">
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
}