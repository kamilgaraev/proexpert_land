import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  objects: string[]; // Объекты, на которые назначен прораб
  last_active: string;
}

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('all');

  useEffect(() => {
    // Имитация загрузки данных с API
    setTimeout(() => {
      const mockUsers: User[] = [
        {
          id: 1,
          name: 'Иванов Иван',
          email: 'ivanov@example.com',
          role: 'Прораб',
          status: 'Активен',
          objects: ['ЖК Солнечный', 'ЖК Riverside'],
          last_active: '2023-05-15 14:30',
        },
        {
          id: 2,
          name: 'Петров Петр',
          email: 'petrov@example.com',
          role: 'Бригадир',
          status: 'Активен',
          objects: ['ЖК Морской'],
          last_active: '2023-05-14 10:15',
        },
        {
          id: 3,
          name: 'Сидорова Анна',
          email: 'sidorova@example.com',
          role: 'Прораб',
          status: 'Неактивен',
          objects: [],
          last_active: '2023-04-20 09:45',
        },
      ];
      setUsers(mockUsers);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Фильтрация пользователей
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Загрузка...</div>;
  }

  if (error) {
    return <div className="text-red-500">Ошибка: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление пользователями</h1>
        <Link to="/admin/users/create" className="btn btn-primary">
          Добавить пользователя
        </Link>
      </div>

      {/* Фильтры и поиск */}
      <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <label htmlFor="search" className="sr-only">
              Поиск
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id="search"
                name="search"
                type="text"
                placeholder="Поиск по имени или email"
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full md:w-64">
            <label htmlFor="role-filter" className="sr-only">
              Фильтр по роли
            </label>
            <select
              id="role-filter"
              name="role-filter"
              className="form-select w-full border border-gray-300 rounded-md py-2"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">Все роли</option>
              <option value="Прораб">Прораб</option>
              <option value="Бригадир">Бригадир</option>
              <option value="Снабженец">Снабженец</option>
            </select>
          </div>
        </div>
      </div>

      {/* Таблица пользователей */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Имя
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Роль
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Объекты
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Последняя активность
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                          {user.name.charAt(0)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'Активен'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {user.objects.length > 0 ? user.objects.join(', ') : 'Не назначен'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_active}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/admin/users/edit/${user.id}`}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      Редактировать
                    </Link>
                    <button
                      onClick={() => {
                        if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
                          console.log('Удаление пользователя', user.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  Пользователи не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersList; 