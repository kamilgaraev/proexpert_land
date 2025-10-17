import { useState } from 'react';

interface BusinessTypeSelectorProps {
  selectedType: string | null;
  onChange: (type: string) => void;
  disabled?: boolean;
}

const BUSINESS_TYPES = [
  {
    value: 'general_contractor',
    label: 'Генподрядчик',
    description: 'Управление всем строительным проектом',
    icon: '🏗️'
  },
  {
    value: 'contractor',
    label: 'Подрядчик',
    description: 'Выполнение отдельных видов работ',
    icon: '👷'
  },
  {
    value: 'subcontractor',
    label: 'Субподрядчик',
    description: 'Специализированные работы для подрядчика',
    icon: '🔧'
  },
  {
    value: 'designer',
    label: 'Проектировщик',
    description: 'Разработка проектной документации',
    icon: '📐'
  },
  {
    value: 'customer',
    label: 'Заказчик',
    description: 'Заказ и контроль строительства',
    icon: '💼'
  },
  {
    value: 'supplier',
    label: 'Поставщик',
    description: 'Поставка материалов и оборудования',
    icon: '📦'
  }
];

export const BusinessTypeSelector = ({
  selectedType,
  onChange,
  disabled = false
}: BusinessTypeSelectorProps) => {
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BUSINESS_TYPES.map(type => {
          const isSelected = selectedType === type.value;
          const isHovered = hoveredType === type.value;

          return (
            <div
              key={type.value}
              className={`
                relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' 
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => !disabled && onChange(type.value)}
              onMouseEnter={() => setHoveredType(type.value)}
              onMouseLeave={() => setHoveredType(null)}
            >
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              <div className="text-center space-y-2">
                <div className="text-4xl">{type.icon}</div>
                <h4 className={`text-base font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                  {type.label}
                </h4>
                <p className="text-xs text-gray-600">
                  {type.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {!selectedType && (
        <p className="text-sm text-gray-500 text-center py-2">
          Выберите основной тип деятельности вашей организации
        </p>
      )}
    </div>
  );
};

