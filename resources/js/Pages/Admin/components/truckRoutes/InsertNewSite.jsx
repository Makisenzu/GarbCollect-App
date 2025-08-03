import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import ToggleSwitch from '@/Components/ToggleSwitch';

export default function InsertNewSite({ onSiteAdded, selectedLocation, trucks = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        site_name: '',
        collection_day: 'Monday',
        collection_time: '08:00',
        barangay: '',
        purok: '',
        coordinates: null,
        truck_id: '',
        notes: ''
    });

    const [showSuccess, setShowSuccess] = useState(false);
    const formRef = useRef(null);
    const handleToggleChange = (value) => {
        console.log('Toggle value:', value);
      };

    useEffect(() => {
        if (selectedLocation) {
            setData({
                ...data,
                barangay: selectedLocation.barangay,
                purok: selectedLocation.purok,
                coordinates: selectedLocation.coordinates
            });
        }
    }, [selectedLocation]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!data.coordinates) {
            alert('Please select a location on the map first');
            return;
        }

        post(route('collection-sites.store'), {
            onSuccess: () => {
                reset();
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 2000);
                if (onSiteAdded) onSiteAdded(data);
            },
            preserveScroll: true
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Add New Garbage Collection Site</h2>
            
            <form onSubmit={handleSubmit} ref={formRef}>
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
                            <InputLabel htmlFor="barangay" value="Barangay" />
                            <TextInput
                                id="barangay"
                                name="barangay"
                                value={data.barangay}
                                className="mt-1 block w-full bg-gray-100"
                                readOnly
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="purok" value="Purok/Sitio" />
                                <select
                                    id="purok"
                                    name="purok"
                                    value={data.purok}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    onChange={(e) => setData('purok', e.target.value)}
                                    required
                                >
                                    <option value="">Select Purok/Sitio</option>
                                        {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                                    <option key={num} value={num}>Purok {num}</option>
                                        ))}
                                </select>
                                    <InputError message={errors.purok} className="mt-2" />
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

                    <div className="grid grid-cols-2 gap-4">
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

                    <div className="grid grid-cols-2 gap-4">
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

                    <div>
                        <InputLabel htmlFor="notes" value="Additional Notes" />
                        <textarea
                            id="notes"
                            name="notes"
                            value={data.notes}
                            rows={3}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            onChange={(e) => setData('notes', e.target.value)}
                        />
                        <InputError message={errors.notes} className="mt-2" />
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
            </form>
        </div>
    );
}