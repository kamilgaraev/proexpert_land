import React, { useEffect, useState } from 'react';
import {
  BuildingOfficeIcon,
  ChartBarIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from '../shared/ThemeProvider';
import { multiOrganizationService } from '../../utils/api';
import {
  ChildOrganization,
  ChildOrganizationsPagination,
  OrganizationStats,
  normalizeChildOrganizationsPayload,
  normalizeOrganizationStatsPayload,
} from './childOrganizationManagerData';

type StatusFilter = 'all' | 'active' | 'inactive';
type SortBy = 'name' | 'created_at' | 'users_count' | 'projects_count';
type SortDirection = 'asc' | 'desc';

const defaultPagination: ChildOrganizationsPagination = {
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
};

export const ChildOrganizationManager: React.FC = () => {
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const [organizations, setOrganizations] = useState<ChildOrganization[]>([]);
  const [pagination, setPagination] = useState<ChildOrganizationsPagination>(defaultPagination);
  const [selectedOrganization, setSelectedOrganization] = useState<ChildOrganization | null>(null);
  const [organizationStats, setOrganizationStats] = useState<OrganizationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showStatsModal, setShowStatsModal] = useState(false);

  useEffect(() => {
    void loadOrganizations();
  }, [searchTerm, statusFilter, sortBy, sortDirection]);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await multiOrganizationService.getChildOrganizations({
        search: searchTerm.trim() || undefined,
        status: statusFilter,
        sort_by: sortBy,
        sort_direction: sortDirection,
        per_page: 50,
      });
      const result = normalizeChildOrganizationsPayload(response.data);

      setOrganizations(result.organizations);
      setPagination(result.pagination);
    } catch {
      setOrganizations([]);
      setPagination(defaultPagination);
      setError('Не удалось загрузить дочерние организации');
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizationStats = async (organizationId: number) => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      setOrganizationStats(null);

      const response = await multiOrganizationService.getChildOrganizationStats(organizationId);

      setOrganizationStats(normalizeOrganizationStatsPayload(response.data));
    } catch {
      setStatsError('Не удалось загрузить статистику организации');
    } finally {
      setStatsLoading(false);
    }
  };

  const handleViewStats = async (org: ChildOrganization) => {
    setSelectedOrganization(org);
    setShowStatsModal(true);
    await loadOrganizationStats(org.id);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(amount);

  const closeStatsModal = () => {
    setShowStatsModal(false);
    setSelectedOrganization(null);
    setOrganizationStats(null);
    setStatsError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Дочерние организации</h2>
          <p className="text-sm text-gray-500">
            {pagination.total > 0
              ? `Найдено организаций: ${pagination.total}`
              : 'Управление организациями холдинга'}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по названию или ИНН"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Все статусы</option>
            <option value="active">Активные</option>
            <option value="inactive">Неактивные</option>
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortBy)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">По названию</option>
            <option value="created_at">По дате создания</option>
            <option value="users_count">По пользователям</option>
            <option value="projects_count">По проектам</option>
          </select>

          <select
            value={sortDirection}
            onChange={(event) => setSortDirection(event.target.value as SortDirection)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          >
            <option value="asc">По возрастанию</option>
            <option value="desc">По убыванию</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-orange-600" />
          </div>
        ) : organizations.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <BuildingOfficeIcon className="mx-auto h-10 w-10 text-gray-300" />
            <h3 className="mt-3 text-sm font-medium text-gray-900">Организации не найдены</h3>
            <p className="mt-1 text-sm text-gray-500">
              Измените фильтры или проверьте, что у текущей организации включен режим холдинга.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Организация
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Реквизиты
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Статистика
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {organizations.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${theme.secondary}`}
                        >
                          <BuildingOfficeIcon className={`h-6 w-6 ${theme.text}`} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{org.name}</div>
                          <div className="text-sm text-gray-500">
                            Уровень: {org.hierarchy_level || 1}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        ИНН: {org.tax_number || 'не указан'}
                      </div>
                      <div className="text-sm text-gray-500">
                        КПП: {org.registration_number || 'не указан'}
                      </div>
                      {org.address && (
                        <div className="mt-1 max-w-xs truncate text-sm text-gray-500">
                          {org.address}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1" title="Пользователи">
                          <UsersIcon className="h-4 w-4" />
                          {org.users_count}
                        </div>
                        <div className="flex items-center gap-1" title="Проекты">
                          <ChartBarIcon className="h-4 w-4" />
                          {org.projects_count}
                        </div>
                        <div title="Договоры">{org.contracts_count} дог.</div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          org.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {org.is_active ? 'Активна' : 'Неактивна'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => void handleViewStats(org)}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-900"
                        title="Посмотреть статистику"
                      >
                        <EyeIcon className="h-4 w-4" />
                        Статистика
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showStatsModal && selectedOrganization && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Статистика: {selectedOrganization.name}
                </h3>
                <button
                  onClick={closeStatsModal}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Закрыть"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {statsLoading && (
                <div className="flex items-center justify-center p-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-orange-600" />
                </div>
              )}

              {statsError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {statsError}
                </div>
              )}

              {organizationStats && (
                <div className="space-y-6">
                  <div>
                    <h4 className="mb-3 text-md font-medium text-gray-900">Пользователи</h4>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      <div className="rounded-lg bg-blue-50 p-3">
                        <div className="text-2xl font-bold text-blue-600">
                          {organizationStats.users.total}
                        </div>
                        <div className="text-sm text-blue-800">Всего</div>
                      </div>
                      <div className="rounded-lg bg-green-50 p-3">
                        <div className="text-2xl font-bold text-green-600">
                          {organizationStats.users.active}
                        </div>
                        <div className="text-sm text-green-800">Активных</div>
                      </div>
                      <div className="rounded-lg bg-purple-50 p-3">
                        <div className="text-2xl font-bold text-purple-600">
                          {organizationStats.users.owners}
                        </div>
                        <div className="text-sm text-purple-800">Владельцев</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 text-md font-medium text-gray-900">Проекты</h4>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      <div className="rounded-lg bg-blue-50 p-3">
                        <div className="text-2xl font-bold text-blue-600">
                          {organizationStats.projects.total}
                        </div>
                        <div className="text-sm text-blue-800">Всего проектов</div>
                      </div>
                      <div className="rounded-lg bg-green-50 p-3">
                        <div className="text-2xl font-bold text-green-600">
                          {organizationStats.projects.active}
                        </div>
                        <div className="text-sm text-green-800">Активных</div>
                      </div>
                      <div className="rounded-lg bg-purple-50 p-3">
                        <div className="text-2xl font-bold text-purple-600">
                          {organizationStats.projects.completed}
                        </div>
                        <div className="text-sm text-purple-800">Завершенных</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 text-md font-medium text-gray-900">Договоры</h4>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div className="rounded-lg bg-blue-50 p-3">
                        <div className="text-2xl font-bold text-blue-600">
                          {organizationStats.contracts.total}
                        </div>
                        <div className="text-sm text-blue-800">Всего</div>
                      </div>
                      <div className="rounded-lg bg-green-50 p-3">
                        <div className="text-2xl font-bold text-green-600">
                          {organizationStats.contracts.active}
                        </div>
                        <div className="text-sm text-green-800">Активных</div>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3">
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(organizationStats.contracts.total_value)}
                        </div>
                        <div className="text-sm text-gray-600">Общая сумма</div>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3">
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(organizationStats.contracts.active_value)}
                        </div>
                        <div className="text-sm text-gray-600">Активная сумма</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 text-md font-medium text-gray-900">Финансы</h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-lg bg-green-50 p-3">
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(organizationStats.financial.balance)}
                        </div>
                        <div className="text-sm text-green-800">Текущий баланс</div>
                      </div>
                      <div className="rounded-lg bg-red-50 p-3">
                        <div className="text-lg font-bold text-red-600">
                          {formatCurrency(organizationStats.financial.monthly_expenses)}
                        </div>
                        <div className="text-sm text-red-800">Расходы за месяц</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
