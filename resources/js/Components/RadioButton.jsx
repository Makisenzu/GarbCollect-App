import { forwardRef, useRef } from 'react';

export default forwardRef(function RadioButton(
    { className = '', name, value, checked, onChange, children, ...props },
    ref
) {
    const inputRef = useRef(null);

    return (
        <label className="relative flex items-center space-x-3 cursor-pointer group">
            {/* Hidden native radio input */}
            <input
                {...props}
                type="radio"
                name={name}
                value={value}
                checked={checked}
                onChange={onChange}
                ref={(node) => {
                    inputRef.current = node;
                    if (typeof ref === 'function') {
                        ref(node);
                    } else if (ref) {
                        ref.current = node;
                    }
                }}
                className="sr-only"
            />
            
            {/* Custom radio design */}
            <div className={`
                relative w-5 h-5 rounded-full border-2 transition-all duration-200 ease-in-out
                ${checked 
                    ? 'border-blue-600 bg-blue-600 shadow-lg shadow-blue-600/30' 
                    : 'border-gray-300 bg-white hover:border-blue-400 hover:shadow-md group-hover:scale-105'
                }
                focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2
                ${className}
            `}>
                {/* Inner dot */}
                <div className={`
                    absolute inset-0 rounded-full transition-all duration-200 ease-in-out
                    ${checked 
                        ? 'bg-white scale-50 opacity-100' 
                        : 'bg-transparent scale-0 opacity-0'
                    }
                `} />
                
                {/* Ripple effect on hover */}
                <div className={`
                    absolute inset-0 rounded-full transition-all duration-300 ease-out
                    ${checked 
                        ? 'bg-blue-600 scale-150 opacity-0' 
                        : 'bg-blue-400 scale-0 opacity-0 group-hover:scale-150 group-hover:opacity-20'
                    }
                `} />
            </div>

            {/* Label text */}
            {children && (
                <span className={`
                    text-sm font-medium transition-colors duration-200
                    ${checked 
                        ? 'text-blue-700' 
                        : 'text-gray-700 group-hover:text-gray-900'
                    }
                `}>
                    {children}
                </span>
            )}
        </label>
    );
});