import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export interface AutocompleteOption {
  value: string;
  label: string;
  data?: unknown;
}

interface AutocompleteInputProps {
  id?: string;
  value: string;
  onChange: (value: string, data?: unknown) => void;
  onSearch: (query: string) => Promise<AutocompleteOption[]>;
  placeholder: string;
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  isLoading?: boolean;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  id,
  value,
  onChange,
  onSearch,
  placeholder,
  className = '',
  icon,
  disabled = false,
  isLoading = false,
}) => {
  const generatedId = useId().replace(/:/g, '');
  const inputId = id ?? `autocomplete-${generatedId}`;
  const listboxId = `${inputId}-listbox`;
  const statusId = `${inputId}-status`;
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<AutocompleteOption[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchError, setSearchError] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef(onSearch);
  const requestSequence = useRef(0);
  const suppressNextSearch = useRef(false);

  useEffect(() => {
    searchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (suppressNextSearch.current) {
      suppressNextSearch.current = false;
      return;
    }

    const query = value.trim();
    const sequence = ++requestSequence.current;

    if (disabled || query.length < 2) {
      setOptions([]);
      setIsOpen(false);
      setHighlightedIndex(-1);
      setSearchError('');
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        const results = await searchRef.current(query);

        if (sequence !== requestSequence.current) {
          return;
        }

        setOptions(results);
        setIsOpen(results.length > 0);
        setHighlightedIndex(-1);
        setSearchError('');
      } catch {
        if (sequence !== requestSequence.current) {
          return;
        }

        setOptions([]);
        setIsOpen(false);
        setHighlightedIndex(-1);
        setSearchError('Подсказки временно недоступны. Введите данные вручную.');
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
      requestSequence.current += 1;
    };
  }, [disabled, value]);

  const selectOption = (option: AutocompleteOption) => {
    suppressNextSearch.current = true;
    onChange(option.value, option.data);
    setIsOpen(false);
    setOptions([]);
    setHighlightedIndex(-1);
    setSearchError('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
      return;
    }

    if (options.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((current) => current < options.length - 1 ? current + 1 : 0);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((current) => current > 0 ? current - 1 : options.length - 1);
    } else if (event.key === 'Enter' && isOpen && highlightedIndex >= 0) {
      event.preventDefault();
      selectOption(options[highlightedIndex]);
    }
  };

  const activeOptionId = isOpen && highlightedIndex >= 0
    ? `${inputId}-option-${highlightedIndex}`
    : undefined;
  const statusMessage = searchError || (isLoading ? 'Загрузка подсказок' : '');

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" aria-hidden="true">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
          aria-describedby={statusMessage ? statusId : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => options.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={className}
        />
        {(isLoading || isOpen) && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none" aria-hidden="true">
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

      <div id={statusId} role="status" aria-live="polite" className="sr-only">
        {statusMessage}
      </div>

      {isOpen && options.length > 0 && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-white border border-steel-200 rounded-xl shadow-lg max-h-60 overflow-auto"
        >
          {options.map((option, index) => (
            <button
              id={`${inputId}-option-${index}`}
              key={`${option.value}-${index}`}
              type="button"
              role="option"
              aria-selected={index === highlightedIndex}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectOption(option)}
              className={`w-full text-left px-4 py-3 hover:bg-construction-50 focus:bg-construction-50 focus:outline-none transition-colors ${
                index === highlightedIndex ? 'bg-construction-50' : ''
              } ${index === 0 ? 'rounded-t-xl' : ''} ${index === options.length - 1 ? 'rounded-b-xl' : ''}`}
            >
              <div className="text-sm text-steel-900">{option.label}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
