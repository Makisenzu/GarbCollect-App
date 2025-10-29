import { MapPin, Eye, X } from 'lucide-react';
import Pagination from '@/Components/Pagination';
import BarangayMap from './BarangayMap';
import { useState } from 'react';

export default function Barangay({ barangays, links, mapBoxKey }) {
  const [selectedBarangay, setSelectedBarangay] = useState(null);

  const barangayCenters = {
    "Alegria": [126.01045429538931, 8.506148297802667],
    "Barangay 1": [125.97512115693803, 8.511864385615809],
    "Barangay 2": [125.98099219188884, 8.508107108611867],
    "Barangay 3": [125.97177795028654, 8.508231712526168],
    "Barangay 4": [125.97986446160564, 8.50665021927368],
    "Barangay 5": [125.7451770647528, 8.71373963951153],
  };

  const barangayZoomLevels = {
    "Alegria": 14,
    "Barangay 1": 15,
    "Barangay 2": 15,
    "Barangay 3": 15,
    "Barangay 4": 15,
    "Barangay 5": 15, 
  };

  const handleViewBarangay = (barangay) => {
    setSelectedBarangay(barangay);
  };

  const closeModal = () => {
    setSelectedBarangay(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <MapPin className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Barangays & Puroks</h2>
          <p className="text-sm text-gray-600 mt-0.5">Manage and view barangay locations</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {barangays.map((barangay) => (
          <div 
            key={barangay.id} 
            className="group bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {barangay.baranggay_name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>{barangay.puroks_count || 0} Puroks</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => handleViewBarangay(barangay)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
              >
                <Eye className="h-4 w-4" />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedBarangay && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedBarangay.baranggay_name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">Barangay location and details</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">              
              <div className="h-[65vh] rounded-xl overflow-hidden border border-gray-200">
                <BarangayMap 
                  mapBoxKey={mapBoxKey}
                  centerFocus={barangayCenters[selectedBarangay.baranggay_name] || [125.94849837776422, 8.483022468128098]}
                  barangayName={selectedBarangay.baranggay_name}
                  zoomLevel={barangayZoomLevels[selectedBarangay.baranggay_name] || 13}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeModal}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {links && <Pagination links={links} />}
    </div>
  );
}