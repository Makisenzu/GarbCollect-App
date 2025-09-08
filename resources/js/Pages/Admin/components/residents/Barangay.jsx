import { MapPin, Eye } from 'lucide-react';
import Pagination from '@/Components/Pagination';

export default function Barangay({ barangays, links }) {
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
              <p className="text-sm text-gray-500">Puroks: {barangay.puroks_count || 0}</p>
            </div>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm">
                <Eye className="h-4 w-4" />
                View Barangay
              </button>
            </div>
          </div>
        ))}
      </div>
      {links && <Pagination links={links} />}
    </div>
  );
}