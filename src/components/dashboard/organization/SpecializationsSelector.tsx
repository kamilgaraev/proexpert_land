import { useState } from 'react';

interface SpecializationsSelectorProps {
  selectedSpecializations: string[];
  onChange: (specializations: string[]) => void;
  disabled?: boolean;
}

const SPECIALIZATIONS = [
  { value: 'building_construction', label: 'Промышленное и гражданское строительство', icon: '🏢' },
  { value: 'road_construction', label: 'Дорожное строительство', icon: '🛣️' },
  { value: 'bridge_construction', label: 'Мостовое строительство', icon: '🌉' },
  { value: 'electrical_works', label: 'Электромонтажные работы', icon: '⚡' },
  { value: 'plumbing_works', label: 'Сантехнические работы', icon: '🚰' },
  { value: 'hvac_systems', label: 'Системы отопления и вентиляции', icon: '🌡️' },
  { value: 'roofing_works', label: 'Кровельные работы', icon: '🏠' },
  { value: 'facade_works', label: 'Фасадные работы', icon: '🎨' },
  { value: 'foundation_works', label: 'Фундаментные работы', icon: '⚒️' },
  { value: 'interior_finishing', label: 'Внутренняя отделка', icon: '🖼️' },
  { value: 'landscape_works', label: 'Благоустройство территории', icon: '🌳' },
  { value: 'demolition_works', label: 'Демонтажные работы', icon: '🔨' }
];

export const SpecializationsSelector = ({
  selectedSpecializations,
  onChange,
  disabled = false
}: SpecializationsSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggle = (specialization: string) => {
    if (disabled) return;

    if (selectedSpecializations.includes(specialization)) {
      onChange(selectedSpecializations.filter(s => s !== specialization));
    } else {
      onChange([...selectedSpecializations, specialization]);
    }
  };

  const filteredSpecializations = SPECIALIZATIONS.filter(spec =>
    spec.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Поиск специализации..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-construction-500"
          disabled={disabled}
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
        {filteredSpecializations.map(spec => {
          const isSelected = selectedSpecializations.includes(spec.value);

          return (
            <div
              key={spec.value}
              className={`
                border-2 rounded-lg p-3 cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'border-construction-500 bg-construction-50' 
                  : 'border-gray-200 bg-white hover:border-construction-300'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => handleToggle(spec.value)}
            >
              <div className="flex items-center space-x-3">
                <div className={`
                  flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center
                  ${isSelected 
                    ? 'bg-construction-500 border-construction-500' 
                    : 'bg-white border-gray-300'
                  }
                `}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-xl">{spec.icon}</span>
                <span className={`text-sm font-medium ${isSelected ? 'text-construction-900' : 'text-gray-900'}`}>
                  {spec.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {selectedSpecializations.length > 0 && (
        <div className="pt-2 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">
            Выбрано специализаций: <span className="font-semibold">{selectedSpecializations.length}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedSpecializations.map(specValue => {
              const spec = SPECIALIZATIONS.find(s => s.value === specValue);
              return spec ? (
                <span
                  key={specValue}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-construction-100 text-construction-800"
                >
                  <span className="mr-1">{spec.icon}</span>
                  {spec.label}
                  {!disabled && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(specValue);
                      }}
                      className="ml-2 hover:text-construction-600"
                    >
                      ×
                    </button>
                  )}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      {filteredSpecializations.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          Специализации не найдены
        </p>
      )}
    </div>
  );
};

