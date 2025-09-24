import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Map from './components/truckRoutes/Map';
import InsertNewSite from './components/truckRoutes/InsertNewSite';
import { FaMap } from 'react-icons/fa';

export default function TruckRoutes({ auth, mapboxKey }) {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [collectionSites, setCollectionSites] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleLocationSelect = (location) => {
        setSelectedLocation(location);
    };

    const handleSiteAdded = (newSite) => {
        setTimeout(() => {
            setRefreshTrigger(prev => prev + 1);
            setCollectionSites(prev => [
                ...prev,
                {
                    lng: newSite.coordinates.lng,
                    lat: newSite.coordinates.lat,
                    name: newSite.site_name,
                    barangay: newSite.barangay,
                    purok: newSite.purok
                }
            ]);
        }, 0);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Truck Routes" />

            <div className="h-screen flex flex-col">
                <div className="flex-1 relative">
                    <div className="absolute inset-0">
                        <Map
                            mapboxKey={mapboxKey || import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
                            onLocationSelect={handleLocationSelect}
                            collectionSites={collectionSites}
                            refreshTrigger={refreshTrigger}
                        />
                    </div>
                    
                    <div className="absolute top-2 right-2 left-2 sm:left-auto sm:right-4 sm:top-4 w-auto sm:w-80 max-w-full max-h-[calc(100vh-100px)] overflow-y-auto bg-white rounded-lg shadow-lg z-10">
                        <InsertNewSite
                            onSiteAdded={handleSiteAdded}
                            selectedLocation={selectedLocation}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}