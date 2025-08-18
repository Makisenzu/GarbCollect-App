import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Map from './components/truckRoutes/Map';
import RouteMap from './components/truckRoutes/RouteMap';
import InsertNewSite from './components/truckRoutes/InsertNewSite';
import { FaMap, FaRoute, FaCalendarAlt } from 'react-icons/fa';

export default function TruckRoutes({ auth, mapboxKey }) {
    const [activeTab, setActiveTab] = useState('map');
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [collectionSites, setCollectionSites] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);


    const handleLocationSelect = (location) => {
        setSelectedLocation(location);
    };

    const handleSiteAdded = (newSite) => {
        setRefreshTrigger(prev => prev + 1);
        setCollectionSites([...collectionSites, {
            lng: newSite.coordinates.lng,
            lat: newSite.coordinates.lat,
            name: newSite.site_name,
            barangay: newSite.barangay,
            purok: newSite.purok
        }]);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'map':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                        <div className="lg:col-span-2">
                            <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                                <div className="p-0">
                                    <div className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] min-h-[300px] w-full">
                                        <Map 
                                            mapboxKey={mapboxKey || import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
                                            onLocationSelect={handleLocationSelect}
                                            collectionSites={collectionSites}
                                            refreshTrigger={refreshTrigger}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                            <InsertNewSite 
                                onSiteAdded={handleSiteAdded}
                                selectedLocation={selectedLocation}
                            />
                        </div>
                    </div>
                );
            case 'routes':
                return (
                    <div className="lg:col-span-2">
                            <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                                <div className="p-0">
                                    <div className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] min-h-[300px] w-full">
                                        <RouteMap 
                                            mapboxKey={mapboxKey || import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
                                            onLocationSelect={handleLocationSelect}
                                            collectionSites={collectionSites}
                                        />
                                    </div>
                                </div>
                            </div>
                    </div>
                );
            case 'schedule':
                return <div className="bg-white p-4 rounded-lg shadow-sm">Schedule content will be displayed here</div>;
            default:
                return null;
        }
    }; 

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Truck Routes</h2>}
        >
            <Head title="Truck Routes" />

            <div className="py-4 sm:py-6">
                <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
                    <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-200 mb-4 sm:mb-6">
                        <button title="Map"
                            className={`flex items-center px-3 py-2 text-sm font-medium whitespace-nowrap ${
                                activeTab === 'map' 
                                    ? 'text-blue-600 border-b-2 border-blue-600' 
                                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                            onClick={() => setActiveTab('map')}
                        >
                            <FaMap className="mr-2 w-4 h-4" />
                            <span className="hidden xs:inline">Map</span>
                        </button>
                        <button title="Routes"
                            className={`flex items-center px-3 py-2 text-sm font-medium whitespace-nowrap ${
                                activeTab === 'routes' 
                                    ? 'text-blue-600 border-b-2 border-blue-600' 
                                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                            onClick={() => setActiveTab('routes')}
                        >
                            <FaRoute className="mr-2 w-4 h-4" />
                            <span className="hidden xs:inline">Routes</span>
                        </button>
                        <button title="Schedule"
                            className={`flex items-center px-3 py-2 text-sm font-medium whitespace-nowrap ${
                                activeTab === 'schedule' 
                                    ? 'text-blue-600 border-b-2 border-blue-600' 
                                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                            onClick={() => setActiveTab('schedule')}
                        >
                            <FaCalendarAlt className="mr-2 w-4 h-4" />
                            <span className="hidden xs:inline">Schedule</span>
                        </button>
                    </div>

                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        <div className="p-4 sm:p-6">
                            <h3 className="text-lg font-medium mb-3 sm:mb-4">
                                {activeTab === 'map' && 'Collection Sites Map'}
                                {activeTab === 'routes' && 'Truck Routes'}
                                {activeTab === 'schedule' && 'Collection Schedule'}
                            </h3>
                            {renderTabContent()}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}