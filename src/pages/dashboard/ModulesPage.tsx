import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PuzzlePieceIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  ChatBubbleBottomCenterTextIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PlayIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline';
import { PageLoading } from '@components/common/PageLoading';
import ConfirmDeleteModal from '@components/shared/ConfirmDeleteModal';
import { ModuleCancelButton } from '@components/dashboard/ModuleCancelButton';
import type { ActivatedModule, OrganizationModule, ModuleWithActivation } from '@utils/api';

const categoryIcons: Record<string, any> = {
  analytics: ChartBarIcon,
  integrations: GlobeAltIcon,
  automation: Cog6ToothIcon,
  customization: PuzzlePieceIcon,
  security: ShieldCheckIcon,
  support: ChatBubbleBottomCenterTextIcon,
  organization: BuildingOffice2Icon,
};

const categoryNames: Record<string, string> = {
  analytics: 'Аналитика и отчеты',
  integrations: 'Интеграции',
  automation: 'Автоматизация',
  customization: 'Кастомизация',
  security: 'Безопасность',
  support: 'Поддержка',
  organization: 'Организация',
};

const ModulesPage = () => {
  const [modules, _setModules] = useState<ActivatedModule[] | null>(null);
  const [expiringModules, _setExpiringModules] = useState<ActivatedModule[]>([]);
  const [loading, _setLoading] = useState(false);
  const [error, _setError] = useState<string | null>(null);
  
  const fetchModules = async () => {};
  const fetchAvailableModules = async () => {};
  const fetchExpiringModules = async () => {};
  const activateModule = async (_params: any) => {};
  const deactivateModule = async (_id: number) => {};
  const renewModule = async (_id: number) => {};
  const getAvailableModulesByCategory = (_category: string): ModuleWithActivation[] => [];
  const getCancelPreview = async (_moduleSlug: string) => null;
  const cancelModule = async (_moduleSlug: string, _cancelData: any) => {};

  const [selectedCategory, setSelectedCategory] = useState('analytics');
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<OrganizationModule | null>(null);
  const [activatingModuleId, setActivatingModuleId] = useState<number | null>(null);

  useEffect(() => {
    fetchModules();
    fetchAvailableModules();
    fetchExpiringModules();
  }, [fetchModules, fetchAvailableModules, fetchExpiringModules]);

  const handleActivateModule = async (moduleItem: ModuleWithActivation) => {
    try {
      setActivatingModuleId(moduleItem.module.id);
      await activateModule({
        module_id: moduleItem.module.id,
        payment_method: 'balance',
      });
    } catch (error) {
      console.error('Ошибка активации модуля:', error);
    } finally {
      setActivatingModuleId(null);
    }
  };

  const handleDeactivateModule = async (moduleId: number) => {
    try {
      await deactivateModule(moduleId);
      setShowDeactivateModal(false);
      setSelectedModule(null);
    } catch (error) {
      console.error('Ошибка деактивации модуля:', error);
    }
  };

  const handleRenewModule = async (moduleId: number) => {
    try {
      await renewModule(moduleId);
    } catch (error) {
      console.error('Ошибка продления модуля:', error);
    }
  };

  const handleCancelModule = async (moduleSlug: string, reason: string) => {
    try {
      await cancelModule(moduleSlug, { confirm: true, reason });
    } catch (error) {
      console.error('Ошибка отмены модуля:', error);
    }
  };


  const getModuleStatus = (module: ActivatedModule) => {
    if (module.status === 'expired') return 'expired';
    if (module.status === 'pending') return 'pending';
    if (module.expires_at) {
      const daysUntilExpiration = Math.ceil((new Date(module.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiration <= 7) return 'expiring';
    }
    return module.status === 'active' ? 'active' : 'inactive';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'expired': return 'text-red-600 bg-red-50';
      case 'expiring': return 'text-yellow-600 bg-yellow-50';
      case 'pending': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'expired': return 'Истек';
      case 'expiring': return 'Истекает';
      case 'pending': return 'Ожидает';
      default: return 'Неактивен';
    }
  };

  if (loading && !modules) {
    return <PageLoading message="Загрузка модулей..." />;
  }

  const categories = Object.keys(categoryNames);
  const currentModules = getAvailableModulesByCategory(selectedCategory);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Модули организации</h1>
          <p className="text-gray-600 mt-2">Управление дополнительными функциями платформы</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {expiringModules.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-yellow-800 font-medium">Истекающие модули</h3>
          </div>
          <p className="text-yellow-700 mt-1">
            У вас есть {expiringModules.length} модулей, которые истекают в ближайшие 7 дней
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {categories.map((category) => {
              const Icon = categoryIcons[category];
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedCategory === category
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{categoryNames[category]}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {currentModules.length === 0 ? (
            <div className="text-center py-12">
              <PuzzlePieceIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Нет модулей</h3>
              <p className="text-gray-500">В этой категории пока нет доступных модулей</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(currentModules) ? currentModules.filter(moduleItem => moduleItem?.module).map((moduleItem) => {
                const status = moduleItem.is_activated && moduleItem.activation ? getModuleStatus(moduleItem.activation) : 'inactive';
                const statusColor = getStatusColor(status);
                const statusText = getStatusText(status);

                return (
                  <motion.div
                    key={moduleItem.module.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                          <PuzzlePieceIcon className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{moduleItem.module?.name}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                            {statusText}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">{moduleItem.module?.description}</p>

                    <div className="mb-4">
                      <p className="text-2xl font-bold text-gray-900">
                        {Number(moduleItem.module?.price || 0).toLocaleString('ru-RU')} ₽
                        <span className="text-sm font-normal text-gray-500">/мес</span>
                      </p>
                    </div>

                    {moduleItem.module?.features && moduleItem.module.features.length > 0 && (
                      <div className="mb-4">
                        <ul className="space-y-1">
                          {moduleItem.module.features.slice(0, 3).map((feature: string, index: number) => (
                            <li key={index} className="flex items-center text-sm text-gray-600">
                              <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {moduleItem.expires_at && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center text-sm text-gray-600">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          Действует до: {new Date(moduleItem.expires_at).toLocaleDateString('ru-RU')}
                        </div>
                        {moduleItem.days_until_expiration !== null && moduleItem.days_until_expiration > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Осталось дней: {moduleItem.days_until_expiration}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex space-x-2">
                      {moduleItem.is_activated && moduleItem.activation?.status === 'active' ? (
                        <>
                          {status === 'expiring' && moduleItem.activation && (
                            <button
                              type="button"
                              onClick={() => handleRenewModule(moduleItem.activation!.id)}
                              disabled={loading}
                              className="flex-1 flex items-center justify-center px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                            >
                              <ArrowPathIcon className="h-4 w-4 mr-2" />
                              Продлить
                            </button>
                          )}
                          {moduleItem.activation && (
                            <ModuleCancelButton
                              module={moduleItem.activation}
                              onCancelPreview={getCancelPreview}
                              onCancel={handleCancelModule}
                              loading={loading}
                            />
                          )}
                        </>
                      ) : moduleItem.is_activated && moduleItem.activation?.status === 'pending' ? (
                        <div className="w-full flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg">
                          <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                          Активация...
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleActivateModule(moduleItem)}
                          disabled={loading || activatingModuleId === moduleItem.module.id}
                          className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50"
                        >
                          {activatingModuleId === moduleItem.module.id ? (
                            <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <PlayIcon className="h-4 w-4 mr-2" />
                          )}
                          Активировать
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              }) : []}
            </div>
          )}
        </div>
      </div>

      {showDeactivateModal && selectedModule && (
        <ConfirmDeleteModal
          isOpen={showDeactivateModal}
          title="Деактивировать модуль"
          message={`Вы уверены, что хотите деактивировать модуль "${selectedModule.name}"?`}
          onConfirm={() => handleDeactivateModule(selectedModule.id)}
          onClose={() => {
            setShowDeactivateModal(false);
            setSelectedModule(null);
          }}
        />
      )}
    </div>
  );
};

export default ModulesPage; 