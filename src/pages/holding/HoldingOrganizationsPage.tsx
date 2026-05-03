import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BuildingOfficeIcon,
  UsersIcon,
  FolderOpenIcon,
  PlusIcon,
  PhoneIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  Squares2X2Icon,
  ListBulletIcon,
  DocumentTextIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import type { AddChildOrganizationRequest } from '@utils/api';
import { getTokenFromStorages } from '@utils/api';
import { SEOHead } from '@components/shared/SEOHead';
import { DataTable, LoadingSpinner, Modal, PageHeader, StatCard } from '@components/holding/shared';
import { holdingOrganizationsService, HoldingOrganizationsApiError } from '@/services/holdingOrganizationsService';
import type { HoldingOrganization } from '@/types/holding-organizations';

const buildInitialOrgForm = (groupId: number): AddChildOrganizationRequest => ({
  group_id: groupId,
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
});

const getErrorMessage = (error: unknown): string => {
  if (error instanceof HoldingOrganizationsApiError || error instanceof Error) {
    return error.message;
  }

  return 'Не удалось загрузить организации холдинга';
};

const HoldingOrganizationsPage = () => {
  const [organizations, setOrganizations] = useState<HoldingOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [holdingName, setHoldingName] = useState('Холдинг');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [parentOrgId, setParentOrgId] = useState(0);
  const [newOrgForm, setNewOrgForm] = useState<AddChildOrganizationRequest>(() => buildInitialOrgForm(0));
  const [savingOrg, setSavingOrg] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadOrganizations = useCallback(async () => {
    const token = getTokenFromStorages();

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [context, organizationsResult] = await Promise.all([
        holdingOrganizationsService.getContext(),
        holdingOrganizationsService.getOrganizations(),
      ]);

      setHoldingName(context.name);
      setParentOrgId(context.groupId);
      setNewOrgForm((current) => ({ ...current, group_id: context.groupId }));
      setOrganizations(organizationsResult.organizations);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void loadOrganizations();
  }, [loadOrganizations]);

  const handleCreateOrganization = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    try {
      setSavingOrg(true);
      await holdingOrganizationsService.createOrganization({
        ...newOrgForm,
        group_id: parentOrgId,
      });

      setShowAddModal(false);
      setNewOrgForm(buildInitialOrgForm(parentOrgId));
      await loadOrganizations();
    } catch (createError) {
      setFormError(getErrorMessage(createError));
    } finally {
      setSavingOrg(false);
    }
  };

  const filteredOrganizations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return organizations.filter((organization) => {
      const matchesSearch = !query
        || organization.name.toLowerCase().includes(query)
        || organization.tax_number?.toLowerCase().includes(query)
        || organization.email?.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'all'
        || (statusFilter === 'active' && organization.is_active !== false)
        || (statusFilter === 'inactive' && organization.is_active === false);

      return matchesSearch && matchesStatus;
    });
  }, [organizations, searchTerm, statusFilter]);

  const totalStats = useMemo(() => organizations.reduce(
    (summary, organization) => ({
      users: summary.users + organization.stats.users_count,
      projects: summary.projects + organization.stats.projects_count,
      contracts: summary.contracts + organization.stats.contracts_count,
    }),
    { users: 0, projects: 0, contracts: 0 },
  ), [organizations]);

  const emptyTitle = organizations.length === 0
    ? 'Организации пока не добавлены'
    : 'По заданным фильтрам ничего не найдено';

  const emptyDescription = organizations.length === 0
    ? 'Добавьте первую дочернюю организацию, чтобы вести структуру холдинга в одном контуре.'
    : 'Измените поисковый запрос или статус, чтобы увидеть нужные организации.';

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
          <h1 className="text-2xl font-bold text-red-800 mb-3">Не удалось загрузить организации</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => void loadOrganizations()}
              className="bg-slate-700 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <ArrowPathIcon className="h-5 w-5" />
              Повторить
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Назад к панели
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SEOHead
        title={`Организации - ${holdingName}`}
        description={`Список организаций, входящих в холдинг ${holdingName}`}
        keywords="организации, холдинг, дочерние компании"
      />

      <PageHeader
        title="Организации холдинга"
        subtitle={holdingName}
        icon={<BuildingOfficeIcon className="w-8 h-8" />}
        actions={(
          <>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900'
              }`}
              aria-label="Показать карточками"
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900'
              }`}
              aria-label="Показать списком"
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                setNewOrgForm(buildInitialOrgForm(parentOrgId));
                setFormError(null);
                setShowAddModal(true);
              }}
              className="bg-slate-700 hover:bg-slate-800 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <PlusIcon className="h-5 w-5" />
              Добавить
            </button>
          </>
        )}
      />

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по названию, ИНН или email"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="relative">
            <FunnelIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | 'active' | 'inactive')}
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
          title="Договоров"
          value={totalStats.contracts}
          icon={<DocumentTextIcon className="w-8 h-8" />}
          colorScheme="purple"
        />
      </div>

      {filteredOrganizations.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12 text-center">
          <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <BuildingOfficeIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">{emptyTitle}</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">{emptyDescription}</p>
          {organizations.length === 0 && (
            <button
              onClick={() => {
                setNewOrgForm(buildInitialOrgForm(parentOrgId));
                setFormError(null);
                setShowAddModal(true);
              }}
              className="bg-slate-700 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Добавить организацию
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrganizations.map((organization, index) => (
            <motion.div
              key={organization.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * index }}
              whileHover={{ y: -5 }}
            >
              <div className="h-2 bg-slate-700" />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-700 p-3 rounded-xl">
                      <BuildingOfficeIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-slate-700 transition-colors">
                        {organization.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {organization.is_active === false ? 'Неактивная организация' : 'Активная организация'}
                      </p>
                    </div>
                  </div>
                </div>

                {organization.description && (
                  <p className="text-gray-600 text-sm mb-4">{organization.description}</p>
                )}

                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  {organization.tax_number && (
                    <div>ИНН: <span className="font-medium text-gray-900">{organization.tax_number}</span></div>
                  )}
                  {organization.registration_number && (
                    <div>КПП: <span className="font-medium text-gray-900">{organization.registration_number}</span></div>
                  )}
                  {organization.address && (
                    <div className="flex items-center gap-1">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{organization.address}</span>
                    </div>
                  )}
                  {organization.phone && (
                    <div className="flex items-center gap-1">
                      <PhoneIcon className="h-4 w-4" />
                      <span>{organization.phone}</span>
                    </div>
                  )}
                  {organization.email && (
                    <div className="flex items-center gap-1">
                      <EnvelopeIcon className="h-4 w-4" />
                      <span className="truncate">{organization.email}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{organization.stats.users_count}</p>
                    <p className="text-xs text-gray-600">Сотрудников</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{organization.stats.projects_count}</p>
                    <p className="text-xs text-gray-600">Проектов</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{organization.stats.contracts_count}</p>
                    <p className="text-xs text-gray-600">Договоров</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <DataTable
          data={filteredOrganizations}
          keyExtractor={(organization) => organization.id}
          columns={[
            {
              key: 'name',
              label: 'Организация',
              render: (organization) => (
                <div className="flex items-center gap-3">
                  <div className="bg-slate-700 p-2 rounded-lg">
                    <BuildingOfficeIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{organization.name}</div>
                    {organization.tax_number && (
                      <div className="text-sm text-gray-500">ИНН: {organization.tax_number}</div>
                    )}
                  </div>
                </div>
              ),
            },
            {
              key: 'contacts',
              label: 'Контакты',
              render: (organization) => (
                <div className="text-sm">
                  {organization.phone && (
                    <div className="flex items-center gap-1 mb-1">
                      <PhoneIcon className="h-4 w-4 text-gray-400" />
                      <span>{organization.phone}</span>
                    </div>
                  )}
                  {organization.email && (
                    <div className="flex items-center gap-1">
                      <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                      <span className="truncate max-w-[200px]">{organization.email}</span>
                    </div>
                  )}
                  {!organization.phone && !organization.email && (
                    <span className="text-gray-400">Не указаны</span>
                  )}
                </div>
              ),
            },
            {
              key: 'status',
              label: 'Статус',
              render: (organization) => (
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                  organization.is_active === false
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-green-100 text-green-700'
                }`}
                >
                  {organization.is_active === false ? 'Неактивна' : 'Активна'}
                </span>
              ),
            },
            {
              key: 'stats',
              label: 'Статистика',
              render: (organization) => (
                <div className="flex gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{organization.stats.users_count}</div>
                    <div className="text-gray-500">чел.</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{organization.stats.projects_count}</div>
                    <div className="text-gray-500">проектов</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{organization.stats.contracts_count}</div>
                    <div className="text-gray-500">договоров</div>
                  </div>
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
        footer={(
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
        )}
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
              onChange={(event) => setNewOrgForm({ ...newOrgForm, name: event.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
            <textarea
              value={newOrgForm.description}
              onChange={(event) => setNewOrgForm({ ...newOrgForm, description: event.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ИНН</label>
              <input
                type="text"
                value={newOrgForm.inn}
                onChange={(event) => setNewOrgForm({ ...newOrgForm, inn: event.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">КПП</label>
              <input
                type="text"
                value={newOrgForm.kpp}
                onChange={(event) => setNewOrgForm({ ...newOrgForm, kpp: event.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Адрес</label>
            <input
              type="text"
              value={newOrgForm.address}
              onChange={(event) => setNewOrgForm({ ...newOrgForm, address: event.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
              <input
                type="tel"
                value={newOrgForm.phone}
                onChange={(event) => setNewOrgForm({ ...newOrgForm, phone: event.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={newOrgForm.email}
                onChange={(event) => setNewOrgForm({ ...newOrgForm, email: event.target.value })}
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
                onChange={(event) => setNewOrgForm({
                  ...newOrgForm,
                  owner: { ...newOrgForm.owner, name: event.target.value },
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                required
                value={newOrgForm.owner.email}
                onChange={(event) => setNewOrgForm({
                  ...newOrgForm,
                  owner: { ...newOrgForm.owner, email: event.target.value },
                })}
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
              onChange={(event) => setNewOrgForm({
                ...newOrgForm,
                owner: { ...newOrgForm.owner, password: event.target.value },
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HoldingOrganizationsPage;
