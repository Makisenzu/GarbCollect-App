import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ToggleSwitch from '@/Components/ToggleSwitch';
import { FiCheckCircle } from "react-icons/fi";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { showAlert, confirmDialog } from '@/SweetAlert'
import axios from 'axios';
import { CiCirclePlus } from "react-icons/ci";
import { CiLocationOn } from "react-icons/ci";
import Select from 'react-select';

export default function InsertNewSite({ onSiteAdded, selectedLocation, trucks = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        site_name: '',
        collection_day: 'Monday',
        type: 'site',
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
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [status, setStatus] = useState('active');

    const purokOptions = puroks.map(purok => ({
        value: purok.id,
        label: purok.purok_name
    }));

    const options = barangays.map(barangay => ({
        value: barangay.id,
        label: barangay.baranggay_name
    }));

    const handleToggleChange = (value) => {
        setStatus(value ? 'active' : 'inactive');
    };

    useEffect(() => {
        const fetchBarangays = async (municipalityId) => {
            setLoadingBarangays(true);
            try {
                const response = await axios.get(`/${municipalityId}/barangay`);
                setBarangays(response.data.barangays || []);
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
                barangay_id: selectedLocation.barangay_id || '',
                purok_id: selectedLocation.purok_id || ''
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
                const response = await axios.get(`/${data.barangay_id}/barangay/purok`);
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
            showAlert('warning', 'Location Required', 'Please select a location on the map first');
            return;
        }

        const formData = {
            site_name: data.site_name,
            purok_id: data.purok_id,
            latitude: data.coordinates.lat,
            longitude: data.coordinates.lng,
            type: data.type,
            status: status,
            additional_notes: data.notes || null
        };

        axios.post('/municipality/barangay/addNewGarbageSite', formData)
        .then(response => {
            Swal.fire({
                title: "Success!",
                text: "Site added successfully",
                icon: "success",
                draggable: true,
                confirmButtonText: 'OK'
            });
            reset();
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
            if (onSiteAdded) {
                setTimeout(() => {
                    onSiteAdded({
                        ...data,
                        coordinates: data.coordinates
                    });
                }, 0);
            }
        })
        .catch(error => {
            console.error('Submission error:', error.response);
            const errorMessage = error.response?.data?.message || 'Failed to save site';
            
            Swal.fire({
                title: "Error!",
                text: errorMessage,
                icon: "error",
                draggable: true,
                confirmButtonText: 'OK'
            });
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-lg">
            <div 
                className="bg-black text-white p-1 rounded-t-lg cursor-pointer flex justify-between items-center"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <h2 className="text-base font-semibold flex items-center">
                    <CiLocationOn className="mr-2" size={18}/>
                    Add New Site
                </h2>
                <span className="transform transition-transform duration-200">
                    {isCollapsed ? '▼' : '▲'}
                </span>
            </div>


            <div className={`transition-all duration-300 overflow-hidden ${isCollapsed ? 'max-h-0' : 'max-h-[80vh]'}`}>
                <div className="p-4 overflow-y-auto">
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <InputLabel htmlFor="site_name" value="Site Name (Optional)" />
                                <TextInput
                                    id="site_name"
                                    name="site_name"
                                    value={data.site_name}
                                    className="mt-1 block w-full text-sm"
                                    onChange={(e) => setData('site_name', e.target.value)}
                                    placeholder="Leave empty to use purok name"
                                />
                                <InputError message={errors.site_name} className="mt-1" />
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <div>
                                    <InputLabel htmlFor="barangay_id" value="Barangay *" />
                                    <div className="relative mt-1">
                                        <Select
                                            id="barangay_id"
                                            name="barangay_id"
                                            value={options.find(option => option.value === data.barangay_id) || null}
                                            onChange={(selectedOption) => setData('barangay_id', selectedOption?.value || '')}
                                            options={options}
                                            placeholder="Select Barangay"
                                            isDisabled={loadingBarangays}
                                            required
                                            maxMenuHeight={150}
                                            className="text-sm"
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    borderColor: '#d1d5db',
                                                    minHeight: '42px',
                                                    fontSize: '14px',
                                                    '&:hover': { borderColor: '#d1d5db' },
                                                    '&:focus': { borderColor: '#6366f1', boxShadow: '0 0 0 1px #6366f1' }
                                                })
                                            }}
                                        />
                                        {loadingBarangays && (
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <InputError message={errors.barangay_id} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="purok_id" value="Purok/Sitio *" />
                                    <div className="relative mt-1">
                                        <Select
                                            id="purok_id"
                                            name="purok_id"
                                            value={purokOptions.find(option => option.value === data.purok_id) || null}
                                            onChange={(selectedOption) => setData('purok_id', selectedOption?.value || '')}
                                            options={purokOptions}
                                            placeholder="Select Purok"
                                            isDisabled={!data.barangay_id || loadingPuroks}
                                            required
                                            maxMenuHeight={150}
                                            className="text-sm"
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    borderColor: '#d1d5db',
                                                    minHeight: '42px',
                                                    fontSize: '14px',
                                                    '&:hover': { borderColor: '#d1d5db' },
                                                    '&:focus': { borderColor: '#6366f1', boxShadow: '0 0 0 1px #6366f1' }
                                                })
                                            }}
                                        />
                                        {loadingPuroks && (
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <InputError message={errors.purok_id} className="mt-1" />
                                </div>
                            </div>

                            {trucks.length > 0 && (
                                <div>
                                    <InputLabel htmlFor="truck_id" value="Assigned Truck" />
                                    <select
                                        id="truck_id"
                                        name="truck_id"
                                        value={data.truck_id}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2"
                                        onChange={(e) => setData('truck_id', e.target.value)}
                                    >
                                        <option value="">Select a truck</option>
                                        {trucks.map(truck => (
                                            <option key={truck.id} value={truck.id}>
                                                {truck.plate_number} ({truck.driver_name})
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.truck_id} className="mt-1" />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <InputLabel htmlFor="type" value="Collection Type *" />
                                    <select
                                        id="type"
                                        name="type"
                                        value={data.type}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2"
                                        onChange={(e) => setData('type', e.target.value)}
                                        required
                                    >
                                        <option value="site">Site</option>
                                        <option value="station">Station</option>
                                    </select>
                                    <InputError message={errors.type} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel value="Status" />
                                    <div className="mt-1">
                                        <ToggleSwitch 
                                            initialValue={false}
                                            onChange={handleToggleChange}
                                            yesLabel="Active"
                                            noLabel="Inactive"
                                            compact={true}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="notes" value="Additional Notes" />
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={data.notes}
                                    rows={2}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2"
                                    onChange={(e) => setData('notes', e.target.value)}
                                />
                                <InputError message={errors.notes} className="mt-1" />
                            </div>

                            <div className="flex items-center justify-between pt-2">
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
                                    className="ml-auto text-sm py-2 px-4"
                                >
                                    <FiCheckCircle size={14} className="mr-1"/>
                                    {processing ? 'Saving...' : 'Save Site'}
                                </PrimaryButton>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}