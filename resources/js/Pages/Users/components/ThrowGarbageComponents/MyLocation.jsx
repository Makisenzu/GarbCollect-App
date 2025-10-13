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
        isTracking,
        isOnline,
        offlineMode,
        mapContainer,
        getUserLocation,
        clearRoute,
        clearMarkers,
        stopTracking
    } = useLocation(mapboxToken, sites);

    if (error) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gray-100 p-4">
                <div className="text-center max-w-md">
                    <div className="text-red-500 text-6xl mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
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
                            {!isOnline && (
                                <p className="text-yellow-600 text-sm mt-2">Using offline mode with cached data</p>
                            )}
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

                {!isOnline && (
                    <div className="absolute top-4 right-4 z-40 bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded-lg shadow-lg">
                        <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium">Offline Mode</span>
                        </div>
                    </div>
                )}

                <div className={`
                    absolute z-40 bg-white rounded-lg shadow-lg p-4
                    ${isMobile ? 
                        'bottom-4 left-4 right-4' : 
                        'top-4 left-20 w-80'
                    }
                `}>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-gray-800">Find Nearest Site</h2>
                        <div className="flex items-center space-x-2">
                            {isTracking && (
                                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                                    Live Tracking
                                </span>
                            )}
                            {userLocation && !isTracking && (
                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                    Located
                                </span>
                            )}
                        </div>
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
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>Get Route to Nearest Site</span>
                            </>
                        )}
                    </button>

                    {userLocation && nearestSite && routeInfo && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-blue-800 text-sm">Route Information</h3>
                                <div className="flex items-center space-x-2">
                                    {!isOnline && (
                                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                            Offline
                                        </span>
                                    )}
                                    {routeInfo.isCached && (
                                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                            Cached
                                        </span>
                                    )}
                                    {isTracking && (
                                        <button
                                            onClick={stopTracking}
                                            className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors duration-200"
                                        >
                                            Stop Tracking
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="text-sm text-blue-700 space-y-1">
                                <div className="flex justify-between">
                                    <span>Barangay:</span>
                                    <span className="font-semibold">{nearestSite.purok?.baranggay?.baranggay_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Travel Time:</span>
                                    <span className="font-semibold">
                                        {routeInfo.formattedDuration}
                                        {routeInfo.isCached && ' (est.)'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Route Distance:</span>
                                    <span className="font-semibold">
                                        {routeInfo.distance} km
                                        {routeInfo.isFallback && ' (straight line)'}
                                    </span>
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