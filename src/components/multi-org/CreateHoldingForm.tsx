import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { multiOrganizationService, CreateHoldingRequest } from '@/utils/api';
import { 
  BuildingOfficeIcon, 
  RocketLaunchIcon,
  ChartBarIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface CreateHoldingFormProps {
  organizationName: string;
  onCancel: () => void;
}

export const CreateHoldingForm = ({ organizationName, onCancel }: CreateHoldingFormProps) => {
  const [formData, setFormData] = useState<CreateHoldingRequest>({
    name: `${organizationName} Холдинг`,
    description: '',
    max_child_organizations: 10,
    settings: {
      consolidated_reports: true,
      shared_materials: true,
      unified_billing: true,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await multiOrganizationService.createHolding(formData);
      
      if (response.data?.success) {
        const slug = response.data?.data?.holding?.slug || response.data?.data?.slug;
        
        if (slug) {
          // Редирект на поддомен холдинга
          const hostname = window.location.hostname;
          if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
            // В режиме разработки просто перезагружаем страницу
            window.location.reload();
          } else {
            // В продакшене редиректим на поддомен
            window.location.href = `https://${slug}.prohelper.pro/dashboard`;
          }
        } else {
          // Если нет slug, просто перезагружаем
          window.location.reload();
        }
      } else {
        setError(response.data?.message || 'Ошибка создания холдинга');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Произошла ошибка при создании холдинга');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12 text-white">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <RocketLaunchIcon className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center mb-3">
            Создание холдинга
          </h1>
          <p className="text-center text-blue-100 max-w-2xl mx-auto">
            Преобразуйте вашу организацию в холдинг для управления дочерними компаниями, 
            консолидации отчетности и централизованного контроля проектов
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <XCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-900">Ошибка</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-6 mb-8">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Название холдинга <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Например: НеоСтрой Холдинг"
              />
              <p className="mt-1 text-sm text-gray-500">
                Это название будет использоваться для идентификации вашего холдинга
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Краткое описание деятельности холдинга..."
              />
            </div>

            <div>
              <label htmlFor="max_orgs" className="block text-sm font-medium text-gray-700 mb-2">
                Максимальное количество дочерних организаций
              </label>
              <input
                type="number"
                id="max_orgs"
                min="1"
                max="100"
                value={formData.max_child_organizations}
                onChange={(e) => setFormData({ ...formData, max_child_organizations: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Настройки холдинга</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.settings?.consolidated_reports ?? true}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: { ...formData.settings, consolidated_reports: e.target.checked }
                  })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Консолидированная отчетность</div>
                  <div className="text-xs text-gray-500">Сводные отчеты по всем организациям</div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.settings?.shared_materials ?? true}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: { ...formData.settings, shared_materials: e.target.checked }
                  })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Общие материалы</div>
                  <div className="text-xs text-gray-500">Совместное использование материалов между организациями</div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.settings?.unified_billing ?? true}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: { ...formData.settings, unified_billing: e.target.checked }
                  })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Единый биллинг</div>
                  <div className="text-xs text-gray-500">Централизованное управление подписками</div>
                </div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Управление организациями</h3>
              <p className="text-xs text-gray-600">
                Создавайте и управляйте дочерними организациями
              </p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ChartBarIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Сводная аналитика</h3>
              <p className="text-xs text-gray-600">
                Консолидированные отчеты и метрики
              </p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <UsersIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Централизованный контроль</h3>
              <p className="text-xs text-gray-600">
                Управление доступами и правами
              </p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
              <CheckCircleIcon className="w-5 h-5 text-blue-600" />
              Что произойдет при создании:
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Ваша организация "{organizationName}" станет родительской организацией холдинга</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Будет создан уникальный поддомен для вашего холдинга</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Вы сможете добавлять дочерние организации и управлять ими</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Существующие проекты и данные сохранятся без изменений</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-semibold"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Создание...</span>
                </>
              ) : (
                <>
                  <RocketLaunchIcon className="w-5 h-5" />
                  <span>Создать холдинг</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

