interface BusinessTypeSelectorProps {
  selectedType: string | null;
  onChange: (type: string) => void;
  disabled?: boolean;
}

const BUSINESS_TYPES = [
  {
    value: 'general_contracting',
    label: 'Генеральный подряд',
    description: 'Управление всем строительным проектом',
    icon: '🏗️'
  },
  {
    value: 'subcontracting',
    label: 'Субподрядные работы',
    description: 'Специализированные работы для подрядчика',
    icon: '🔧'
  },
  {
    value: 'design',
    label: 'Проектирование',
    description: 'Разработка проектной документации',
    icon: '📐'
  },
  {
    value: 'construction_supervision',
    label: 'Строительный контроль',
    description: 'Технический надзор за строительством',
    icon: '👷'
  },
  {
    value: 'equipment_rental',
    label: 'Аренда техники',
    description: 'Предоставление строительной техники',
    icon: '🚜'
  },
  {
    value: 'materials_supply',
    label: 'Поставка материалов',
    description: 'Поставка строительных материалов',
    icon: '📦'
  },
  {
    value: 'consulting',
    label: 'Консалтинг',
    description: 'Консультационные услуги в строительстве',
    icon: '💼'
  },
  {
    value: 'facility_management',
    label: 'Эксплуатация объектов',
    description: 'Обслуживание и эксплуатация зданий',
    icon: '🏢'
  }
];

export const BusinessTypeSelector = ({
  selectedType,
  onChange,
  disabled = false
}: BusinessTypeSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BUSINESS_TYPES.map(type => {
          const isSelected = selectedType === type.value;

          return (
            <div
              key={type.value}
              className={`
                relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'border-construction-500 bg-construction-50 shadow-lg scale-105' 
                  : 'border-gray-200 bg-white hover:border-construction-300 hover:shadow-md'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => !disabled && onChange(type.value)}
            >
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-construction-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              <div className="text-center space-y-2">
                <div className="text-4xl">{type.icon}</div>
                <h4 className={`text-base font-semibold ${isSelected ? 'text-construction-900' : 'text-gray-900'}`}>
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

