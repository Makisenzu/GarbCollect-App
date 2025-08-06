import axios from 'axios';
import { useState, useEffect } from 'react';
import FormModal from '@/Components/FormModal';
import PrimaryButton from '@/Components/PrimaryButton';
import { MdDeleteForever } from "react-icons/md";
import { IoMdAddCircleOutline } from "react-icons/io";

export default function LocationNavigation() {
    const [activeTab, setActiveTab] = useState('municipality');
    const [selectedMunicipality, setSelectedMunicipality] = useState('');
    const [selectedBarangayId, setSelectedBarangayId] = useState(null);
    const [selectedBarangayName, setSelectedBarangayName] = useState('');

    const [municipalityData, setMunicipalityData] = useState([]);
    const [baranggayData, setBaranggayData] = useState([]);
    const [purokData, setPurokData] = useState([]);

    const [loadingMunicipality, setLoadingMunicipality] = useState(false);
    const [loadingBaranggay, setLoadingBaranggay] = useState(false);
    const [loadingPurok, setLoadingPurok] = useState(false);
    const [selectedMunicipalityId, setSelectedMunicipalityId] = useState(null);

    const [showAddBarangayModal, setShowAddBarangayModal] = useState(false);
    const [processing, setProcessing] = useState(false);

    const [showPurokModal, setShowAddPurokModal] = useState(false);
    const [purokProcessing, setPurokProcessing] = useState(false);

    const barangayFields = [
        { name: 'psgc_code', label: 'PSGC Code', type: 'text', required: true },
        { name: 'baranggay_name', label: 'Barangay Name', type: 'text', required: true },
        { 
            name: 'type', 
            label: 'Type', 
            type: 'select',
            options: [
                { value: 'Urban', label: 'Urban' },
                { value: 'Rural', label: 'Rural' }
            ],
            required: true 
        }
    ];
    
    const purokFields = [
        {
            name: 'purok_name', label: 'Purok Name', type: 'text', required: true
        }
    ]

    useEffect(() => {
        if (activeTab === 'municipality') {
            fetchMunicipalities();
        }
    }, [activeTab]);

    const fetchMunicipalities = async () => {
        setLoadingMunicipality(true);
        try {
            const response = await axios.get('/municipalities');
            setMunicipalityData(response.data.municipalities);
        } catch (error) {
            console.error('Error fetching municipalities:', error);
        } finally {
            setLoadingMunicipality(false);
        }
    };

    const fetchBaranggay = async (municipalityId) => {
        setLoadingBaranggay(true);
        try {
            const response = await axios.get(`/municipalities/${municipalityId}/barangay`);
            setBaranggayData(response.data.baranggays);
        } catch (error) {
            console.error('Error fetching barangay: ', error);
        } finally {
            setLoadingBaranggay(false);
        }
    }

    const fetchPurok = async (baranggayId) => {
        setLoadingPurok(true);
        try {
            const response = await axios.get(`/baranggay/${baranggayId}/purok`);
            setPurokData(response.data.puroks);
        } catch (error) {
            console.error('Error fetching purok: ', error);
        } finally {
            setLoadingPurok(false);
        }
    }

    const handleAddBarangaySubmit = async (formData) => {
        setProcessing(true);
        try {
            const payload = {
                ...formData,
                municipality_id: selectedMunicipalityId
            };
            
            await axios.post('/municipality/baranggay/addBarangay', payload);
            fetchBaranggay(selectedMunicipalityId);
            setShowAddBarangayModal(false);
        } catch (error) {
            console.error('Error adding barangay:', error);
            throw error;
        } finally {
            setProcessing(false);
        }
    }

    const handleAddPurokSubmit = async (formData) => {
        setPurokProcessing(true);
        try {
            const payload = {
                ...formData,
                baranggay_id: selectedBarangayId
            };

            await axios.post('/municipality/baranggay/purok/addPurok', payload);
            fetchPurok(selectedBarangayId);
            fetchBaranggay(selectedBarangayId);
            setShowAddPurokModal(false);
        } catch (error) {
            console.error('Error adding purok: ', error);
            throw error;
        } finally {
            setPurokProcessing(false);
        }
    }

    

    const renderTable = () => {
        switch (activeTab) {
            case 'municipality':
                return (
                    <div>
                        {loadingMunicipality ? (
                            <div className="p-4 text-center">Loading municipalities...</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Municipality</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barangays</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {municipalityData.map((municipality) => (
                                            <tr key={municipality.id} className="hover:bg-gray-50 cursor-pointer">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {municipality.municipality_name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {municipality.baranggays_count}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedMunicipality(municipality.municipality_name);
                                                            setActiveTab('barangay');
                                                            setSelectedMunicipalityId(municipality.id);
                                                            fetchBaranggay(municipality.id);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        View Barangay
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            case 'barangay':
                return (
                    <div>
                        {loadingBaranggay ? (
                            <div className="p-4 text-center">Loading barangays...</div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center mb-4">
                                    <button 
                                        className="flex items-center text-blue-500"
                                        onClick={() => setActiveTab('municipality')}
                                    >
                                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Back to Municipalities
                                    </button>
                                    
                                    <PrimaryButton 
                                        onClick={() => {
                                            console.log('Opening Barangay modal');
                                            setShowAddBarangayModal(true);
                                        }}
                                        className="bg-green-600 hover:bg-green-700 focus:bg-green-700 active:bg-green-800"
                                    >
                                        <IoMdAddCircleOutline size={20} className="mr-2"/>
                                        Add New Barangay
                                    </PrimaryButton>
                                </div>

                                <div className="overflow-y-scroll max-h-96">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Psgc</th> */}
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barangay</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puroks</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {baranggayData.map((barangay) => (
                                                <tr key={barangay.id} className="hover:bg-gray-50 cursor-pointer">
                                                    {/* <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{barangay.psgc_code}</div>
                                                    </td> */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{barangay.baranggay_name}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">{barangay.puroks_count}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">{barangay.type || '-'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button 
                                                            onClick={() => {
                                                                setSelectedBarangayId(barangay.id);
                                                                setActiveTab('purok');
                                                                setSelectedBarangayName(barangay.baranggay_name);
                                                                fetchPurok(barangay.id);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            View Puroks
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                );
                case 'purok':
                    return (
                        <div className="space-y-4">
                            {loadingPurok ? (
                                <div className="p-4 text-center">Loading puroks...</div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center mb-4">
                                        <button 
                                            className="flex items-center text-blue-500 hover:text-blue-700 transition-colors"
                                            onClick={() => setActiveTab('barangay')}
                                        >
                                            <svg 
                                                className="w-5 h-5 mr-1" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24"
                                            >
                                                <path 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round" 
                                                    strokeWidth={2} 
                                                    d="M15 19l-7-7 7-7" 
                                                />
                                            </svg>
                                            Back to Barangays
                                        </button>
                                        
                                        <PrimaryButton
                                            onClick={() => {
                                                console.log('Opening Purok modal');
                                                setShowAddPurokModal(true);
                                            }}
                                            className="bg-green-600 hover:bg-green-700 focus:bg-green-700 active:bg-green-800"
                                        >
                                            <IoMdAddCircleOutline size={20} className="mr-2"/>
                                              Add new Purok
                                        </PrimaryButton>
                                    </div>
                
                                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Purok
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Collection Site
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {purokData.map((purok) => (
                                                        <tr key={purok.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {purok.purok_name}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <button 
                                                                    onClick={() => {
                                                                    }}
                                                                    className="text-blue-600 hover:text-blue-900"
                                                                >
                                                                    View Site
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    );
            default:
                return null;
        }
    };

    return (
        <div className="py-6">
            <div className="mx-auto w-full max-w-full px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-lg font-medium mb-4">
                            {activeTab === 'municipality' && 'Municipalities'}
                            {activeTab === 'barangay' && `Barangays in ${selectedMunicipality}`}
                            {activeTab === 'purok' && `Puroks in ${selectedBarangayName}`}
                        </h3>
                        {renderTable()}
                    </div>
                </div>
            </div>

            <FormModal
                show={showAddBarangayModal}
                onClose={() => setShowAddBarangayModal(false)}
                title="Add New Barangay"
                fields={barangayFields}
                onSubmit={handleAddBarangaySubmit}
                submitText={processing ? 'Adding...' : 'Add Barangay'}
                processing={processing}
            />

            <FormModal
                show={showPurokModal}
                onClose={() => setShowAddPurokModal(false)}
                title="Add New Purok"
                fields={purokFields}
                onSubmit={handleAddPurokSubmit}
                submitText={purokProcessing ? 'Adding...' : 'Add Purok'}
                processing={purokProcessing}
            />
        </div>
    );
}