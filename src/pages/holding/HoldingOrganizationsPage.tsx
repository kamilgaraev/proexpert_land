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
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  BanknotesIcon,
  Squares2X2Icon,
  ListBulletIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { multiOrganizationService, getTokenFromStorages } from '@utils/api';
import type { HoldingOrganization } from '@utils/api';
import { SEOHead } from '@components/shared/SEOHead';
import { useTheme } from '@components/shared/ThemeProvider';

interface OrganizationUser {
  id: number;
  name: string;
  email: string;
  is_owner: boolean;
  is_active: boolean;
  role: 'admin' | 'manager' | 'employee';
  permissions: string[];
  last_login: string;
  joined_at: string;
}

interface OrganizationUsersModalProps {
  organizationId: number;
  organizationName: string;
  onClose: () => void;
}

const roleLabels = {
  admin: 'Администратор',
  manager: 'Менеджер',
  employee: 'Сотрудник'
};

const roleColors = {
  admin: 'bg-red-100 text-red-800',
  manager: 'bg-blue-100 text-blue-800',
  employee: 'bg-gray-100 text-gray-800'
};

const OrganizationUsersModal: React.FC<OrganizationUsersModalProps> = ({ organizationId, organizationName, onClose }) => {
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'manager' | 'employee'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<OrganizationUser | null>(null);
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    role: 'employee' as 'admin' | 'manager' | 'employee',
    permissions: [] as string[],
    send_invitation: true
  });

  useEffect(() => {
    loadUsers();
  }, [organizationId, searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // Мок данные для демонстрации
      const mockUsers: OrganizationUser[] = [
        {
          id: 1,
          name: 'Иван Петров',
          email: 'ivan.petrov@stroitel.ru',
          is_owner: true,
          is_active: true,
          role: 'admin',
          permissions: ['projects.read', 'projects.create', 'projects.edit', 'projects.delete', 'users.read', 'users.create'],
          last_login: '2024-01-20T09:15:00Z',
          joined_at: '2024-01-16T09:00:00Z'
        },
        {
          id: 2,
          name: 'Мария Сидорова',
          email: 'maria.sidorova@stroitel.ru',
          is_owner: false,
          is_active: true,
          role: 'manager',
          permissions: ['projects.read', 'projects.create', 'projects.edit', 'contracts.read'],
          last_login: '2024-01-19T14:30:00Z',
          joined_at: '2024-01-17T10:00:00Z'
        },
        {
          id: 3,
          name: 'Алексей Козлов',
          email: 'alexey.kozlov@stroitel.ru',
          is_owner: false,
          is_active: false,
          role: 'employee',
          permissions: ['projects.read', 'contracts.read'],
          last_login: '2024-01-15T16:45:00Z',
          joined_at: '2024-01-18T11:00:00Z'
        }
      ];
      
      setUsers(mockUsers.filter(user => {
        const matchesSearch = !searchTerm || 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || 
          (statusFilter === 'active' && user.is_active) ||
          (statusFilter === 'inactive' && !user.is_active);
        
        return matchesSearch && matchesRole && matchesStatus;
      }));
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    try {
      // TODO: Вызов реального API
      console.log('Добавление пользователя:', newUserForm);
      setShowAddModal(false);
      setNewUserForm({
        email: '',
        role: 'employee',
        permissions: [],
        send_invitation: true
      });
      await loadUsers();
    } catch (error) {
      console.error('Ошибка добавления пользователя:', error);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      // TODO: Вызов реального API
      console.log('Удаление пользователя:', selectedUser.id);
      setShowDeleteModal(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (error) {
      console.error('Ошибка удаления пользователя:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className={`bg-gradient-to-r ${theme.gradient} p-3 rounded-xl`}>
                <UsersIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Управление пользователями</h3>
                <p className="text-gray-600">{organizationName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAddModal(true)}
                className={`px-4 py-2 bg-gradient-to-r ${theme.gradient} text-white rounded-xl hover:opacity-90 transition-opacity duration-200 flex items-center space-x-2 font-medium`}
              >
                <PlusIcon className="w-4 h-4" />
                <span>Добавить</span>
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Фильтры */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск по имени или email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Все роли</option>
              <option value="admin">Администраторы</option>
              <option value="manager">Менеджеры</option>
              <option value="employee">Сотрудники</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Все статусы</option>
              <option value="active">Активные</option>
              <option value="inactive">Неактивные</option>
            </select>
          </div>
        </div>

        {/* Список пользователей */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 240px)' }}>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Пользователи не найдены</h4>
              <p className="text-gray-600">Попробуйте изменить фильтры или добавить нового пользователя</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {users.map((user) => (
                <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <UsersIcon className="h-6 w-6 text-gray-500" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-medium text-gray-900">{user.name}</h4>
                          {user.is_owner && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Владелец
                            </span>
                          )}
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                            {roleLabels[user.role]}
                          </span>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_active ? 'Активен' : 'Неактивен'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Последний вход: {formatDate(user.last_login)}</span>
                          <span>Присоединился: {formatDate(user.joined_at)}</span>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">
                            Разрешений: {user.permissions.length}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Редактировать"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      {!user.is_owner && (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Удалить"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Модальное окно добавления пользователя */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4" style={{ zIndex: 60 }}>
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h4 className="text-lg font-bold text-gray-900">Добавить пользователя</h4>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="user@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Роль</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({...newUserForm, role: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="employee">Сотрудник</option>
                    <option value="manager">Менеджер</option>
                    <option value="admin">Администратор</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="send_invitation"
                    checked={newUserForm.send_invitation}
                    onChange={(e) => setNewUserForm({...newUserForm, send_invitation: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="send_invitation" className="ml-2 block text-sm text-gray-700">
                    Отправить приглашение по email
                  </label>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex space-x-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleAddUser}
                  disabled={!newUserForm.email}
                  className={`flex-1 bg-gradient-to-r ${theme.gradient} hover:opacity-90 text-white py-2 px-4 rounded-lg font-medium transition-opacity disabled:opacity-50`}
                >
                  Добавить
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно удаления пользователя */}
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4" style={{ zIndex: 60 }}>
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="text-center">
                  <div className="bg-red-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <TrashIcon className="h-12 w-12 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Удалить пользователя?</h3>
                  <p className="text-gray-600 mb-6">
                    Вы уверены, что хотите удалить пользователя <strong>{selectedUser.name}</strong>?
                    Это действие необратимо.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors duration-200"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={handleDeleteUser}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-medium transition-colors duration-200"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const HoldingOrganizationsPage = () => {
  const [organizations, setOrganizations] = useState<HoldingOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [holdingName, setHoldingName] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<HoldingOrganization | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'users_count' | 'projects_count'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
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

  const handleEditOrganization = (org: HoldingOrganization) => {
    setSelectedOrganization(org);
    setShowEditModal(true);
  };

  const handleDeleteOrganization = (org: HoldingOrganization) => {
    setSelectedOrganization(org);
    setShowDeleteModal(true);
  };

  const handleViewStats = (org: HoldingOrganization) => {
    setSelectedOrganization(org);
    setShowStatsModal(true);
  };

  const handleManageUsers = (org: HoldingOrganization) => {
    setSelectedOrganization(org);
    setShowUsersModal(true);
  };

  const handleExport = async (format: 'xlsx' | 'csv' | 'pdf') => {
    try {
      // TODO: Реализовать экспорт через новый API
      console.log(`Экспорт организаций в формате ${format}`);
    } catch (error) {
      console.error('Ошибка экспорта:', error);
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
  }).sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'created_at':
        aValue = a.created_at;
        bValue = b.created_at;
        break;
      case 'users_count':
        aValue = a.stats?.users_count || 0;
        bValue = b.stats?.users_count || 0;
        break;
      case 'projects_count':
        aValue = a.stats?.projects_count || 0;
        bValue = b.stats?.projects_count || 0;
        break;
      default:
        return 0;
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
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
              <button
                onClick={() => handleExport('xlsx')}
                className={`px-4 py-2 bg-gradient-to-r ${theme.gradient} text-white rounded-xl hover:opacity-90 transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg`}
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span>Экспорт</span>
              </button>
              
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

      {/* Панель фильтров */}
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Поиск */}
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск по названию, ИНН или email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-sm transition-all duration-200"
              />
            </div>

            {/* Фильтр по статусу */}
            <div className="relative">
              <FunnelIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-sm appearance-none transition-all duration-200"
              >
                <option value="all">Все статусы</option>
                <option value="active">Активные</option>
                <option value="inactive">Неактивные</option>
              </select>
            </div>

            {/* Сортировка */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-sm appearance-none transition-all duration-200"
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
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-sm appearance-none transition-all duration-200"
            >
              <option value="asc">По возрастанию</option>
              <option value="desc">По убыванию</option>
            </select>
          </div>
        </div>
      </motion.div>

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
          {filteredOrganizations.length === 0 ? (
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
              {filteredOrganizations.map((org, index) => (
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
                      <button 
                        onClick={() => handleViewStats(org)}
                        className={`flex-1 ${theme.primary} ${theme.hover} text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1`}
                      >
                        <ChartBarIcon className="h-4 w-4" />
                        <span>Статистика</span>
                      </button>
                      <button 
                        onClick={() => handleManageUsers(org)}
                        className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
                      >
                        <UsersIcon className="h-4 w-4" />
                        <span>Пользователи</span>
                      </button>
                      <button 
                        onClick={() => handleEditOrganization(org)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        <PencilIcon className="h-4 w-4" />
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
                    {filteredOrganizations.map((org, index) => (
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
                            <button 
                              onClick={() => handleViewStats(org)}
                              className={`${theme.text} hover:opacity-80 transition-opacity duration-200`}
                              title="Статистика"
                            >
                              <ChartBarIcon className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => handleManageUsers(org)}
                              className="text-purple-600 hover:text-purple-800 transition-colors duration-200"
                              title="Управление пользователями"
                            >
                              <UsersIcon className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => handleEditOrganization(org)}
                              className="text-yellow-600 hover:text-yellow-800 transition-colors duration-200"
                              title="Редактировать"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteOrganization(org)}
                              className="text-red-600 hover:text-red-800 transition-colors duration-200"
                              title="Удалить"
                            >
                              <TrashIcon className="h-5 w-5" />
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

      {/* Модальное окно статистики */}
      {showStatsModal && selectedOrganization && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowStatsModal(false)}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">
                  Детальная статистика: {selectedOrganization.name}
                </h3>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`bg-gradient-to-r ${theme.gradient} p-6 rounded-xl text-white`}>
                  <h4 className="text-lg font-semibold mb-2">Пользователи</h4>
                  <div className="text-3xl font-bold">{selectedOrganization.stats?.users_count || 0}</div>
                  <p className="text-sm opacity-90">Активных сотрудников</p>
                </div>
                
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
                  <h4 className="text-lg font-semibold mb-2">Проекты</h4>
                  <div className="text-3xl font-bold">{selectedOrganization.stats?.projects_count || 0}</div>
                  <p className="text-sm opacity-90">Активных проектов</p>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
                  <h4 className="text-lg font-semibold mb-2">Договоры</h4>
                  <div className="text-3xl font-bold">{selectedOrganization.stats?.contracts_count || 0}</div>
                  <p className="text-sm opacity-90">Действующих договоров</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Финансовые показатели</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(selectedOrganization.stats?.active_contracts_value || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Оборот по активным договорам</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {new Date(selectedOrganization.created_at).toLocaleDateString('ru-RU')}
                    </div>
                    <div className="text-sm text-gray-600">Дата создания</div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-600">
                  Подробная аналитика будет доступна в ближайших обновлениях
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Модальное окно управления пользователями */}
      {showUsersModal && selectedOrganization && (
        <OrganizationUsersModal 
          organizationId={selectedOrganization.id}
          organizationName={selectedOrganization.name}
          onClose={() => setShowUsersModal(false)}
        />
      )}

      {/* Модальное окно редактирования */}
      {showEditModal && selectedOrganization && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowEditModal(false)}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">
                  Редактирование: {selectedOrganization.name}
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center py-12">
                <div className="bg-yellow-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <PencilIcon className="h-12 w-12 text-yellow-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Редактирование организации</h4>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Функция редактирования организаций будет доступна в ближайших обновлениях.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>• Изменение основных данных</p>
                  <p>• Настройка контактной информации</p>
                  <p>• Управление статусом</p>
                  <p>• Конфигурация доступов</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Модальное окно удаления */}
      {showDeleteModal && selectedOrganization && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowDeleteModal(false)}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="text-center">
                <div className="bg-red-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <TrashIcon className="h-12 w-12 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Удалить организацию?</h3>
                <p className="text-gray-600 mb-6">
                  Вы уверены, что хотите удалить организацию <strong>{selectedOrganization.name}</strong>?
                  Это действие необратимо.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors duration-200"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Реализовать удаление через API
                      console.log('Удаление организации:', selectedOrganization.id);
                      setShowDeleteModal(false);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-medium transition-colors duration-200"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default HoldingOrganizationsPage; 