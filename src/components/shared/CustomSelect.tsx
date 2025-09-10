import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';

interface SelectOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  name?: string;
}

const CustomSelect = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Выберите опцию",
  className = "",
  name 
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    } else if (event.key === 'ArrowDown' && isOpen) {
      event.preventDefault();
      const currentIndex = options.findIndex(option => option.value === value);
      const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
      onChange(options[nextIndex].value);
    } else if (event.key === 'ArrowUp' && isOpen) {
      event.preventDefault();
      const currentIndex = options.findIndex(option => option.value === value);
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
      onChange(options[prevIndex].value);
    }
  };

  return (
    <div 
      ref={selectRef} 
      className={`relative ${className}`}
    >
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`
          w-full px-4 py-3 border border-steel-300 rounded-lg 
          focus:ring-2 focus:ring-construction-500 focus:border-construction-500 
          transition-colors bg-white text-left flex items-center justify-between
          ${isOpen ? 'ring-2 ring-construction-500 border-construction-500' : ''}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-3">
          {selectedOption?.icon && (
            <selectedOption.icon className="w-4 h-4 text-steel-500" />
          )}
          <span className={selectedOption ? 'text-steel-900' : 'text-steel-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDownIcon 
          className={`w-5 h-5 text-steel-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-steel-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleOptionClick(option.value)}
              className={`
                w-full px-4 py-3 text-left hover:bg-construction-50 transition-colors
                flex items-center justify-between group
                ${option.value === value ? 'bg-construction-50 text-construction-700' : 'text-steel-700'}
              `}
              role="option"
              aria-selected={option.value === value}
            >
              <span className="flex items-center gap-3">
                {option.icon && (
                  <option.icon className={`w-4 h-4 ${
                    option.value === value ? 'text-construction-600' : 'text-steel-500'
                  }`} />
                )}
                <span>{option.label}</span>
              </span>
              {option.value === value && (
                <CheckIcon className="w-4 h-4 text-construction-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
