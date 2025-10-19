import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BuildingOfficeIcon,
  UsersIcon,
  FolderOpenIcon,
  PlusIcon,
  EyeIcon,
  PhoneIcon,
  EnvelopeIcon,
  BanknotesIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import { multiOrganizationService, getTokenFromStorages, type AddChildOrganizationRequest, type HoldingOrganization } from '@utils/api';
import { SEOHead } from '@components/shared/SEOHead';
import { StatCard, LoadingSpinner, PageHeader, Modal, DataTable } from '@components/holding/shared';

const HoldingOrganizationsPage = () => {
  const [organizations, setOrganizations] = useState<HoldingOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [holdingName, setHoldingName] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const navigate = useNavigate();
  const [parentOrgId, setParentOrgId] = useState<number>(0);

  const initialOrgForm: AddChildOrganizationRequest = {
    group_id: parentOrgId,
    name: '',
    description: '',
    inn: '',
    kpp: '',
    address: '',
    phone: '',
    email: '',
    owner: {
      name: '',
      email: '',
      password: '',
    },
  };

  const [newOrgForm, setNewOrgForm] = useState<AddChildOrganizationRequest>(initialOrgForm);
  const [savingOrg, setSavingOrg] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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

          try {
            const hierarchyResp = await multiOrganizationService.getHierarchy();
            const grpId = hierarchyResp.data?.data?.parent?.group_id ?? 0;
            setParentOrgId(grpId);
          } catch (e) {
          }
        } else {
          throw new Error('Неверный поддомен');
        }
      } catch (err) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // navigate - стабильная функция, не нужна в зависимостях

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      setSavingOrg(true);
      const resp = await multiOrganizationService.addChildOrganization(newOrgForm);

      if (resp.data && resp.data.success === false) {
        setFormError(resp.data.message || 'Ошибка добавления организации');
        return;
      }

      setShowAddModal(false);
      setNewOrgForm({ ...initialOrgForm, group_id: parentOrgId });

      const token = getTokenFromStorages();
      if (token) {
        const hostname = window.location.hostname;
        const mainDomain = 'prohelper.pro';
        if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
          setOrganizations(prev => [...prev, (resp.data?.data ?? newOrgForm) as any]);
        } else if (hostname !== mainDomain && hostname.endsWith(`.${mainDomain}`)) {
          const slug = hostname.split('.')[0];
          const data = await multiOrganizationService.getHoldingOrganizations(slug, token);
          setOrganizations(data || []);
        }
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        const serverData = error.response.data;
        if (serverData.message) setFormError(serverData.message);
      } else {
        setFormError(error.message || 'Неизвестная ошибка');
      }
    } finally {
      setSavingOrg(false);
    }
  };

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = !searchTerm || 
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.tax_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && org.stats) ||
      (statusFilter === 'inactive' && !org.stats);
    
    return matchesSearch && matchesStatus;
  });

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
    return <LoadingSpinner size="lg" text="Загрузка организаций..." fullScreen />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="bg-red-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <BuildingOfficeIcon className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-red-800 mb-3">Ошибка загрузки</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-slate-700 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Назад к панели
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SEOHead 
        title={`Организации - ${holdingName}`}
        description={`Список организаций входящих в холдинг ${holdingName}`}
        keywords="организации, холдинг, дочерние компании"
      />

      <PageHeader
        title="Организации холдинга"
        subtitle={holdingName}
        icon={<BuildingOfficeIcon className="w-8 h-8" />}
        actions={
          <>
              <button
              onClick={() => {}}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
              <ArrowDownTrayIcon className="w-5 h-5" />
              Экспорт
              </button>
              
              <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-slate-700 text-white shadow-md' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list' 
                    ? 'bg-slate-700 text-white shadow-md' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                  <ListBulletIcon className="h-5 w-5" />
                </button>
              </div>

              <button 
              onClick={() => {
                setNewOrgForm((prev) => ({ ...prev, group_id: parentOrgId }));
                setShowAddModal(true);
              }}
              className="bg-slate-700 hover:bg-slate-800 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all"
            >
                <PlusIcon className="h-5 w-5" />
              Добавить
              </button>
          </>
        }
      />

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск по названию, ИНН или email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="relative">
              <FunnelIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none transition-all"
              >
                <option value="all">Все статусы</option>
                <option value="active">Активные</option>
                <option value="inactive">Неактивные</option>
              </select>
            </div>

          <div className="text-right">
            <p className="text-sm text-gray-600">Найдено организаций</p>
            <p className="text-2xl font-bold text-gray-900">{filteredOrganizations.length}</p>
              </div>
            </div>
          </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Организаций"
          value={organizations.length}
          icon={<BuildingOfficeIcon className="w-8 h-8" />}
          colorScheme="orange"
        />

        <StatCard
          title="Сотрудников"
          value={totalStats.users}
          icon={<UsersIcon className="w-8 h-8" />}
          colorScheme="blue"
        />

        <StatCard
          title="Проектов"
          value={totalStats.projects}
          icon={<FolderOpenIcon className="w-8 h-8" />}
          colorScheme="green"
        />

        <StatCard
          title="Оборот"
          value={formatCurrency(totalStats.value)}
          icon={<BanknotesIcon className="w-8 h-8" />}
          colorScheme="purple"
        />
              </div>

          {filteredOrganizations.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12 text-center">
              <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <BuildingOfficeIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Нет организаций</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Добавьте первую дочернюю организацию для начала работы с холдингом
              </p>
              <button 
                onClick={() => {
                setNewOrgForm((prev) => ({ ...prev, group_id: parentOrgId }));
                setShowAddModal(true);
              }}
              className="bg-slate-700 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Добавить организацию
            </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredOrganizations.map((org, index) => (
                <motion.div
                  key={org.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * index }}
                  whileHover={{ y: -5 }}
                >
              <div className="h-2 bg-slate-700"></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-700 p-3 rounded-xl">
                      <BuildingOfficeIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-slate-700 transition-colors">
                            {org.name}
                          </h3>
                          <p className="text-sm text-gray-600">Дочерняя организация</p>
                        </div>
                      </div>
                  <button 
                    onClick={() => {}}
                    className="text-gray-400 hover:text-slate-700 transition-colors"
                  >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </div>

                      {org.description && (
                  <p className="text-gray-600 text-sm mb-4">{org.description}</p>
                      )}
                      
                <div className="space-y-2 mb-4 text-sm text-gray-600">
                        {org.tax_number && (
                    <div>ИНН: <span className="font-medium text-gray-900">{org.tax_number}</span></div>
                          )}
                          {org.email && (
                    <div className="flex items-center gap-1">
                              <EnvelopeIcon className="h-4 w-4" />
                      <span className="truncate">{org.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{org.stats?.users_count || 0}</p>
                        <p className="text-xs text-gray-600">Сотрудников</p>
                      </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{org.stats?.projects_count || 0}</p>
                        <p className="text-xs text-gray-600">Проектов</p>
                      </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{org.stats?.contracts_count || 0}</p>
                        <p className="text-xs text-gray-600">Договоров</p>
                      </div>
                    </div>

                    {(org.stats?.active_contracts_value || 0) > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Оборот</span>
                      <span className="font-bold text-green-600">
                            {formatCurrency(org.stats?.active_contracts_value || 0)}
                          </span>
                        </div>
                      </div>
                    )}

                <div className="flex gap-2">
                  <button 
                    className="flex-1 bg-slate-700 hover:bg-slate-800 text-white py-2 px-4 rounded-xl text-sm font-medium hover:shadow-lg transition-all flex items-center justify-center gap-1"
                  >
                        <ChartBarIcon className="h-4 w-4" />
                    Статистика
                      </button>
                      <button 
                    className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-700 py-2 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <UsersIcon className="h-4 w-4" />
                    Пользователи
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
        <DataTable
          data={filteredOrganizations}
          keyExtractor={(org) => org.id}
          columns={[
            {
              key: 'name',
              label: 'Организация',
              render: (org) => (
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-orange-500 to-blue-600 p-2 rounded-lg">
                    <BuildingOfficeIcon className="h-5 w-5 text-white" />
                            </div>
                  <div>
                    <div className="font-medium text-gray-900">{org.name}</div>
                    {org.tax_number && (
                      <div className="text-sm text-gray-500">ИНН: {org.tax_number}</div>
                    )}
                              </div>
                            </div>
              ),
            },
            {
              key: 'contacts',
              label: 'Контакты',
              render: (org) => (
                <div className="text-sm">
                            {org.phone && (
                    <div className="flex items-center gap-1 mb-1">
                                <PhoneIcon className="h-4 w-4 text-gray-400" />
                                <span>{org.phone}</span>
                              </div>
                            )}
                            {org.email && (
                    <div className="flex items-center gap-1">
                                <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                                <span className="truncate max-w-[200px]">{org.email}</span>
                              </div>
                            )}
                          </div>
              ),
            },
            {
              key: 'stats',
              label: 'Статистика',
              render: (org) => (
                <div className="flex gap-4 text-sm">
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
              ),
            },
            {
              key: 'value',
              label: 'Оборот',
              render: (org) => (
                <div className="font-medium text-green-600">
                            {formatCurrency(org.stats?.active_contracts_value || 0)}
                          </div>
              ),
            },
            {
              key: 'actions',
              label: 'Действия',
              width: '120px',
              render: () => (
                <div className="flex gap-2">
                  <button className="text-orange-600 hover:text-orange-700 transition-colors">
                              <EyeIcon className="h-5 w-5" />
                            </button>
                  <button className="text-blue-600 hover:text-blue-700 transition-colors">
                              <ChartBarIcon className="h-5 w-5" />
                            </button>
                  <button className="text-purple-600 hover:text-purple-700 transition-colors">
                              <UsersIcon className="h-5 w-5" />
                            </button>
                </div>
              ),
            },
          ]}
        />
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Добавить дочернюю организацию"
        size="xl"
        footer={
          <div className="flex gap-3">
                            <button 
              type="button"
              onClick={() => setShowAddModal(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors"
            >
              Отмена
                            </button>
                            <button 
              onClick={handleCreateOrganization}
              disabled={savingOrg}
              className="flex-1 bg-slate-700 hover:bg-slate-800 text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
            >
              {savingOrg ? 'Добавление...' : 'Добавить'}
                            </button>
                          </div>
        }
      >
        <form onSubmit={handleCreateOrganization} className="space-y-4">
              {formError && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-sm">
                  {formError}
                </div>
          )}
          
                  <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Название *</label>
                    <input
                      type="text"
                      required
              value={newOrgForm.name}
              onChange={(e) => setNewOrgForm({ ...newOrgForm, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
            <textarea
              value={newOrgForm.description}
              onChange={(e) => setNewOrgForm({ ...newOrgForm, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              rows={3}
            ></textarea>
                  </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ИНН</label>
                    <input
                      type="text"
                value={newOrgForm.inn}
                onChange={(e) => setNewOrgForm({ ...newOrgForm, inn: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">КПП</label>
                    <input
                      type="text"
                value={newOrgForm.kpp}
                onChange={(e) => setNewOrgForm({ ...newOrgForm, kpp: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
                  </div>

                  <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Адрес</label>
                    <input
              type="text"
              value={newOrgForm.address}
              onChange={(e) => setNewOrgForm({ ...newOrgForm, address: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                  <input
                type="tel"
                value={newOrgForm.phone}
                onChange={(e) => setNewOrgForm({ ...newOrgForm, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={newOrgForm.email}
                onChange={(e) => setNewOrgForm({ ...newOrgForm, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
              </div>
            </div>

          <hr className="my-6 border-gray-200" />
          
          <h4 className="text-lg font-bold text-gray-900">Владелец организации</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Имя *</label>
              <input
                type="text"
                required
                value={newOrgForm.owner.name}
                onChange={(e) => setNewOrgForm({ ...newOrgForm, owner: { ...newOrgForm.owner, name: e.target.value } })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
                    </div>
                      <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                required
                value={newOrgForm.owner.email}
                onChange={(e) => setNewOrgForm({ ...newOrgForm, owner: { ...newOrgForm.owner, email: e.target.value } })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
                      </div>
                    </div>
                    
                    <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Пароль *</label>
            <input
              type="password"
              required
              value={newOrgForm.owner.password}
              onChange={(e) => setNewOrgForm({ ...newOrgForm, owner: { ...newOrgForm.owner, password: e.target.value } })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
                    </div>
        </form>
      </Modal>
    </div>
  );
};

export default HoldingOrganizationsPage; 
