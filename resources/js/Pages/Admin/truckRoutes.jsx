import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Map from './components/Map';
import InsertNewSite from './components/InsertNewSite';

export default function TruckRoutes({ auth, mapboxKey }) {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [collectionSites, setCollectionSites] = useState([]);

    const handleLocationSelect = (location) => {
        setSelectedLocation(location);
    };

    const handleSiteAdded = (newSite) => {
        setCollectionSites([...collectionSites, {
            ...newSite.coordinates,
            name: newSite.site_name,
            barangay: newSite.barangay,
            purok: newSite.purok
        }]);
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Collection Sites</h2>}
        >
            <Head title="Truck Routes" />
            
            <div className="py-6">
                <div className="mx-auto w-full max-w-[1800px] px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <div className="overflow-hidden sm:rounded-lg bg-white shadow-sm">
                                <div className="p-0">
                                    <div className="relative h-[70vh] min-h-[500px] w-full">
                                        <Map 
                                            mapboxKey={mapboxKey || import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
                                            onLocationSelect={handleLocationSelect}
                                            collectionSites={collectionSites}
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
}