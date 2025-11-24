import React, { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import axios from 'axios';

const DriverReportForm = ({ scheduleId, token }) => {
    const { props } = usePage();
    
    const [formData, setFormData] = useState({
        garbage_id: '',
        report_picture: null,
        kilograms: '',
        additional_notes: ''
    });
    
    const [garbageTypes, setGarbageTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [tokenValid, setTokenValid] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    // Validate access token on component mount
    useEffect(() => {
        validateAccessToken();
        fetchGarbageTypes();
    }, [scheduleId, token]);

    const validateAccessToken = async () => {
        try {
            const response = await axios.post('/validate-report-token', {
                schedule_id: scheduleId,
                token: token
            });

            if (response.data.valid) {
                setTokenValid(true);
            } else {
                alert('Invalid or expired access token. Please complete your route first.');
                router.visit('/dashboard');
            }
        } catch (error) {
            console.error('Token validation error:', error);
            alert('Error validating access. Please try again.');
            router.visit('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const fetchGarbageTypes = async () => {
        try {
            const response = await axios.get('/garbage-types');
            setGarbageTypes(response.data.data || []);
        } catch (error) {
            console.error('Error fetching garbage types:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }

            setFormData(prev => ({
                ...prev,
                report_picture: file
            }));

            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.garbage_id || !formData.kilograms) {
            alert('Please fill in all required fields');
            return;
        }

        if (formData.kilograms < 0) {
            alert('Weight cannot be negative');
            return;
        }

        setSubmitting(true);

        try {
            const submitData = new FormData();
            submitData.append('schedule_id', scheduleId);
            submitData.append('garbage_id', formData.garbage_id);
            submitData.append('kilograms', formData.kilograms);
            submitData.append('additional_notes', formData.additional_notes || '');
            
            if (formData.report_picture) {
                submitData.append('report_picture', formData.report_picture);
            }

            const response = await axios.post('/submit-report', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                alert('Report submitted successfully!');
                
                await axios.post('/invalidate-report-token', {
                    schedule_id: scheduleId,
                    token: token
                });

                router.visit('/dashboard');
            } else {
                alert('Failed to submit report: ' + (response.data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('Error submitting report. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Validating access...</p>
                </div>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600">Invalid or expired access token.</p>
                    <button
                        onClick={() => router.visit('/dashboard')}
                        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="text-center mb-6">
                    <div className="text-green-500 text-6xl mb-4">✅</div>
                    <h1 className="text-2xl font-bold text-gray-900">Route Completed!</h1>
                    <p className="text-gray-600 mt-2">Please submit your collection report</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Garbage Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Garbage Type *
                        </label>
                        <select
                            name="garbage_id"
                            value={formData.garbage_id}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Garbage Type</option>
                            {garbageTypes.map((garbage) => (
                                <option key={garbage.id} value={garbage.id}>
                                    {garbage.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Kilograms */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Weight Collected (Kilograms) *
                        </label>
                        <input
                            type="number"
                            name="kilograms"
                            value={formData.kilograms}
                            onChange={handleInputChange}
                            min="0"
                            step="0.1"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter weight in kilograms"
                        />
                    </div>

                    {/* Report Picture */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Collection Photo
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {previewImage && (
                            <div className="mt-4">
                                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                                <img 
                                    src={previewImage} 
                                    alt="Preview" 
                                    className="max-w-full h-48 object-cover rounded-md border"
                                />
                            </div>
                        )}
                    </div>

                    {/* Additional Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Additional Notes
                        </label>
                        <textarea
                            name="additional_notes"
                            value={formData.additional_notes}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Any additional information about the collection..."
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Submitting...
                            </div>
                        ) : (
                            'Submit Report'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DriverReportForm;