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
  XMarkIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PlayIcon,
  StopIcon,
} from '@heroicons/react/24/outline';
import { useModules } from '@hooks/useModules';
import { PageLoading } from '@components/common/PageLoading';
import ConfirmDeleteModal from '@components/shared/ConfirmDeleteModal';
import type { ActivatedModule, OrganizationModule } from '@utils/api';

const categoryIcons: Record<string, any> = {
  analytics: ChartBarIcon,
  integrations: GlobeAltIcon,
  automation: Cog6ToothIcon,
  customization: PuzzlePieceIcon,
  security: ShieldCheckIcon,
  support: ChatBubbleBottomCenterTextIcon,
};

const categoryNames: Record<string, string> = {
  analytics: 'Аналитика и отчеты',
  integrations: 'Интеграции',
  automation: 'Автоматизация',
  customization: 'Кастомизация',
  security: 'Безопасность',
  support: 'Поддержка',
};

const ModulesPage = () => {
  const {
    modules,
    availableModules,
    expiringModules,
    loading,
    error,
    fetchModules,
    fetchAvailableModules,
    fetchExpiringModules,
    activateModule,
    deactivateModule,
    renewModule,
    getModulesByCategory,
  } = useModules();

  const [selectedCategory, setSelectedCategory] = useState('analytics');
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<OrganizationModule | null>(null);
  const [activatingModuleId, setActivatingModuleId] = useState<number | null>(null);

  useEffect(() => {
    fetchModules();
    fetchAvailableModules();
    fetchExpiringModules();
  }, [fetchModules, fetchAvailableModules, fetchExpiringModules]);

  const handleActivateModule = async (module: OrganizationModule) => {
    try {
      setActivatingModuleId(module.id);
      await activateModule({
        module_id: module.id,
        payment_method: 'balance',
      });
      setShowActivateModal(false);
      setSelectedModule(null);
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
      await renewModule(moduleId, { days: 30 });
    } catch (error) {
      console.error('Ошибка продления модуля:', error);
    }
  };

  const getModuleStatus = (module: ActivatedModule) => {
    if (!module.is_activated) return 'inactive';
    if (module.status === 'expired') return 'expired';
    if (module.days_until_expiration !== null && module.days_until_expiration <= 7) return 'expiring';
    return 'active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'expired': return 'text-red-600 bg-red-50';
      case 'expiring': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'expired': return 'Истек';
      case 'expiring': return 'Истекает';
      default: return 'Неактивен';
    }
  };

  if (loading && !modules) {
    return <PageLoading message="Загрузка модулей..." />;
  }

  const categories = Object.keys(categoryNames);
  const currentModules = getModulesByCategory(selectedCategory);

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
                      ? 'border-blue-500 text-blue-600'
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
              {currentModules.map((moduleItem) => {
                const status = getModuleStatus(moduleItem);
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
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <PuzzlePieceIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{moduleItem.module.name}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                            {statusText}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">{moduleItem.module.description}</p>

                    <div className="mb-4">
                      <p className="text-2xl font-bold text-gray-900">
                        {moduleItem.module.price.toLocaleString('ru-RU')} ₽
                        <span className="text-sm font-normal text-gray-500">/мес</span>
                      </p>
                    </div>

                    {moduleItem.module.features.length > 0 && (
                      <div className="mb-4">
                        <ul className="space-y-1">
                          {moduleItem.module.features.slice(0, 3).map((feature, index) => (
                            <li key={index} className="flex items-center text-sm text-gray-600">
                              <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {moduleItem.is_activated && moduleItem.expires_at && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center text-sm text-gray-600">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          Действует до: {new Date(moduleItem.expires_at).toLocaleDateString('ru-RU')}
                        </div>
                        {moduleItem.days_until_expiration !== null && (
                          <p className="text-xs text-gray-500 mt-1">
                            Осталось дней: {moduleItem.days_until_expiration}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex space-x-2">
                      {moduleItem.is_activated ? (
                        <>
                          {status === 'expiring' && (
                            <button
                              onClick={() => handleRenewModule(moduleItem.module.id)}
                              disabled={loading}
                              className="flex-1 flex items-center justify-center px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                            >
                              <ArrowPathIcon className="h-4 w-4 mr-2" />
                              Продлить
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedModule(moduleItem.module);
                              setShowDeactivateModal(true);
                            }}
                            disabled={loading}
                            className="flex items-center justify-center px-4 py-2 border border-red-300 text-red-700 text-sm font-medium rounded-lg hover:bg-red-50 disabled:opacity-50"
                          >
                            <StopIcon className="h-4 w-4 mr-2" />
                            Деактивировать
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleActivateModule(moduleItem.module)}
                          disabled={loading || activatingModuleId === moduleItem.module.id}
                          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
              })}
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