import { Head, Link } from '@inertiajs/react';
import useLocation from './useLocation';

const MyLocation = ({ mapboxToken, sites }) => {
    const {
        userLocation,
        nearestSite,
        loading,
        error,
        isMobile,
        routeInfo,
        mapContainer,
        getUserLocation,
        clearRoute,
        clearMarkers
    } = useLocation(mapboxToken, sites);

    if (error) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gray-100 p-4">
                <div className="text-center max-w-md">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Map Error</h2>
                    <p className="text-gray-600 mb-4 text-sm">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors duration-200"
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head title="Find Nearest Garbage Site" />

            <div className="w-full h-screen relative bg-gray-100">
                {loading && (
                    <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Finding your location and calculating route...</p>
                        </div>
                    </div>
                )}

                <Link
                    href="/"
                    className="absolute top-4 left-4 z-40 bg-white hover:bg-gray-50 text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl border border-gray-200"
                    title="Back to Dashboard"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>

                <div className={`
                    absolute z-40 bg-white rounded-lg shadow-lg p-4
                    ${isMobile ? 
                        'bottom-4 left-4 right-4' : 
                        'top-4 left-20 w-80'
                    }
                `}>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-gray-800">Find Nearest Site</h2>
                        {userLocation && (
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                Located
                            </span>
                        )}
                    </div>
                    
                    <button
                        onClick={getUserLocation}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-200 flex items-center justify-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Finding Route...</span>
                            </>
                        ) : (
                            <>
                                <span>Get Route to Nearest Site</span>
                            </>
                        )}
                    </button>

                    {userLocation && nearestSite && routeInfo && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <h3 className="font-semibold text-blue-800 text-sm mb-2">Route Information</h3>
                            <div className="text-sm text-blue-700 space-y-1">
                                <div className="flex justify-between">
                                    <span>Barangay:</span>
                                    <span className="font-semibold">{nearestSite.purok?.baranggay?.baranggay_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Travel Time:</span>
                                    <span className="font-semibold">{routeInfo.formattedDuration}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Route Distance:</span>
                                    <span className="font-semibold">{routeInfo.distance} km</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div 
                    ref={mapContainer} 
                    className="w-full h-full absolute inset-0"
                />
            </div>
        </>
    );
};

export default MyLocation;