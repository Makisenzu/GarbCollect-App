import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';

export default function CompletionReportModal({ 
  isOpen, 
  onClose, 
  scheduleId, 
  scheduleName,
  onSubmitSuccess 
}) {
  const fileInputRef = useRef(null);
  const [garbageTypes, setGarbageTypes] = useState([]);
  const [reports, setReports] = useState([]);
  const [reportPictures, setReportPictures] = useState([]);
  const [picturesPreviews, setPicturesPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchGarbageTypes();
    }
  }, [isOpen]);

  const fetchGarbageTypes = async () => {
    try {
      const response = await axios.get('/api/garbage-types');
      if (response.data.success) {
        const types = response.data.data;
        setGarbageTypes(types);
        
        // Initialize reports with all garbage types
        setReports(types.map(type => ({
          garbage_id: type.id,
          garbage_type: type.garbage_type,
          kilograms: 0
        })));
      }
    } catch (error) {
      console.error('Error fetching garbage types:', error);
    }
  };

  const handleKilogramsChange = (garbageId, value) => {
    // Allow decimal values
    const numValue = parseFloat(value) || 0;
    setReports(prev => 
      prev.map(report => 
        report.garbage_id === garbageId 
          ? { ...report, kilograms: numValue }
          : report
      )
    );
  };

  const incrementKilograms = (garbageId, amount) => {
    setReports(prev => 
      prev.map(report => 
        report.garbage_id === garbageId 
          ? { ...report, kilograms: Math.max(0, report.kilograms + amount) }
          : report
      )
    );
  };

  const handlePictureChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

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

      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target.result);
        if (newPreviews.length === validFiles.length) {
          setPicturesPreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    }

    if (errorMessages.length > 0) {
      alert(errorMessages.join('\n'));
    }

    if (validFiles.length > 0) {
      setReportPictures(prev => [...prev, ...validFiles]);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    setReportPictures(prev => prev.filter((_, i) => i !== index));
    setPicturesPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      // Validate
      if (reportPictures.length === 0) {
        setErrors({ picture: 'At least one report picture is required' });
        setIsSubmitting(false);
        return;
      }

      const totalKg = reports.reduce((sum, r) => sum + r.kilograms, 0);
      if (totalKg === 0) {
        setErrors({ kilograms: 'Please enter at least one garbage weight' });
        setIsSubmitting(false);
        return;
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('schedule_id', scheduleId);
      
      // Append all pictures
      reportPictures.forEach((file, index) => {
        formData.append(`report_pictures[${index}]`, file);
      });
      
      formData.append('reports', JSON.stringify(reports));

      // Submit report
      const response = await axios.post('/submit-completion-report', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }

        // Redirect to driver dashboard
        router.visit('/driver/task');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      setErrors({ 
        submit: error.response?.data?.message || 'Failed to submit report. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gray-900 text-white px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Collection Completed</h2>
              <p className="text-gray-300 text-xs sm:text-sm mt-1">Submit your collection report</p>
            </div>
            <button
              onClick={onClose}
              className="ml-2 p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-200px)]">
          {/* Error Messages */}
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.submit}
            </div>
          )}

          {/* Report Pictures */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Collection Photos <span className="text-red-600">*</span>
            </label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                ref={fileInputRef}
                id="completion-photo-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handlePictureChange}
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
                    htmlFor="completion-photo-upload"
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
                {picturesPreviews.length > 0 && (
                  <div className="pt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {picturesPreviews.length} photo{picturesPreviews.length !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Preview Images */}
            {picturesPreviews.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-900">
                    Selected Photos ({picturesPreviews.length})
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setReportPictures([]);
                      setPicturesPreviews([]);
                    }}
                    className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Remove All
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {picturesPreviews.map((preview, index) => (
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
            
            {errors.picture && (
              <p className="text-red-600 text-xs mt-1">{errors.picture}</p>
            )}
          </div>

          {/* Garbage Collection Weights */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Garbage Collected (Kilograms) <span className="text-red-600">*</span>
            </label>
            <div className="space-y-3">
              {reports.map((report) => (
                <div 
                  key={report.garbage_id} 
                  className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{report.garbage_type}</div>
                      <div className="text-xs text-gray-500">Kilograms (kg)</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 ml-2">
                    <button
                      type="button"
                      onClick={() => incrementKilograms(report.garbage_id, -0.5)}
                      className="w-7 h-7 sm:w-8 sm:h-8 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 font-bold text-sm sm:text-base transition-colors"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={report.kilograms}
                      onChange={(e) => handleKilogramsChange(report.garbage_id, e.target.value)}
                      className="w-16 sm:w-20 text-center px-2 py-1.5 sm:py-2 border border-gray-300 rounded-lg font-semibold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => incrementKilograms(report.garbage_id, 0.5)}
                      className="w-7 h-7 sm:w-8 sm:h-8 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 font-bold text-sm sm:text-base transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {errors.kilograms && (
              <p className="text-red-600 text-xs mt-1">{errors.kilograms}</p>
            )}
          </div>

          {/* Total Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900 text-sm sm:text-base">Total Collected:</span>
              <span className="text-xl sm:text-2xl font-bold text-gray-900">
                {reports.reduce((sum, r) => sum + r.kilograms, 0).toFixed(2)} kg
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base transition-colors"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Report & Complete'
              )}
            </button>
          </div>

          {/* Info Note */}
          <div className="mt-4 p-2.5 sm:p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-600">
              <span className="font-semibold">Note:</span> After submitting this report, the schedule will be marked as completed and you'll be redirected to the dashboard.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
