import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ToggleSwitch from '@/Components/ToggleSwitch';
import axios from 'axios';

export default function InsertNewSite({ onSiteAdded, selectedLocation, trucks = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        site_name: '',
        collection_day: 'Monday',
        collection_time: '08:00',
        barangay_id: '',
        purok_id: '',
        coordinates: null,
        truck_id: '',
        notes: ''
    });

    const [barangays, setBarangays] = useState([]);
    const [puroks, setPuroks] = useState([]);
    const [loadingBarangays, setLoadingBarangays] = useState(false);
    const [loadingPuroks, setLoadingPuroks] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleToggleChange = (value) => {
        console.log('Toggle value:', value);
      };

    useEffect(() => {
        const fetchBarangays = async (municipalityId) => {
            setLoadingBarangays(true);
            try {
                const response = await axios.get(`/municipalities/${municipalityId}/barangay`);
                setBarangays(response.data.baranggays || []);
            } catch (error) {
                console.error('Error fetching barangays:', error);
            } finally {
                setLoadingBarangays(false);
            }
        };

        fetchBarangays(1);
    }, []);

    useEffect(() => {
        if (selectedLocation) {
            setData({
                ...data,
                coordinates: selectedLocation.coordinates,
                barangay: selectedLocation.barangay,
                purok: selectedLocation.purok
            });
        }
    }, [selectedLocation]);

    useEffect(() => {
        const fetchPuroks = async () => {
            if (!data.barangay_id) {
                setPuroks([]);
                return;
            }

            setLoadingPuroks(true);
            try {
                const response = await axios.get(`/baranggay/${data.barangay_id}/purok`);
                setPuroks(response.data.puroks || []);
            } catch (error) {
                console.error('Error fetching puroks:', error);
            } finally {
                setLoadingPuroks(false);
            }
        };

        fetchPuroks();
    }, [data.barangay_id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!data.coordinates) {
            alert('Please select a location on the map first');
            return;
        }
    
        const formData = {
            ...data,
            latitude: data.coordinates.lat,
            longitude: data.coordinates.lng
        };
    
        post(route('collection-sites.store'), {
            data: formData,
            onSuccess: () => {
                reset();
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 2000);
                if (onSiteAdded) onSiteAdded({
                    ...data,
                    coordinates: data.coordinates
                });
            },
            preserveScroll: true
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Add New Garbage Collection Site</h2>
            
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <InputLabel htmlFor="site_name" value="Site Name *" />
                        <TextInput
                            id="site_name"
                            name="site_name"
                            value={data.site_name}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('site_name', e.target.value)}
                            required
                        />
                        <InputError message={errors.site_name} className="mt-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="barangay_id" value="Barangay *" />
                            <select
                                id="barangay_id"
                                name="barangay_id"
                                value={data.barangay_id}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                onChange={(e) => setData('barangay_id', e.target.value)}
                                disabled={loadingBarangays}
                                required
                            >
                                <option value="">Select Barangay</option>
                                {barangays.map((barangay) => (
                                    <option key={barangay.id} value={barangay.id}>
                                        {barangay.baranggay_name}
                                    </option>
                                ))}
                            </select>
                            {loadingBarangays && (
                                <p className="mt-1 text-sm text-gray-500">Loading barangays...</p>
                            )}
                            <InputError message={errors.barangay_id} className="mt-2" />
                        </div>
                        
                        <div>
                            <InputLabel htmlFor="purok_id" value="Purok/Sitio *" />
                            <select
                                id="purok_id"
                                name="purok_id"
                                value={data.purok_id}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                onChange={(e) => setData('purok_id', e.target.value)}
                                disabled={!data.barangay_id || loadingPuroks}
                                required
                            >
                                <option value="">Select Purok</option>
                                {puroks.map((purok) => (
                                    <option key={purok.id} value={purok.id}>
                                        {purok.purok_name}
                                    </option>
                                ))}
                            </select>
                            {loadingPuroks && (
                                <p className="mt-1 text-sm text-gray-500">Loading puroks...</p>
                            )}
                            <InputError message={errors.purok_id} className="mt-2" />
                        </div>
                    </div>

                    {trucks.length > 0 && (
                        <div>
                            <InputLabel htmlFor="truck_id" value="Assigned Truck" />
                            <select
                                id="truck_id"
                                name="truck_id"
                                value={data.truck_id}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                onChange={(e) => setData('truck_id', e.target.value)}
                            >
                                <option value="">Select a truck</option>
                                {trucks.map(truck => (
                                    <option key={truck.id} value={truck.id}>
                                        {truck.plate_number} ({truck.driver_name})
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.truck_id} className="mt-2" />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4" hidden>
                        <div>
                            <InputLabel value="Latitude" />
                            <TextInput
                                value={data.coordinates?.lat?.toFixed(6) || 'Not selected'}
                                className="mt-1 block w-full bg-gray-100"
                                readOnly
                            />
                        </div>
                        <div>
                            <InputLabel value="Longitude" />
                            <TextInput
                                value={data.coordinates?.lng?.toFixed(6) || 'Not selected'}
                                className="mt-1 block w-full bg-gray-100"
                                readOnly
                            />
                        </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <InputLabel htmlFor="collection_time" value="Collection Time *" />
                            <TextInput
                                type="time"
                                id="collection_time"
                                name="collection_time"
                                value={data.collection_time}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('collection_time', e.target.value)}
                                required
                            />
                            <InputError message={errors.collection_time} className="mt-2" />
                            </div>


                            <div>
                            <h3>Status</h3>
                            <ToggleSwitch 
                                initialValue={false}
                                onChange={handleToggleChange}
                                yesLabel="Active"
                                noLabel="Inactive"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                        <Transition
                            show={showSuccess}
                            enter="transition-opacity duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition-opacity duration-300"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-green-600">Site added successfully!</p>
                        </Transition>

                        <PrimaryButton 
                            type="submit" 
                            disabled={processing || !data.coordinates}
                            className="ml-auto"
                        >
                            {processing ? 'Saving...' : 'Save Collection Site'}
                        </PrimaryButton>
                    </div>
                </div>
            </form>
        </div>
    );
}