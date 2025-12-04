import React, { useState, useEffect, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';
import axios from 'axios';

const DriverReportForm = ({ scheduleId, token }) => {
    const { props } = usePage();
    const fileInputRef = useRef(null);
    
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
        let errorMessages = [];

        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                errorMessages.push(`${file.name} is not an image file`);
                continue;
            }

            if (file.size > 5 * 1024 * 1024) {
                errorMessages.push(`${file.name} is larger than 5MB`);
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

        if (errorMessages.length > 0) {
            alert(errorMessages.join('\n'));
        }

        if (validFiles.length > 0) {
            setFormData(prev => ({
                ...prev,
                report_pictures: [...prev.report_pictures, ...validFiles]
            }));
        }

        // Reset file input to allow selecting the same files again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
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
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Validating access...</p>
                </div>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
                        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-6">Invalid or expired access token.</p>
                    <button
                        onClick={() => router.visit('/dashboard')}
                        className="bg-gray-900 text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors font-medium"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    {/* Header */}
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h1 className="text-2xl font-bold text-gray-900">Collection Report</h1>
                        <p className="text-sm text-gray-600 mt-1">Submit your collection details</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Garbage Type */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Garbage Type <span className="text-red-600">*</span>
                            </label>
                            <select
                                name="garbage_id"
                                value={formData.garbage_id}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            >
                                <option value="">Select Garbage Type</option>
                                {garbageTypes.map((garbage) => (
                                    <option key={garbage.id} value={garbage.id}>
                                        {garbage.garbage_type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Kilograms */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Weight Collected (Kilograms) <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="number"
                                name="kilograms"
                                value={formData.kilograms}
                                onChange={handleInputChange}
                                min="0"
                                step="0.1"
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                placeholder="Enter weight in kilograms"
                            />
                        </div>

                        {/* Report Pictures */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Collection Photos
                            </label>
                            
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                <input
                                    ref={fileInputRef}
                                    id="photo-upload"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <div className="space-y-3">
                                    <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <label 
                                            htmlFor="photo-upload"
                                            className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Add Photos
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Select multiple images (max 5MB each)
                                    </p>
                                    {previewImages.length > 0 && (
                                        <div className="pt-2">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {previewImages.length} photo{previewImages.length !== 1 ? 's' : ''} selected
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Preview Images */}
                            {previewImages.length > 0 && (
                                <div className="mt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm font-semibold text-gray-900">
                                            Selected Photos ({previewImages.length})
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, report_pictures: [] }));
                                                setPreviewImages([]);
                                            }}
                                            className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
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
                                                    className="w-full h-32 object-cover rounded-md border border-gray-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-white border border-gray-300 text-gray-700 rounded-full hover:bg-gray-100 transition-colors shadow-sm"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                                <div className="absolute bottom-2 left-2 right-2">
                                                    <div className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded text-center">
                                                        Photo {index + 1}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Additional Notes */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Additional Notes
                            </label>
                            <textarea
                                name="additional_notes"
                                value={formData.additional_notes}
                                onChange={handleInputChange}
                                rows="4"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                                placeholder="Any additional information about the collection..."
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => router.visit('/dashboard')}
                                disabled={submitting}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 px-6 py-3 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DriverReportForm;