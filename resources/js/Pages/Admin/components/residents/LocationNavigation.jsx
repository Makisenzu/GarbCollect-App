import axios from 'axios';
import { useState, useEffect } from 'react';
import FormModal from '@/Components/FormModal';
import PrimaryButton from '@/Components/PrimaryButton';
import { MdDeleteForever } from "react-icons/md";
import { IoMdAddCircleOutline } from "react-icons/io";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { showAlert,  confirmDialog } from '@/SweetAlert'
import { FaRegEye } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import { CiEdit } from "react-icons/ci";

export default function LocationNavigation() {
    const [activeTab, setActiveTab] = useState('municipality');
    const [selectedMunicipality, setSelectedMunicipality] = useState('');
    const [selectedBarangayId, setSelectedBarangayId] = useState(null);
    const [selectedBarangayName, setSelectedBarangayName] = useState('');
    const [selectedPurokId, setSelectedPurokId] = useState(null);

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

    const [showEditPurokModal, setShowEditPurokModal] = useState(false);
    const [editPurokProcessing, setEditPurokProcessing] = useState(false);
    const [editingPurok, setEditingPurok] = useState(null);

    const [showEditBarangayModal, setShowEditBarangayModal] = useState(false);
    const [editBarangayProcessing, setEditBarangayProcessing] = useState(false);
    const [editingBarangay, setEditingBarangay] = useState(null);

    const [deleteBarangayId, setDeleteBarangayID] = useState(null);
    const [deletePurokId, setDeletePurokId] = useState(null);
    
    

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

    const editBarangayFields = [
        { name: 'psgc_code', label: 'PSGC Code', type: 'text', required: true },
        { name:'baranggay_name', label: 'Barangay Name', type: 'text', required: true },
        {
            name: 'type',
            label: 'Type',
            type: 'select',
            options: [
                { value: 'Urban', label: 'Urban' },
                { value: 'Rural', label: 'Rural'}
            ],
            required: true
        }
    ];

    const editPurokFields = [
        { name: 'purok_name', label: 'Purok Name', type: 'text', required: true }
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
            
            const response = await axios.post('/municipality/baranggay/addBarangay', payload);
            if(response.data.success) {
                showAlert('success', `${response.data.data.barangay_name} added successfully`);
                fetchBaranggay(selectedMunicipalityId);
                setShowAddBarangayModal(false);
            } else {
                throw new Error(response.data.message || 'Add failed');
            }
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
    
            const response = await axios.post('/municipality/baranggay/purok/addPurok', payload);
            
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to add purok');
            }
    
            showAlert('success', `${response.data.data.purok_name} added successfully`);
            fetchPurok(selectedBarangayId);
            fetchBaranggay(selectedBarangayId);
            setShowAddPurokModal(false);
            
        } catch (error) {
            console.error('Error adding purok:', error);
            showAlert(
                'error', 
                error.response?.data?.message || 
                error.message || 
                'Failed to add purok. Please try again.'
            );
        } finally {
            setPurokProcessing(false);
        }
    }

    const handleEditBarangaySubmit = async (formData) => {
        setEditBarangayProcessing(true);
        try {
            const response = await axios.put(
                `/municipality/barangay/editBarangay/${selectedBarangayId}`,
                formData
            );

            if (response.data.success) {
                showAlert('success', 'Barangay updated successfully!');
                fetchBaranggay(selectedMunicipalityId);
                setShowEditBarangayModal(false);
            } else {
                throw new Error(response.data.message || 'Update failed');
            }
        } catch (error) {
            console.error('Failed to update barangay:', error);
            showAlert('error', error.response?.data?.message || 'Failed to update barangay');
        } finally {
            setEditBarangayProcessing(false);
        }
    }

    const handleEditPurokSubmit = async (formData) => {
        setEditPurokProcessing(true);
        try {
            const response = await axios.put(`/municipality/barangay/editPurok/${selectedPurokId}`, formData);
            if (response.data.success) {
                showAlert('success', 'Purok updated successfully!');
                fetchPurok(selectedBarangayId);
                setShowEditPurokModal(false);
            } else {
                throw new Error(response.data.message || 'Update failed');
            }
        } catch (error) {
            console.error('Failed to update purok: ', error);
            showAlert('error', error.response?.data?.message || 'Failed to update purok');
        } finally {
            setEditPurokProcessing(false);
        }
    }

    const handleDeleteBarangay = async (barangayId) => {
        try {
          const isConfirmed = await confirmDialog(
            'Are you sure?',
            'You are about to delete this barangay. This action cannot be undone.',
            'Yes, delete it'
          );
      
          if (!isConfirmed) return;
      
          await axios.delete(`/municipality/barangay/${barangayId}/delete`);
          fetchBaranggay(selectedMunicipalityId);
          showAlert('success', 'Barangay deleted successfully!');
        } catch (error) {
          console.error('Error deleting barangay:', error);
          showAlert('error', error.response?.data?.message || 'Failed to delete barangay');
        }
      };

    const handleDeletePurok = async (purokId) => {
        try {
            const isDeleteConfirmed = await confirmDialog(
                'Are you sure?',
                'You are about to delete this purok. This action cannot be undone.',
                'Yes, delete it' 
            );
            if(!isDeleteConfirmed) return;

            await axios.delete(`/municipality/barangay/purok/${purokId}/delete`);
            fetchPurok(selectedBarangayId);
            showAlert('success', 'Purok deleted successfully!');
        } catch (error) {
            console.error('Error deleting purok', error);
            showAlert('error', error.response?.data?.message || 'Failed to delete purok');
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
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
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
                                                        className="text-gray-600 hover:text-blue-600"
                                                    >
                                                        <FaRegEye size={25}/>
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
                                                        <div className="flex items-center gap-3">
                                                        <button title='View Barangay'
                                                            onClick={() => {
                                                                setSelectedBarangayId(barangay.id);
                                                                setActiveTab('purok');
                                                                setSelectedBarangayName(barangay.baranggay_name);
                                                                fetchPurok(barangay.id);
                                                            }}
                                                            className="text-gray-600 hover:text-blue-600"
                                                        >
                                                            <FaRegEye size={20}/>
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                setSelectedBarangayId(barangay.id);
                                                                setEditingBarangay(barangay);
                                                                setShowEditBarangayModal(true);
                                                            }}
                                                            className="text-gray-600 hover:text-green-600"
                                                        >
                                                            <CiEdit size={25}/>
                                                        </button>

                                                        <button 
                                                            onClick={() => {
                                                                handleDeleteBarangay(barangay.id);
                                                            }}
                                                            className="text-gray-600 hover:text-red-600"
                                                        >
                                                            <FaRegTrashCan size={20}/>
                                                        </button>
                                                        </div>
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

                                                                <div className="flex items-center gap-2">
                                                                <button 
                                                            onClick={() => {
                                                                setSelectedPurokId(purok.id);
                                                            }}
                                                            className="text-gray-600 hover:text-blue-600"
                                                        >
                                                            <FaRegEye size={20}/>
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                setSelectedPurokId(purok.id);
                                                                setEditingPurok(purok);
                                                                setShowEditPurokModal(true);
                                                            }}
                                                            className="text-gray-600 hover:text-green-600"
                                                        >
                                                            <CiEdit size={25}/>
                                                        </button>

                                                        <button 
                                                            onClick={() => {
                                                                handleDeletePurok(purok.id);
                                                            }}
                                                            className="text-gray-600 hover:text-red-600"
                                                        >
                                                            <FaRegTrashCan size={20}/>
                                                        </button>
                                                                </div>
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
                initialData={{}}
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

            <FormModal
                show={showEditBarangayModal}
                onClose={() => setShowEditBarangayModal(false)}
                title="Edit Barangay"
                initialData={editingBarangay}
                fields={editBarangayFields}
                onSubmit={handleEditBarangaySubmit}
                submitText={editBarangayProcessing ? 'Editing....' : 'Edit Barangay'}
                processing={editBarangayProcessing}
            />

            <FormModal
                show={showEditPurokModal}
                onClose={() => setShowEditPurokModal(false)}
                title="Edit Purok"
                initialData={editingPurok}
                fields={editPurokFields}
                onSubmit={handleEditPurokSubmit}
                submitText={editPurokProcessing ? 'Editing....' : 'Edit Purok'}
                processing={editPurokProcessing}
            />
        </div>
    );
}