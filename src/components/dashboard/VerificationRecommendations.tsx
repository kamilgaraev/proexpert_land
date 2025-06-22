import { useState, useEffect } from 'react';
import { 
  LightBulbIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { organizationService, VerificationRecommendations as VerificationRecommendationsType, UserMessage } from '@utils/api';

interface VerificationRecommendationsProps {
  organizationId?: number;
  onRecommendationsLoad?: (recommendations: VerificationRecommendationsType) => void;
}

const VerificationRecommendations: React.FC<VerificationRecommendationsProps> = ({ 
  organizationId, 
  onRecommendationsLoad 
}) => {
  const [recommendations, setRecommendations] = useState<VerificationRecommendationsType | null>(null);
  const [userMessage, setUserMessage] = useState<UserMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, [organizationId]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await organizationService.getVerificationRecommendations();
      if (response.success) {
        setRecommendations(response.data.recommendations);
        setUserMessage(response.data.user_message);
        onRecommendationsLoad?.(response.data.recommendations);
      }
    } catch (err: any) {
      console.error('Ошибка загрузки рекомендаций:', err);
      setError('Не удалось загрузить рекомендации');
    } finally {
      setLoading(false);
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon className="h-4 w-4 text-blue-500" />;
      default:
        return <InformationCircleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-construction-600"></div>
          <span className="text-sm text-gray-600">Загрузка рекомендаций...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center space-x-2 text-red-600">
          <XCircleIcon className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (!recommendations) {
    return null;
  }

  const hasIssues = recommendations.missing_fields.length > 0 || 
                   recommendations.field_issues.length > 0 || 
                   recommendations.verification_issues.length > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <LightBulbIcon className="h-5 w-5 text-yellow-500" />
            <h3 className="text-sm font-medium text-gray-900">Рекомендации по верификации</h3>
          </div>
          {recommendations.potential_score_increase > 0 && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              +{recommendations.potential_score_increase} баллов
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Прогресс верификации */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Текущий рейтинг</span>
            <span className="font-medium text-construction-600">
              {recommendations.current_score}/{recommendations.max_score}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-construction-500 to-construction-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${recommendations.current_score}%` }}
            ></div>
          </div>
        </div>

        {!hasIssues ? (
          <div className="flex items-center space-x-2 text-green-600 bg-green-50 rounded-lg p-3">
            <CheckCircleIcon className="h-4 w-4" />
            <span className="text-sm">Все данные заполнены корректно!</span>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Незаполненные поля */}
            {recommendations.missing_fields.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Незаполненные поля
                </h4>
                <div className="space-y-1">
                  {recommendations.missing_fields.map((field, index) => (
                    <div key={index} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-2">
                      <div>
                        <span className="font-medium text-gray-900">{field.name}</span>
                        {field.required && (
                          <span className="ml-1 text-xs text-red-500">*</span>
                        )}
                        <p className="text-xs text-gray-500 mt-0.5">{field.description}</p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        +{field.weight}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Проблемы с полями */}
            {recommendations.field_issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Требуют исправления
                </h4>
                <div className="space-y-1">
                  {recommendations.field_issues.map((issue, index) => (
                    <div key={index} className="flex items-center justify-between text-sm bg-yellow-50 rounded-lg p-2">
                      <div>
                        <span className="font-medium text-gray-900">{issue.name}</span>
                        <p className="text-xs text-gray-500 mt-0.5">{issue.description}</p>
                        <p className="text-xs text-yellow-600 mt-0.5">
                          Текущее значение: {issue.current_value}
                        </p>
                      </div>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        +{issue.weight}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Проблемы верификации */}
            {recommendations.verification_issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Замечания по верификации
                </h4>
                <div className="space-y-1">
                  {recommendations.verification_issues.map((issue, index) => (
                    <div 
                      key={index} 
                      className={`flex items-start space-x-2 text-sm rounded-lg p-2 border ${getSeverityColor(issue.severity)}`}
                    >
                      {getIssueIcon(issue.type)}
                      <span className="flex-1">{issue.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Кнопка автоверификации */}
        {recommendations.can_auto_verify && recommendations.potential_score_increase > 0 && (
          <div className="pt-2 border-t border-gray-200">
            <button className="w-full text-xs bg-construction-50 text-construction-700 hover:bg-construction-100 rounded-lg p-2 transition-colors">
              Запустить автоматическую верификацию для улучшения рейтинга
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationRecommendations; 