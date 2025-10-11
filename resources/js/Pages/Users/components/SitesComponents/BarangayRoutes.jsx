import { Head, Link } from '@inertiajs/react';
import useBarangayMap from './useBarangayMap';

const BarangayRoutes = ({ mapboxToken }) => {
  const { mapContainer, loading, error } = useBarangayMap(mapboxToken);

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Map Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head title={'San Francisco Map'} />

      <div className="w-full h-screen relative">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading map...</p>
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

        <div 
          ref={mapContainer} 
          className="w-full h-full"
        />
      </div>
    </>
  );
};

export default BarangayRoutes;