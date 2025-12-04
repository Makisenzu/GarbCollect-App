import React, { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import axios from 'axios';

const DriverReportForm = ({ scheduleId, token }) => {
    const { props } = usePage();
    
    const [formData, setFormData] = useState({
        garbage_id: '',
        report_pictures: [],
        kilograms: '',
        additional_notes: ''
    });
    
    const [garbageTypes, setGarbageTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [tokenValid, setTokenValid] = useState(false);
    const [previewImages, setPreviewImages] = useState([]);

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
        const files = Array.from(e.target.files);
        
        if (files.length === 0) return;

        // Validate all files
        const validFiles = [];
        const newPreviews = [];

        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                alert(`${file.name} is not an image file`);
                continue;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert(`${file.name} is larger than 5MB`);
                continue;
            }

            validFiles.push(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                newPreviews.push(e.target.result);
                if (newPreviews.length === validFiles.length) {
                    setPreviewImages(prev => [...prev, ...newPreviews]);
                }
            };
            reader.readAsDataURL(file);
        }

        if (validFiles.length > 0) {
            setFormData(prev => ({
                ...prev,
                report_pictures: [...prev.report_pictures, ...validFiles]
            }));
        }
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            report_pictures: prev.report_pictures.filter((_, i) => i !== index)
        }));
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
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
            
            // Append multiple pictures
            if (formData.report_pictures.length > 0) {
                formData.report_pictures.forEach((file, index) => {
                    submitData.append(`report_pictures[${index}]`, file);
                });
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

                    {/* Report Pictures */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Collection Photos (Multiple)
                        </label>
                        
                        {/* Custom file upload button */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <input
                                id="photo-upload"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <label 
                                htmlFor="photo-upload"
                                className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add Photos
                            </label>
                            <p className="text-xs text-gray-500 mt-2">Select multiple images (max 5MB each)</p>
                            {previewImages.length > 0 && (
                                <p className="text-sm text-green-600 mt-1 font-medium">
                                    {previewImages.length} photo{previewImages.length !== 1 ? 's' : ''} selected
                                </p>
                            )}
                        </div>
                        
                        {/* Preview Images */}
                        {previewImages.length > 0 && (
                            <div className="mt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-gray-700">Selected Photos ({previewImages.length})</p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData(prev => ({ ...prev, report_pictures: [] }));
                                            setPreviewImages([]);
                                        }}
                                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                                    >
                                        Remove All
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {previewImages.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <img 
                                                src={preview} 
                                                alt={`Preview ${index + 1}`} 
                                                className="w-full h-32 object-cover rounded-md border-2 border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 shadow-md"
                                            >
                                                ×
                                            </button>
                                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs py-1 text-center rounded-b-md">
                                                Photo {index + 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
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