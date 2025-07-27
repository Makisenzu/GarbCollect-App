import { useState } from 'react';

const ToggleSwitch = ({ 
  initialValue = false,
  onChange,
  yesLabel = 'Yes',
  noLabel = 'No',
  disabled = false
}) => {
  const [isOn, setIsOn] = useState(initialValue);

  const handleToggle = () => {
    if (disabled) return;
    const newValue = !isOn;
    setIsOn(newValue);
    if (onChange) onChange(newValue);
  };

  return (
    <div className="flex items-center">
      <span className={`mr-2 text-sm font-medium ${!isOn ? 'text-gray-900' : 'text-gray-400'}`}>
        {noLabel}
      </span>
      
      <button
        type="button"
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors 
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          ${isOn ? 'bg-indigo-600' : 'bg-gray-200'}`}
        onClick={handleToggle}
        disabled={disabled}
        aria-pressed={isOn}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${isOn ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
      
      <span className={`ml-2 text-sm font-medium ${isOn ? 'text-gray-900' : 'text-gray-400'}`}>
        {yesLabel}
      </span>
    </div>
  );
};

export default ToggleSwitch;