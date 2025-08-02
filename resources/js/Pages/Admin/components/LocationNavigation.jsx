import axios from 'axios';
import { useState, useEffect } from 'react';

export default function LocationNavigation() {
    const [activeTab, setActiveTab] = useState('municipality');
    const [selectedMunicipality, setSelectedMunicipality] = useState('San Francisco');
    const [selectedBarangay, setSelectedBarangayId] = useState([]);

    const [municipalityData, setMunicipalityData] = useState([]);
    const [baranggayData, setBaranggayData] = useState([]);
    const [purokData, setPurokData] = useState([]);

    const [loadingMunicipality, setLoadingMunicipality] = useState(false);
    const [loadingBaranggay, setLoadingBaranggay] = useState(false);
    const [loadingPurok, setLoadingPurok] = useState(false);
    const [selectedMunicipalityID, setSelectedMunicipalityID] = useState([]);

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

    const puroks = {
        'Barangay 1': ['Purok 1', 'Purok 2', 'Purok 3'],
        'Barangay 2': ['Purok 1', 'Purok 2'],
        'Barangay 3': ['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4', 'Purok 5', 'Purok 6'],
        'Barangay 4': ['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4', 'Purok 5', 'Purok 6'],
        'Barangay 5': ['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4', 'Purok 5', 'Purok 6'],
        'Alegria'   : ['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4', 'Purok 5', 'Purok 6'],
    };


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
                                                            setSelectedMunicipalityID(municipality.id);
                                                            fetchBaranggay(municipality.id);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        View Barangays
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
                                    <button 
                                        className="flex items-center mb-4 text-blue-500"
                                        onClick={() => setActiveTab('municipality')}
                                    >
                                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Back to Municipalities
                                    </button>
                
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barangay</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puroks</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {baranggayData.map((barangay) => (
                                                    <tr key={barangay.id} className="hover:bg-gray-50 cursor-pointer">
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
                                        <button 
                                            className="flex items-center mb-4 text-blue-500 hover:text-blue-700 transition-colors"
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
                                                                            setSelectedBarangayId(barangay.id);
                                                                            setActiveTab('purok');
                                                                            fetchPurok(barangay.id);
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
                            {activeTab === 'province'}
                            {activeTab === 'municipality' && `Municipality`}
                            {activeTab === 'barangay' && `Barangays in ${selectedMunicipality}`}
                            {activeTab === 'purok' && `Puroks in ${selectedBarangay}`}
                        </h3>
                        {renderTable()}
                    </div>
                </div>
            </div>
        </div>
    );
}