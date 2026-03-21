import type { OrganizationCapability } from '@/types/organization-profile';
import { filterBusinessTypeOptions } from '@/utils/organizationProfile';

interface BusinessTypeSelectorProps {
  selectedType: OrganizationCapability | null;
  onChange: (type: OrganizationCapability) => void;
  disabled?: boolean;
  availableTypes?: OrganizationCapability[];
}

export const BusinessTypeSelector = ({
  selectedType,
  onChange,
  disabled = false,
  availableTypes = [],
}: BusinessTypeSelectorProps) => {
  const businessTypes = filterBusinessTypeOptions(availableTypes);

  if (businessTypes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center text-sm text-gray-500">
        Сначала выберите направления деятельности организации, чтобы определить основной режим работы.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {businessTypes.map((type) => {
          const isSelected = selectedType === type.value;

          return (
            <div
              key={type.value}
              className={`
                relative rounded-lg border-2 p-4 transition-all duration-200
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                ${
                  isSelected
                    ? 'scale-105 border-construction-500 bg-construction-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-construction-300 hover:shadow-md'
                }
              `}
              onClick={() => !disabled && onChange(type.value)}
            >
              {isSelected && (
                <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-construction-500">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              <div className="space-y-2 text-center">
                <div className="text-4xl">{type.icon}</div>
                <h4 className={`text-base font-semibold ${isSelected ? 'text-construction-900' : 'text-gray-900'}`}>
                  {type.label}
                </h4>
                <p className="text-xs text-gray-600">{type.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {!selectedType && businessTypes.length > 1 && (
        <p className="py-2 text-center text-sm text-gray-500">
          Выберите основной режим работы, который должен открываться первым в личном кабинете.
        </p>
      )}
    </div>
  );
};
