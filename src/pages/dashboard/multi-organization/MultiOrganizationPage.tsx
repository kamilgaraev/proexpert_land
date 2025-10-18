import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  multiOrganizationService, 
  CreateHoldingRequest,
  AddChildOrganizationRequest,
  HoldingOrganization,
} from '@/utils/api';
import { getTokenFromStorages } from '@/utils/api';
import { 
  BuildingOfficeIcon, 
  RocketLaunchIcon,
  ChartBarIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

export const MultiOrganizationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  
  // Проверяем тип организации
  const userOrg = user && 'organization' in user ? (user.organization as any) : null;
  const isHoldingOrg = userOrg?.organization_type === 'holding';

  // Форма создания холдинга
  const [formData, setFormData] = useState<CreateHoldingRequest>({
    name: `${userOrg?.name || 'Организация'} Холдинг`,
    description: '',
    max_child_organizations: 10,
    settings: {
      consolidated_reports: true,
      shared_materials: true,
      unified_billing: true,
    },
  });

  // Дочерние организации (если уже холдинг)
  const [childOrganizations, setChildOrganizations] = useState<HoldingOrganization[]>([]);
  const [showAddChildModal, setShowAddChildModal] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleCreateHolding = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
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
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Если уже холдинг - показываем информацию о переходе на поддомен
  if (isHoldingOrg) {
    const hostname = window.location.hostname;
    const isOnSubdomain = hostname !== 'prohelper.pro' && 
                          hostname !== 'lk.prohelper.pro' && 
                          !hostname.includes('localhost');

    if (!isOnSubdomain) {
      return (
        <div className="max-w-4xl mx-auto py-8">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-12 text-white">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <CheckCircleIcon className="w-12 h-12" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-center mb-3">
                Холдинг уже создан!
              </h1>
              <p className="text-center text-blue-100 max-w-2xl mx-auto">
                Ваша организация преобразована в холдинг. Для управления дочерними организациями 
                перейдите на специальный поддомен холдинга.
              </p>
            </div>

            <div className="p-8">
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Перейдите на панель управления холдингом:
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Управление дочерними организациями, консолидированная отчетность и другие функции 
                  доступны на специальном поддомене вашего холдинга.
                </p>
                <button
                  onClick={() => {
                    // Попробуем получить slug из userOrg или использовать название
                    window.location.href = 'https://proverocka.prohelper.pro/dashboard';
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg font-semibold"
                >
                  <BuildingOfficeIcon className="w-5 h-5" />
                  Перейти на панель холдинга
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // Форма создания холдинга
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Мультиорганизация</h1>
        <p className="text-gray-600 mt-1">
          Создайте холдинг и управляйте дочерними организациями
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-12 text-white">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <RocketLaunchIcon className="w-12 h-12" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center mb-3">
            Создание холдинга
          </h2>
          <p className="text-center text-blue-100 max-w-2xl mx-auto">
            Преобразуйте вашу организацию в холдинг для управления дочерними компаниями, 
            консолидации отчетности и централизованного контроля проектов
          </p>
        </div>

        <form onSubmit={handleCreateHolding} className="p-8">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Например: НеоСтрой Холдинг"
              />
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
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
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Общие материалы</div>
                  <div className="text-xs text-gray-500">Совместное использование материалов</div>
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
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
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
                Создавайте дочерние организации
              </p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ChartBarIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Сводная аналитика</h3>
              <p className="text-xs text-gray-600">
                Консолидированные отчеты
              </p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <UsersIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Централизованный контроль</h3>
              <p className="text-xs text-gray-600">
                Управление доступами
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
                <span>Ваша организация "{userOrg?.name}" станет родительской организацией холдинга</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Будет создан уникальный поддомен для управления холдингом</span>
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
              disabled={creating}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-semibold"
            >
              {creating ? (
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
              onClick={() => navigate('/dashboard')}
              disabled={creating}
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

