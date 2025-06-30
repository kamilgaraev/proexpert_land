import React, { useState, useEffect } from 'react';
import { useTheme } from '../shared/ThemeProvider';
import { multiOrganizationService } from '../../utils/api';
import { 
  UsersIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

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

interface Props {
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

const availablePermissions = [
  { key: 'projects.read', label: 'Просмотр проектов' },
  { key: 'projects.create', label: 'Создание проектов' },
  { key: 'projects.edit', label: 'Редактирование проектов' },
  { key: 'projects.delete', label: 'Удаление проектов' },
  { key: 'contracts.read', label: 'Просмотр контрактов' },
  { key: 'contracts.create', label: 'Создание контрактов' },
  { key: 'contracts.edit', label: 'Редактирование контрактов' },
  { key: 'contracts.delete', label: 'Удаление контрактов' },
  { key: 'users.read', label: 'Просмотр пользователей' },
  { key: 'users.create', label: 'Добавление пользователей' },
  { key: 'users.edit', label: 'Редактирование пользователей' },
  { key: 'users.delete', label: 'Удаление пользователей' },
  { key: 'materials.read', label: 'Просмотр материалов' },
  { key: 'materials.create', label: 'Создание материалов' },
  { key: 'materials.edit', label: 'Редактирование материалов' },
  { key: 'materials.delete', label: 'Удаление материалов' },
  { key: 'reports.read', label: 'Просмотр отчетов' },
  { key: 'reports.export', label: 'Экспорт отчетов' },
  { key: 'reports.admin', label: 'Административные отчеты' }
];

export const OrganizationUsersManager: React.FC<Props> = ({ organizationId, organizationName, onClose }) => {
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'manager' | 'employee'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
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
      const response = await multiOrganizationService.getChildOrganizationUsers(organizationId, {
        search: searchTerm || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        per_page: 50
      });
      
      if (response.data.success) {
        setUsers(response.data.data.users || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
      // В реальном приложении здесь должна быть обработка ошибок
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    try {
      const response = await multiOrganizationService.addUserToChildOrganization(organizationId, newUserForm);
      
      if (response.data.success) {
        await loadUsers();
        setShowAddModal(false);
        setNewUserForm({
          email: '',
          role: 'employee',
          permissions: [],
          send_invitation: true
        });
      }
    } catch (error) {
      console.error('Ошибка добавления пользователя:', error);
    }
  };



  const getDefaultPermissionsByRole = (role: string) => {
    switch (role) {
      case 'admin':
        return availablePermissions.map(p => p.key);
      case 'manager':
        return [
          'projects.read', 'projects.create', 'projects.edit',
          'contracts.read', 'contracts.create',
          'materials.read', 'materials.create', 'materials.edit',
          'reports.read', 'reports.export',
          'users.read'
        ];
      case 'employee':
        return [
          'projects.read',
          'contracts.read',
          'materials.read',
          'reports.read'
        ];
      default:
        return [];
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Заголовок */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className={`bg-gradient-to-r ${theme.gradient} p-3 rounded-xl`}>
                <UsersIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Управление пользователями
                </h3>
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
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                <XMarkIcon className="w-6 h-6" />
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
        <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <UserCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Пользователи не найдены</h4>
              <p className="text-gray-600">Попробуйте изменить фильтры или добавить нового пользователя</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <UserCircleIcon className="h-8 w-8 text-gray-500" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-medium text-gray-900">{user.name}</h4>
                          {user.is_owner && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <ShieldCheckIcon className="w-3 h-3 mr-1" />
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
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="w-3 h-3" />
                            <span>Последний вход: {formatDate(user.last_login)}</span>
                          </div>
                          <span>Присоединился: {formatDate(user.joined_at)}</span>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">
                            Разрешения: {user.permissions.length} из {availablePermissions.length}
                          </p>
                        </div>
                      </div>
                    </div>
                                         <div className="flex items-center space-x-2">
                       <span className="text-sm text-gray-500">
                         Редактирование скоро
                       </span>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно добавления пользователя */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-60">
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
                  onChange={(e) => {
                    const role = e.target.value as 'admin' | 'manager' | 'employee';
                    setNewUserForm({
                      ...newUserForm, 
                      role,
                      permissions: getDefaultPermissionsByRole(role)
                    });
                  }}
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

      {/* Другие модальные окна для редактирования и удаления здесь... */}
    </div>
  );
}; 