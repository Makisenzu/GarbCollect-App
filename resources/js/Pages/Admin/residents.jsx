import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import LocationNavigation from './components/residents/LocationNavigation';
import { FaTeamspeak } from "react-icons/fa";
import { FaMountainCity } from "react-icons/fa6";
import { IoIosWarning } from "react-icons/io";
import { MdReviews } from "react-icons/md";
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Tooltip } from 'react-tooltip';

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
                        <button title="Areas"
                            className={`px-4 py-2 font-medium text-sm flex items-center ${
                              activeTab === 'areas' 
                                ? 'text-brown-600 border-b-2 border-purple-600' 
                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                            onClick={() => setActiveTab('areas')}
                        >
                            <FaMountainCity className="mr-2" size={20}/>
                        </button>
                        {/* <Tooltip 
                          id="routes-tooltip" 
                          className="z-[1000] !opacity-50 !bg-gray-800 !text-white !rounded-lg !px-3 !py-2 !text-sm !shadow-xl"
                          place="bottom"
                          noArrow={false}
                          delayShow={300}
                          delayHide={200}
                          opacity={1}
                          classNameArrow="!border-t-gray-800"
                          offset={5}
                        /> */}
                        <button title="Complaints"
                            className={`px-4 py-2 font-medium text-sm flex items-center ${
                              activeTab === 'complaints' 
                                ? 'text-red-600 border-b-2 border-red-600' 
                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                            onClick={() => setActiveTab('complaints')}
                          >
                            <FaTeamspeak className="mr-2" size={20} />
                          </button>
                        <button title="Violations"
                            className={`px-4 py-2 font-medium text-sm flex items-center ${
                                activeTab === 'violations' 
                                  ? 'text-yellow-600 border-b-2 border-yellow-600' 
                                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                              }`}
                            onClick={() => setActiveTab('violations')}
                        >
                            <IoIosWarning className="mr-2" size={20}/>
                        </button>
                        <button title="Reviews"
                            className={`px-4 py-2 font-medium text-sm flex items-center ${
                                activeTab === 'reviews' 
                                  ? 'text-blue-600 border-b-2 border-blue-600' 
                                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                              }`}
                            onClick={() => setActiveTab('reviews')}
                        >
                            <MdReviews className="mr-2" size={20}/>
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