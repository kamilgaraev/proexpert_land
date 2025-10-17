import { useState } from 'react';
import type { OrganizationCapability, CapabilityInfo } from '@/types/organization-profile';

interface CapabilitiesSelectorProps {
  selectedCapabilities: OrganizationCapability[];
  availableCapabilities: CapabilityInfo[];
  onChange: (capabilities: OrganizationCapability[]) => void;
  showRecommendations?: boolean;
  disabled?: boolean;
}

const CAPABILITY_LABELS: Record<OrganizationCapability, string> = {
  'general_contracting': 'Генеральный подряд',
  'subcontracting': 'Субподрядные работы',
  'design': 'Проектирование',
  'construction_supervision': 'Строительный контроль',
  'equipment_rental': 'Аренда техники',
  'materials_supply': 'Поставка материалов',
  'consulting': 'Консалтинг',
  'facility_management': 'Эксплуатация объектов'
};

export const CapabilitiesSelector = ({
  selectedCapabilities,
  availableCapabilities,
  onChange,
  showRecommendations = false,
  disabled = false
}: CapabilitiesSelectorProps) => {
  const handleToggle = (capability: OrganizationCapability) => {
    if (disabled) return;

    if (selectedCapabilities.includes(capability)) {
      onChange(selectedCapabilities.filter(c => c !== capability));
    } else {
      onChange([...selectedCapabilities, capability]);
    }
  };

  const getCapabilityInfo = (capability: OrganizationCapability): CapabilityInfo | undefined => {
    return availableCapabilities.find(c => c.value === capability);
  };

  const capabilities: OrganizationCapability[] = [
    'general_contracting',
    'subcontracting',
    'design',
    'construction_supervision',
    'equipment_rental',
    'materials_supply',
    'consulting',
    'facility_management'
  ];

  const selectedModules = selectedCapabilities.flatMap(cap => {
    const info = getCapabilityInfo(cap);
    return info?.recommended_modules || [];
  });

  const uniqueModules = Array.from(new Set(selectedModules));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {capabilities.map(capability => {
          const isSelected = selectedCapabilities.includes(capability);
          const capInfo = getCapabilityInfo(capability);

          return (
            <div
              key={capability}
              className={`
                relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => handleToggle(capability)}
            >
              <div className="flex items-start space-x-3">
                <div className={`
                  flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center
                  ${isSelected 
                    ? 'bg-blue-500 border-blue-500' 
                    : 'bg-white border-gray-300'
                  }
                `}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                    {CAPABILITY_LABELS[capability]}
                  </p>
                  {capInfo && (
                    <p className="text-xs text-gray-600 mt-1">
                      {capInfo.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showRecommendations && selectedCapabilities.length > 0 && uniqueModules.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Рекомендуемые модули</h4>
              <div className="flex flex-wrap gap-2">
                {uniqueModules.map(module => (
                  <span
                    key={module}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-blue-700 border border-blue-300"
                  >
                    {module}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedCapabilities.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          Выберите хотя бы одну возможность вашей организации
        </p>
      )}
    </div>
  );
};

