import { MapPin, Eye } from 'lucide-react';
import Pagination from '@/Components/Pagination';
import BarangayMap from './BarangayMap';
import { useState } from 'react';

export default function Barangay({ barangays, links, mapBoxKey }) {
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBarangay(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="h-5 w-5 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-800">Barangays & Puroks</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {barangays.map((barangay) => (
          <div key={barangay.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{barangay.baranggay_name}</h3>
              <p className="text-sm text-gray-500">Total Purok: {barangay.puroks_count || 0}</p>
            </div>
            <div className="space-y-4">
              <button 
                onClick={() => handleViewBarangay(barangay)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                <Eye className="h-4 w-4" />
                View Barangay
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedBarangay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-800">
                {selectedBarangay.baranggay_name}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">              
              <div className="h-[75vh] rounded-lg overflow-hidden border border-gray-200">
                <BarangayMap 
                  mapBoxKey={mapBoxKey}
                  centerFocus={barangayCenters[selectedBarangay.baranggay_name] || [125.94849837776422, 8.483022468128098]}
                  barangayName={selectedBarangay.baranggay_name}
                  zoomLevel={barangayZoomLevels[selectedBarangay.baranggay_name] || 13}
                />
              </div>
            </div>
            
            <div className="flex justify-end p-6 border-t">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
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