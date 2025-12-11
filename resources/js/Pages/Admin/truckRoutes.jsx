import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Map from './components/truckRoutes/Map';
import InsertNewSite from './components/truckRoutes/InsertNewSite';
import FormModal from '@/Components/FormModal';
import { FaMap } from 'react-icons/fa';
import { router } from '@inertiajs/react';
import { showAlert, confirmDialog } from '@/SweetAlert';

export default function TruckRoutes({ auth, mapboxKey }) {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [collectionSites, setCollectionSites] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [editingSite, setEditingSite] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [editProcessing, setEditProcessing] = useState(false);
    const [purokOptions, setPurokOptions] = useState([]);

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

    const handleEditSite = async (siteData) => {
        setEditingSite(siteData);
        setEditFormData({
            purok_id: siteData.purok_id || '',
            status: siteData.status || 'active'
        });
        
        // Fetch puroks for this barangay
        if (siteData.purok?.baranggay_id) {
            try {
                const response = await fetch(`/barangay/${siteData.purok.baranggay_id}/puroks`);
                const data = await response.json();
                if (data.success) {
                    setPurokOptions(data.data.map(purok => ({
                        value: purok.id,
                        label: purok.purok_name
                    })));
                }
            } catch (error) {
                console.error('Error fetching puroks:', error);
            }
        }
        
        setShowEditModal(true);
    };

    const handleDeleteSite = async (siteData) => {
        const confirmed = await confirmDialog(
            'Delete Site',
            `Are you sure you want to delete "${siteData.site_name}"? This action cannot be undone.`,
            'Delete'
        );

        if (confirmed) {
            try {
                await router.delete(`/delete/site/${siteData.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        showAlert('success', 'Site deleted successfully');
                        setRefreshTrigger(prev => prev + 1);
                    },
                    onError: () => {
                        showAlert('error', 'Failed to delete site');
                    }
                });
            } catch (error) {
                console.error('Delete error:', error);
                showAlert('error', 'Failed to delete site');
            }
        }
    };

    const handleEditSubmit = async (formData) => {
        setEditProcessing(true);

        try {
            await router.patch(`/edit/site/${editingSite.id}`, formData, {
                preserveScroll: true,
                onSuccess: () => {
                    showAlert('success', 'Site updated successfully');
                    setShowEditModal(false);
                    setEditingSite(null);
                    setEditFormData({});
                    setRefreshTrigger(prev => prev + 1);
                },
                onError: (errors) => {
                    showAlert('error', 'Failed to update site');
                },
                onFinish: () => {
                    setEditProcessing(false);
                }
            });
        } catch (error) {
            console.error('Edit submission error:', error);
            setEditProcessing(false);
        }
    };


    const editSiteFields = [
        {
            name: 'purok_id',
            label: 'Purok',
            type: 'select',
            required: true,
            options: purokOptions
        },
        {
            name: 'status',
            label: 'Status',
            type: 'select',
            required: true,
            options: [
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'pending', label: 'Pending' },
                { value: 'maintenance', label: 'Maintenance' }
            ]
        }
    ];

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
                            onEditSite={handleEditSite}
                            onDeleteSite={handleDeleteSite}
                        />
                    </div>
                    
                    <div className="absolute top-2 right-2 left-2 sm:left-auto sm:right-4 sm:top-4 w-auto sm:w-80 max-w-full max-h-[calc(100vh-100px)] overflow-y-auto bg-white rounded-lg shadow-lg z-10">
                        <InsertNewSite
                            onSiteAdded={handleSiteAdded}
                            selectedLocation={selectedLocation}
                        />
                    </div>
                </div>

                <FormModal
                    show={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingSite(null);
                        setEditFormData({});
                    }}
                    title="Edit Site"
                    initialData={editingSite}
                    onSubmit={handleEditSubmit}
                    fields={editSiteFields}
                    submitText={editProcessing ? 'Updating...' : 'Update Site'}
                    processing={editProcessing}
                    formData={editFormData}
                    onFormChange={setEditFormData}
                />
            </div>
        </AuthenticatedLayout>
    );
}