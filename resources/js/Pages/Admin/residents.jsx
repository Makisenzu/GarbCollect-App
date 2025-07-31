import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import LocationNavigation from './components/LocationNavigation';
import { useState } from 'react';

export default function Residents() {
    const [activeTab, setActiveTab] = useState('areas');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'areas':
                return (
                    <LocationNavigation 
                    />
                );
            case 'complaints':
                return <div>Complaints content will be displayed here</div>;
            case 'violations':
                return <div>Violations content will be displayed here</div>;
            case 'reviews':
                return <div>Reviews content will be displayed here</div>;
            default:
                return null;
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Residents</h2>}
        >
            <Head title="Residents" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex border-b border-gray-200 mb-6">
                        <button
                            className={`px-4 py-2 font-medium text-sm ${activeTab === 'areas' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            onClick={() => setActiveTab('areas')}
                        >
                            Areas
                        </button>
                        <button
                            className={`px-4 py-2 font-medium text-sm ${activeTab === 'complaints' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'} `}
                            onClick={() => setActiveTab('complaints')}
                        >
                            Complaints
                        </button>
                        <button
                            className={`px-4 py-2 font-medium text-sm ${activeTab === 'violations' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            onClick={() => setActiveTab('violations')}
                        >
                            Violations
                        </button>
                        <button
                            className={`px-4 py-2 font-medium text-sm ${activeTab === 'reviews' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            onClick={() => setActiveTab('reviews')}
                        >
                            Reviews
                        </button>
                    </div>

                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-lg font-medium mb-4">
                                {activeTab === 'areas'}
                                {activeTab === 'complaints' && 'Complaints'}
                                {activeTab === 'violations' && 'Violations'}
                                {activeTab === 'reviews' && 'Reviews'}
                            </h3>
                            {renderTabContent()}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}