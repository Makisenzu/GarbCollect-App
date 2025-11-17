import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';

export default function CompletionReportModal({ 
  isOpen, 
  onClose, 
  scheduleId, 
  scheduleName,
  onSubmitSuccess 
}) {
  const [garbageTypes, setGarbageTypes] = useState([]);
  const [reports, setReports] = useState([]);
  const [reportPicture, setReportPicture] = useState(null);
  const [picturePreview, setPicturePreview] = useState(null);
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
          sack_count: 0
        })));
      }
    } catch (error) {
      console.error('Error fetching garbage types:', error);
    }
  };

  const handleSackCountChange = (garbageId, value) => {
    setReports(prev => 
      prev.map(report => 
        report.garbage_id === garbageId 
          ? { ...report, sack_count: parseInt(value) || 0 }
          : report
      )
    );
  };

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReportPicture(file);
      setPicturePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      // Validate
      if (!reportPicture) {
        setErrors({ picture: 'Report picture is required' });
        setIsSubmitting(false);
        return;
      }

      const totalSacks = reports.reduce((sum, r) => sum + r.sack_count, 0);
      if (totalSacks === 0) {
        setErrors({ sacks: 'Please enter at least one sack count' });
        setIsSubmitting(false);
        return;
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('schedule_id', scheduleId);
      formData.append('report_picture', reportPicture);
      formData.append('reports', JSON.stringify(reports));

      // Submit report
      const response = await axios.post('/driver/submit-completion-report', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        console.log('✅ Completion report submitted successfully');
        
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">🎉 All Sites Completed!</h2>
              <p className="text-green-100 text-sm mt-1">Please submit your collection report</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-green-100">Schedule</div>
              <div className="font-semibold">{scheduleName}</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Error Messages */}
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.submit}
            </div>
          )}

          {/* Report Picture */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Collection Report Picture <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {picturePreview ? (
                <div className="relative">
                  <img 
                    src={picturePreview} 
                    alt="Preview" 
                    className="max-h-48 mx-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setReportPicture(null);
                      setPicturePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-2">📷</div>
                  <label className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700 font-medium">
                      Click to upload picture
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePictureChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                </div>
              )}
            </div>
            {errors.picture && (
              <p className="text-red-500 text-xs mt-1">{errors.picture}</p>
            )}
          </div>

          {/* Garbage Collection Counts */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Garbage Collected (Number of Sacks) <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {reports.map((report) => (
                <div 
                  key={report.garbage_id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      🗑️
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{report.garbage_type}</div>
                      <div className="text-xs text-gray-500">Number of sacks</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSackCountChange(report.garbage_id, Math.max(0, report.sack_count - 1))}
                      className="w-8 h-8 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 font-bold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={report.sack_count}
                      onChange={(e) => handleSackCountChange(report.garbage_id, e.target.value)}
                      className="w-20 text-center px-3 py-2 border border-gray-300 rounded-lg font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => handleSackCountChange(report.garbage_id, report.sack_count + 1)}
                      className="w-8 h-8 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {errors.sacks && (
              <p className="text-red-500 text-xs mt-1">{errors.sacks}</p>
            )}
          </div>

          {/* Total Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700">Total Sacks Collected:</span>
              <span className="text-2xl font-bold text-blue-600">
                {reports.reduce((sum, r) => sum + r.sack_count, 0)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Report & Complete Task'
              )}
            </button>
          </div>

          {/* Info Note */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <span className="font-semibold">Note:</span> After submitting this report, the schedule will be marked as completed and you'll be redirected to the dashboard.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
