import React, { useState, useEffect } from 'react';
import { useTheme } from '../shared/ThemeProvider';
import { 
  BuildingOfficeIcon, 
  UsersIcon, 
  ChartBarIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface ChildOrganization {
  id: number;
  name: string;
  organization_type: string;
  hierarchy_level: number;
  tax_number: string;
  registration_number: string;
  address: string;
  phone: string;
  email: string;
  users_count: number;
  projects_count: number;
  contracts_count: number;
  is_active: boolean;
  created_at: string;
}

interface OrganizationStats {
  users: {
    total: number;
    active: number;
    owners: number;
    managers: number;
    employees: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    cancelled: number;
    total_budget: number;
    completed_budget: number;
  };
  contracts: {
    total: number;
    active: number;
    completed: number;
    total_value: number;
    active_value: number;
    monthly_income: number;
  };
  financial: {
    current_balance: number;
    monthly_expenses: number;
    profit_margin: number;
    cash_flow: number;
  };
  activity: {
    last_login: string;
    new_projects_this_month: number;
    completed_tasks_this_week: number;
    active_user_sessions: number;
  };
}

export const ChildOrganizationManager: React.FC = () => {
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const [organizations, setOrganizations] = useState<ChildOrganization[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<ChildOrganization | null>(null);
  const [organizationStats, setOrganizationStats] = useState<OrganizationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'users_count' | 'projects_count'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadOrganizations();
  }, [searchTerm, statusFilter, sortBy, sortDirection]);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      // TODO: Заменить на реальный API вызов
      const mockData: ChildOrganization[] = [
        {
          id: 124,
          name: "ООО Строитель",
          organization_type: "child",
          hierarchy_level: 1,
          tax_number: "1234567890",
          registration_number: "123456789",
          address: "г. Москва, ул. Строительная, 1",
          phone: "+7 (495) 123-45-67",
          email: "info@stroitel.ru",
          users_count: 15,
          projects_count: 8,
          contracts_count: 5,
          is_active: true,
          created_at: "2024-01-15T10:00:00Z"
        }
      ];
      setOrganizations(mockData);
    } catch (error) {
      console.error('Ошибка загрузки организаций:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizationStats = async (orgId: number) => {
    try {
      // TODO: Заменить на реальный API вызов
      const mockStats: OrganizationStats = {
        users: { total: 15, active: 13, owners: 2, managers: 4, employees: 9 },
        projects: { total: 8, active: 5, completed: 2, cancelled: 1, total_budget: 2500000, completed_budget: 800000 },
        contracts: { total: 5, active: 3, completed: 2, total_value: 1800000, active_value: 1200000, monthly_income: 150000 },
        financial: { current_balance: 350000, monthly_expenses: 85000, profit_margin: 12.5, cash_flow: 65000 },
        activity: { 
          last_login: "2024-01-20T14:30:00Z", 
          new_projects_this_month: 2, 
          completed_tasks_this_week: 15, 
          active_user_sessions: 8 
        }
      };
      setOrganizationStats(mockStats);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    }
  };

  const handleViewStats = async (org: ChildOrganization) => {
    setSelectedOrganization(org);
    await loadOrganizationStats(org.id);
    setShowStatsModal(true);
  };

  const handleEdit = (org: ChildOrganization) => {
    setSelectedOrganization(org);
    setShowEditModal(true);
  };

  const handleDelete = (org: ChildOrganization) => {
    setSelectedOrganization(org);
    setShowDeleteModal(true);
  };

  const handleExport = async (format: 'xlsx' | 'csv' | 'pdf') => {
    try {
      // TODO: Реализовать экспорт через API
      console.log(`Экспорт в формате ${format}`);
    } catch (error) {
      console.error('Ошибка экспорта:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Дочерние организации</h2>
        <button className={`px-4 py-2 ${theme.primary} text-white rounded-lg ${theme.hover} transition-colors`}>
          Добавить организацию
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">Здесь будет список дочерних организаций с расширенным функционалом</p>
      </div>

      {/* Фильтры и поиск */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Поиск */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по названию или ИНН"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Фильтр по статусу */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Все статусы</option>
            <option value="active">Активные</option>
            <option value="inactive">Неактивные</option>
          </select>

          {/* Сортировка */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">По названию</option>
            <option value="created_at">По дате создания</option>
            <option value="users_count">По количеству пользователей</option>
            <option value="projects_count">По количеству проектов</option>
          </select>

          {/* Направление сортировки */}
          <select
            value={sortDirection}
            onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="asc">По возрастанию</option>
            <option value="desc">По убыванию</option>
          </select>
        </div>
      </div>

      {/* Список организаций */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
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
                  Статус
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {organizations.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-10 w-10 ${theme.secondary} rounded-lg flex items-center justify-center`}>
                        <BuildingOfficeIcon className={`h-6 w-6 ${theme.text}`} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{org.name}</div>
                        <div className="text-sm text-gray-500">ИНН: {org.tax_number}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{org.email}</div>
                    <div className="text-sm text-gray-500">{org.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <UsersIcon className="w-4 h-4" />
                        {org.users_count}
                      </div>
                      <div className="flex items-center gap-1">
                        <ChartBarIcon className="w-4 h-4" />
                        {org.projects_count}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      org.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {org.is_active ? 'Активна' : 'Неактивна'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewStats(org)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Просмотр статистики"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(org)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Редактировать"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(org)}
                        className="text-red-600 hover:text-red-900"
                        title="Удалить"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модальное окно статистики */}
      {showStatsModal && selectedOrganization && organizationStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Статистика: {selectedOrganization.name}
                </h3>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Пользователи */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Пользователи</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{organizationStats.users.total}</div>
                    <div className="text-sm text-blue-800">Всего</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{organizationStats.users.active}</div>
                    <div className="text-sm text-green-800">Активных</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{organizationStats.users.owners}</div>
                    <div className="text-sm text-purple-800">Владельцев</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{organizationStats.users.managers}</div>
                    <div className="text-sm text-yellow-800">Менеджеров</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">{organizationStats.users.employees}</div>
                    <div className="text-sm text-gray-800">Сотрудников</div>
                  </div>
                </div>
              </div>

              {/* Проекты */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Проекты</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{organizationStats.projects.total}</div>
                    <div className="text-sm text-blue-800">Всего проектов</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{organizationStats.projects.active}</div>
                    <div className="text-sm text-green-800">Активных</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{organizationStats.projects.completed}</div>
                    <div className="text-sm text-purple-800">Завершенных</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">{formatCurrency(organizationStats.projects.total_budget)}</div>
                    <div className="text-sm text-gray-600">Общий бюджет</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">{formatCurrency(organizationStats.projects.completed_budget)}</div>
                    <div className="text-sm text-gray-600">Выполнено</div>
                  </div>
                </div>
              </div>

              {/* Финансы */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Финансы</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{formatCurrency(organizationStats.financial.current_balance)}</div>
                    <div className="text-sm text-green-800">Текущий баланс</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="text-lg font-bold text-red-600">{formatCurrency(organizationStats.financial.monthly_expenses)}</div>
                    <div className="text-sm text-red-800">Расходы в месяц</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">{organizationStats.financial.profit_margin}%</div>
                    <div className="text-sm text-blue-800">Прибыльность</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="text-lg font-bold text-yellow-600">{formatCurrency(organizationStats.financial.cash_flow)}</div>
                    <div className="text-sm text-yellow-800">Денежный поток</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 