import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '@utils/api';

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

const MembersList: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // Используем API для получения пользователей организации
        const response = await userService.getOrganizationUsers();
        
        // Проверяем успешность ответа
        if (!response.data || !response.data.success) {
          console.error('Ошибка при загрузке списка пользователей:', response);
          setIsLoading(false);
          return;
        }
        
        // Получаем список пользователей
        const usersData = response.data.data;
        
        if (!usersData || !Array.isArray(usersData.users)) {
          console.error('Неверная структура данных пользователей:', usersData);
          setMembers([]);
          setIsLoading(false);
          return;
        }
        
        const users = usersData.users;
        
        if (!users.length) {
          setMembers([]);
          setIsLoading(false);
          return;
        }
        
        // Преобразуем данные в формат Member для отображения
        const formattedMembers = users.map((user: any) => {
          // Получаем роль из информации о ролях пользователя
          let role = 'Пользователь';
          
          if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
            // Если роль представлена как объект с полем name
            if (typeof user.roles[0] === 'object' && user.roles[0].name) {
              role = user.roles[0].name;
            } else if (typeof user.roles[0] === 'string') {
              // Если роль представлена как строка
              role = user.roles[0];
            }
          } else if (user.role) {
            // Если роль находится прямо в объекте пользователя
            role = user.role;
          }
          
          // Преобразуем роль на русский язык
          const roleMap: Record<string, string> = {
            'admin': 'Администратор',
            'manager': 'Менеджер',
            'member': 'Участник',
            'user': 'Пользователь'
          };
          
          const translatedRole = roleMap[role.toLowerCase()] || role;

          return {
            id: user.id,
            name: user.name || 'Без имени',
            email: user.email || '',
            role: translatedRole,
            status: user.is_active !== false ? 'Активен' : 'Не активен',
            created_at: user.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : ''
          };
        });
        
        setMembers(formattedMembers);
        console.log('Обработанные данные участников:', formattedMembers);
      } catch (err) {
        console.error('Ошибка при загрузке списка пользователей:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Загрузка...</div>;
  }

  if (error) {
    return <div className="text-red-500">Ошибка: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Участники организации</h1>
        <Link to="/dashboard/members/create" className="btn btn-primary">
          Добавить участника
        </Link>
      </div>

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
                Дата регистрации
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.length > 0 ? (
              members.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{member.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{member.email || 'Нет данных'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{member.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.status === 'Активен'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.created_at}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/dashboard/members/edit/${member.id}`}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      Редактировать
                    </Link>
                    <button
                      onClick={() => {
                        if (window.confirm('Вы уверены, что хотите удалить этого участника?')) {
                          console.log('Удаление участника', member.id);
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
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  Участники не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MembersList; 