import { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface AutocompleteOption {
  value: string;
  label: string;
  data?: any;
}

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string, data?: any) => void;
  onSearch: (query: string) => Promise<AutocompleteOption[]>;
  placeholder: string;
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  isLoading?: boolean;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  onSearch,
  placeholder,
  className = '',
  icon,
  disabled = false,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<AutocompleteOption[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    onChange(query);

    if (query.length >= 2) {
      try {
        const results = await onSearch(query);
        setOptions(results);
        setIsOpen(results.length > 0);
        setHighlightedIndex(-1);
      } catch (error) {
        console.error('Ошибка автокомплита:', error);
        setOptions([]);
        setIsOpen(false);
      }
    } else {
      setOptions([]);
      setIsOpen(false);
    }
  };

  const handleOptionClick = (option: AutocompleteOption) => {
    onChange(option.value, option.data);
    setIsOpen(false);
    setOptions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < options.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : options.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && options[highlightedIndex]) {
          handleOptionClick(options[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setOptions([]);
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (options.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={className}
        />
        {(isLoading || isOpen) && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            {isLoading ? (
              <svg className="animate-spin h-4 w-4 text-steel-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <ChevronDownIcon className={`h-4 w-4 text-steel-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            )}
          </div>
        )}
      </div>

      {isOpen && options.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-steel-200 rounded-xl shadow-lg max-h-60 overflow-auto">
          {options.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleOptionClick(option)}
              className={`w-full text-left px-4 py-3 hover:bg-construction-50 focus:bg-construction-50 focus:outline-none transition-colors ${
                index === highlightedIndex ? 'bg-construction-50' : ''
              } ${index === 0 ? 'rounded-t-xl' : ''} ${index === options.length - 1 ? 'rounded-b-xl' : ''}`}
            >
              <div className="text-sm text-steel-900">{option.label}</div>
              {option.data && (
                <div className="text-xs text-steel-500 mt-1">
                  {option.data.region && `${option.data.region}, `}
                  {option.data.city && option.data.city}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput; 