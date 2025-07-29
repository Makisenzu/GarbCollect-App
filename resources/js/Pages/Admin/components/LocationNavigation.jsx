import { useState } from 'react';

export default function LocationNavigation() {
    const [activeTab, setActiveTab] = useState('municipality');
    const [selectedProvince, setSelectedProvince] = useState('Agusan del Sur');
    const [selectedMunicipality, setSelectedMunicipality] = useState('San Francisco');
    const [selectedBarangay, setSelectedBarangay] = useState(null);

    const provinces = ['Agusan del Sur'];
    const municipalities = {
        'Agusan del Sur': ['San Francisco']
    };
    const barangays = {
        'San Francisco': ['Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4', 'Barangay 5'],
    };
    const puroks = {
        'Barangay 1': ['Purok 1', 'Purok 2', 'Purok 3'],
        'Barangay 2': ['Purok 1', 'Purok 2'],
        'Barangay 3': ['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4', 'Purok 5', 'Purok 6'],
        'Barangay 4': ['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4', 'Purok 5', 'Purok 6'],
        'Barangay 5': ['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4', 'Purok 5', 'Purok 6'],
        'Alegria'   : ['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4', 'Purok 5', 'Purok 6'],
    };

    const provinceData = [
        { id: 1, name: 'Agusan del Sur', municipalities: 1, barangays: 5, puroks: 23 }
    ];

    const municipalityData = [
        { id: 1, name: 'San Francisco', barangays: 5, puroks: 23, population: 85000 }
    ];

    const barangayData = [
        { id: 1, name: 'Barangay 1', puroks: 3, households: 250, population: 1200 },
        { id: 2, name: 'Barangay 2', puroks: 2, households: 180, population: 900 },
        { id: 3, name: 'Barangay 3', puroks: 6, households: 350, population: 1700 },
        { id: 4, name: 'Barangay 4', puroks: 6, households: 400, population: 2000 },
        { id: 5, name: 'Barangay 5', puroks: 6, households: 380, population: 1900 },
        { id: 6, name: 'Alegria', puroks: 6, households: 250, population: 2300}
    ];

    const purokData = [
        { id: 1, name: 'Purok 1', households: 80, population: 400, leader: 'Juan Dela Cruz' },
        { id: 2, name: 'Purok 2', households: 85, population: 425, leader: 'Maria Santos' },
        { id: 3, name: 'Purok 3', households: 85, population: 425, leader: 'Pedro Reyes' }
    ];

    const renderTable = () => {
        switch (activeTab) {
            case 'municipality':
                return (
                    <div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Municipality</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barangays</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puroks</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Population</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {municipalityData.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 cursor-pointer">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{item.barangays}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{item.puroks}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{item.population}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedMunicipality(item.name);
                                                        setActiveTab('barangay');
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
                    </div>
                );
            case 'barangay':
                return (
                    <div>
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Households</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Population</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {barangayData.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 cursor-pointer">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{item.puroks}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{item.households}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{item.population}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedBarangay(item.name);
                                                        setActiveTab('purok');
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
                    </div>
                );
            case 'purok':
                return (
                    <div>
                        <button 
                            className="flex items-center mb-4 text-blue-500"
                            onClick={() => setActiveTab('barangay')}
                        >
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Barangays
                        </button>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purok</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Households</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Population</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purok Leader</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {purokData.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{item.households}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{item.population}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{item.leader}</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="py-6">
            <div className="mx-auto w-full max-w-full px-4 sm:px-6 lg:px-8">
                <div className="flex border-b mb-6">
                    <button
                        className={`px-4 py-2 font-medium ${activeTab === 'province' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('province')}
                    >
                        Areas
                    </button>
                    <button
                        className={`px-4 py-2 font-medium ${activeTab === 'municipality' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'} ${!selectedProvince ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => selectedProvince && setActiveTab('municipality')}
                        disabled={!selectedProvince}
                    >
                        Complaints
                    </button>
                    <button
                        className={`px-4 py-2 font-medium ${activeTab === 'barangay' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'} ${!selectedMunicipality ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => selectedMunicipality && setActiveTab('barangay')}
                        disabled={!selectedMunicipality}
                    >
                        Violation
                    </button>
                    <button
                        className={`px-4 py-2 font-medium ${activeTab === 'purok' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'} ${!selectedBarangay ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => selectedBarangay && setActiveTab('purok')}
                        disabled={!selectedBarangay}
                    >
                        Reviews
                    </button>
                </div>

                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-lg font-medium mb-4">
                            {activeTab === 'province' && 'Provinces'}
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