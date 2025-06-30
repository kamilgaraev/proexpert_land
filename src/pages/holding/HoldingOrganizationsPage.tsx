import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BuildingOfficeIcon,
  UsersIcon,
  FolderOpenIcon,
  ArrowLeftIcon,
  PlusIcon,
  EyeIcon,
  ChevronRightIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  BanknotesIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { multiOrganizationService, getTokenFromStorages } from '@utils/api';
import type { HoldingOrganization } from '@utils/api';
import { SEOHead } from '@components/shared/SEOHead';
import { useTheme } from '@components/shared/ThemeProvider';

const HoldingOrganizationsPage = () => {
  const [organizations, setOrganizations] = useState<HoldingOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [holdingName, setHoldingName] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();
  const { color, getThemeClasses } = useTheme();
  const theme = getThemeClasses();

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = getTokenFromStorages();
        if (!token) {
          navigate('/login');
          return;
        }

        const hostname = window.location.hostname;
        const mainDomain = 'prohelper.pro';
        let slug = '';
        
        if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
          slug = 'proverocka';
          setHoldingName('ООО НЕО СТРОЙ');
          
          const mockOrganizations: HoldingOrganization[] = [
            {
              id: 4,
              name: 'Тестовая',
              description: 'Дочерняя организация для тестирования',
              organization_type: 'child',
              hierarchy_level: 1,
              tax_number: '21312312312',
              registration_number: undefined,
              address: undefined,
              phone: undefined,
              email: 'kamilgaraev111323@gmail.com',
              created_at: '2025-06-23T23:21:38.000000Z',
              stats: {
                users_count: 1,
                projects_count: 0,
                contracts_count: 0,
                active_contracts_value: 0,
              }
            }
          ];
          setOrganizations(mockOrganizations);
        } else if (hostname !== mainDomain && hostname.endsWith(`.${mainDomain}`)) {
          slug = hostname.split('.')[0];
          const data = await multiOrganizationService.getHoldingOrganizations(slug, token);
          setOrganizations(data || []);
          const holdingData = await multiOrganizationService.getHoldingPublicInfo(slug);
          setHoldingName(holdingData?.holding?.name || 'Холдинг');
        } else {
          throw new Error('Неверный поддомен');
        }
      } catch (err) {
        console.error('Ошибка загрузки организаций:', err);
        if (err instanceof Error && err.message === 'UNAUTHORIZED') {
          navigate('/login');
          return;
        }
        setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    loadOrganizations();
  }, [navigate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalStats = organizations.reduce((acc, org) => ({
    users: acc.users + (org.stats?.users_count || 0),
    projects: acc.projects + (org.stats?.projects_count || 0),
    contracts: acc.contracts + (org.stats?.contracts_count || 0),
    value: acc.value + (org.stats?.active_contracts_value || 0),
  }), { users: 0, projects: 0, contracts: 0, value: 0 });

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.background} flex items-center justify-center`}>
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className={`animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-${color}-600 mx-auto mb-6`}></div>
          <p className="text-gray-600 text-lg font-medium">Загрузка организаций...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.background} flex items-center justify-center`}>
        <motion.div 
          className="text-center max-w-md mx-auto px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <BuildingOfficeIcon className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-red-800 mb-3">Ошибка загрузки</h1>
          <p className="text-red-600 mb-6 text-lg">{error}</p>
          <Link 
            to="/dashboard"
            className={`bg-gradient-to-r ${theme.gradient} hover:opacity-90 text-white px-6 py-3 rounded-xl inline-flex items-center space-x-2 font-semibold transition-all duration-200`}
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Назад к панели</span>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.background}`}>
      <SEOHead 
        title={`Организации - ${holdingName}`}
        description={`Список организаций входящих в холдинг ${holdingName}`}
        keywords="организации, холдинг, дочерние компании"
      />

      <motion.header 
        className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-6">
              <Link
                to="/dashboard"
                className={`flex items-center ${theme.text} hover:opacity-70 transition-all duration-200 group`}
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="font-medium">Назад к панели</span>
              </Link>
              <div className="h-8 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-4">
                <div className={`bg-gradient-to-r ${theme.gradient} p-3 rounded-xl shadow-lg`}>
                  <BuildingOfficeIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Организации холдинга</h1>
                  <p className="text-gray-600 font-medium">{holdingName}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? `bg-gradient-to-r ${theme.gradient} text-white shadow-md` 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'list' 
                      ? `bg-gradient-to-r ${theme.gradient} text-white shadow-md` 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ListBulletIcon className="h-5 w-5" />
                </button>
              </div>

              <button 
                onClick={() => setShowAddModal(true)}
                className={`bg-gradient-to-r ${theme.gradient} hover:opacity-90 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl`}
              >
                <PlusIcon className="h-5 w-5" />
                <span>Добавить</span>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50">
            <div className="flex items-center">
              <div className={`bg-gradient-to-r ${theme.gradient} p-3 rounded-xl`}>
                <BuildingOfficeIcon className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Организаций</p>
                <p className="text-3xl font-bold text-gray-900">{organizations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl">
                <UsersIcon className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Сотрудников</p>
                <p className="text-3xl font-bold text-gray-900">{totalStats.users}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-xl">
                <FolderOpenIcon className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Проектов</p>
                <p className="text-3xl font-bold text-gray-900">{totalStats.projects}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 rounded-xl">
                <BanknotesIcon className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Оборот</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalStats.value)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {organizations.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <BuildingOfficeIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Нет организаций</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Добавьте первую дочернюю организацию для начала работы с холдингом
              </p>
              <button 
                onClick={() => setShowAddModal(true)}
                className={`bg-gradient-to-r ${theme.gradient} hover:opacity-90 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl`}
              >
                Добавить организацию
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {organizations.map((org, index) => (
                <motion.div
                  key={org.id}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 overflow-hidden group cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  whileHover={{ y: -5 }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`bg-gradient-to-r ${theme.gradient} p-3 rounded-xl`}>
                          <BuildingOfficeIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                            {org.name}
                          </h3>
                          <p className="text-sm text-gray-600">Дочерняя организация</p>
                        </div>
                      </div>
                      <button className={`${theme.text} opacity-70 hover:opacity-100 transition-opacity duration-200`}>
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-3 mb-6">
                      {org.description && (
                        <p className="text-gray-600 text-sm">{org.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {org.tax_number && (
                          <span>ИНН: {org.tax_number}</span>
                        )}
                        {org.address && (
                          <div className="flex items-center space-x-1">
                            <MapPinIcon className="h-4 w-4" />
                            <span className="truncate max-w-[150px]">{org.address}</span>
                          </div>
                        )}
                      </div>

                      {(org.phone || org.email) && (
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {org.phone && (
                            <div className="flex items-center space-x-1">
                              <PhoneIcon className="h-4 w-4" />
                              <span>{org.phone}</span>
                            </div>
                          )}
                          {org.email && (
                            <div className="flex items-center space-x-1">
                              <EnvelopeIcon className="h-4 w-4" />
                              <span className="truncate max-w-[120px]">{org.email}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{org.stats?.users_count || 0}</p>
                        <p className="text-xs text-gray-600">Сотрудников</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{org.stats?.projects_count || 0}</p>
                        <p className="text-xs text-gray-600">Проектов</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{org.stats?.contracts_count || 0}</p>
                        <p className="text-xs text-gray-600">Договоров</p>
                      </div>
                    </div>

                    {(org.stats?.active_contracts_value || 0) > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Оборот</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(org.stats?.active_contracts_value || 0)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <button className={`flex-1 ${theme.primary} ${theme.hover} text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1`}>
                        <EyeIcon className="h-4 w-4" />
                        <span>Просмотр</span>
                      </button>
                      <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200">
                        Настройки
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Организация
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Контакты
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Статистика
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Оборот
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {organizations.map((org, index) => (
                      <motion.tr
                        key={org.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * index }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`flex-shrink-0 h-10 w-10 bg-gradient-to-r ${theme.gradient} rounded-lg flex items-center justify-center`}>
                              <BuildingOfficeIcon className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{org.name}</div>
                              <div className="text-sm text-gray-500">
                                {org.tax_number && `ИНН: ${org.tax_number}`}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {org.phone && (
                              <div className="flex items-center space-x-1 mb-1">
                                <PhoneIcon className="h-4 w-4 text-gray-400" />
                                <span>{org.phone}</span>
                              </div>
                            )}
                            {org.email && (
                              <div className="flex items-center space-x-1">
                                <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                                <span className="truncate max-w-[200px]">{org.email}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-4 text-sm">
                            <div className="text-center">
                              <div className="font-medium text-gray-900">{org.stats?.users_count || 0}</div>
                              <div className="text-gray-500">чел.</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-gray-900">{org.stats?.projects_count || 0}</div>
                              <div className="text-gray-500">проектов</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-gray-900">{org.stats?.contracts_count || 0}</div>
                              <div className="text-gray-500">договоров</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(org.stats?.active_contracts_value || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button className={`${theme.text} hover:opacity-80 transition-opacity duration-200`}>
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                              <ChevronRightIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {showAddModal && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowAddModal(false)}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Добавить организацию</h3>
            <p className="text-gray-600 mb-6">
              Эта функция будет доступна в ближайшее время. Для добавления новой организации обратитесь к администратору.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                Закрыть
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className={`flex-1 bg-gradient-to-r ${theme.gradient} hover:opacity-90 text-white py-2 px-4 rounded-lg font-medium transition-opacity duration-200`}
              >
                Понятно
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default HoldingOrganizationsPage; 