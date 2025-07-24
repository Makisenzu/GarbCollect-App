import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Map from './components/map';

export default function TruckRoutes({ auth, mapboxKey }) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Truck Routes</h2>}
        >
            <Head title="Truck Routes" />
            
            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <Map 
                                mapboxKey={mapboxKey || import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}