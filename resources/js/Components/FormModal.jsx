import { useState, useEffect } from 'react'; 
import TextInput from './TextInput';
import PrimaryButton from './PrimaryButton';
import { FaCheck } from "react-icons/fa";

const FormModal = ({
  show = false,
  onClose = () => {},
  title = 'Form',
  initialData = null,
  onSubmit = () => {},
  fields = [],
  submitText = 'Submit',
  processing = false,
  formData = {},
  onFormChange = () => {}
}) => {
  const [errors, setErrors] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (show && !isInitialized) {
      const initializedData = {};
      fields.forEach(field => {
        initializedData[field.name] = initialData?.[field.name] ?? 
                                    field.defaultValue ?? 
                                    (field.type === 'select' && field.required ? field.options?.[0]?.value : '');
      });
      onFormChange(initializedData);
      setErrors({});
      setIsInitialized(true);
    }
    
    if (!show) {
      setIsInitialized(false);
    }
  }, [show, isInitialized, initialData, fields, onFormChange]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFormChange({
      ...formData,
      [name]: value
    });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        console.error('Form submission error:', error);
      }
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative z-50 w-full max-w-md p-4 mx-auto">
        <div className="relative bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {title}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {fields.map((field) => {
                  const fieldValue = formData[field.name] ?? '';
                  const isInvalid = !!errors[field.name];
                  
                  return (
                    <div key={field.name}>
                      <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      
                      {field.type === 'select' ? (
                        <select
                          id={field.name}
                          name={field.name}
                          value={fieldValue}
                          onChange={handleChange}
                          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                            isInvalid ? 'border-red-500' : 'border'
                          }`}
                          required={field.required}
                          disabled={field.disabled}
                        >
                          {!field.required && !field.hideDefaultOption && (
                            <option value="">Select {field.label}</option>
                          )}
                          {field.options?.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          id={field.name}
                          name={field.name}
                          value={fieldValue}
                          onChange={handleChange}
                          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                            isInvalid ? 'border-red-500' : 'border'
                          }`}
                          rows={field.rows || 3}
                          required={field.required}
                          disabled={field.disabled}
                        />
                      ) : (
                        <TextInput
                          id={field.name}
                          name={field.name}
                          type={field.type || 'text'}
                          value={fieldValue}
                          onChange={handleChange}
                          className={`w-full ${isInvalid ? 'border-red-500' : ''}`}
                          required={field.required}
                          disabled={field.disabled}
                          placeholder={field.placeholder}
                        />
                      )}
                      {isInvalid && (
                        <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
                      )}
                    </div>
                  );
                })}
              </div>  

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  disabled={processing}
                >
                  Cancel
                </button>
                <PrimaryButton
                  type="submit"
                  disabled={processing}
                >
                  <FaCheck size={20} className="mr-2"/>
                  {processing ? 'Processing...' : submitText}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormModal;