interface ProfileCompletenessWidgetProps {
  completeness: number;
  missingFields?: string[];
  onComplete?: () => void;
  className?: string;
}

const FIELD_LABELS: Record<string, string> = {
  'capabilities': 'Возможности организации',
  'primary_business_type': 'Основной тип деятельности',
  'specializations': 'Специализации',
  'certifications': 'Сертификаты',
  'description': 'Описание организации',
  'contacts': 'Контактная информация'
};

export const ProfileCompletenessWidget = ({
  completeness,
  missingFields = [],
  onComplete,
  className = ''
}: ProfileCompletenessWidgetProps) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completeness / 100) * circumference;

  const getCompletenessColor = () => {
    if (completeness >= 90) return 'text-green-600';
    if (completeness >= 70) return 'text-construction-600';
    if (completeness >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletenessStrokeColor = () => {
    if (completeness >= 90) return '#10b981';
    if (completeness >= 70) return '#ea580c';
    if (completeness >= 50) return '#eab308';
    return '#ef4444';
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Полнота профиля
      </h3>

      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <svg className="transform -rotate-90" width="140" height="140">
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke={getCompletenessStrokeColor()}
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getCompletenessColor()}`}>
                {completeness}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                заполнено
              </div>
            </div>
          </div>
        </div>
      </div>

      {missingFields.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Осталось заполнить:
          </h4>
          <ul className="space-y-2">
            {missingFields.map(field => (
              <li key={field} className="flex items-start space-x-2 text-sm">
                <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-gray-700">
                  {FIELD_LABELS[field] || field}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {completeness >= 100 ? (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-green-800">
            Профиль полностью заполнен!
          </span>
        </div>
      ) : (
        onComplete && (
          <button
            onClick={onComplete}
            className="mt-4 w-full px-4 py-2 bg-construction-600 text-white text-sm font-medium rounded-lg hover:bg-construction-700 transition-colors focus:outline-none focus:ring-2 focus:ring-construction-500 focus:ring-offset-2"
          >
            Завершить настройку профиля
          </button>
        )
      )}

      {completeness < 80 && (
        <p className="mt-3 text-xs text-gray-500 text-center">
          Рекомендуем заполнить профиль минимум на 80% для лучших результатов
        </p>
      )}
    </div>
  );
};

