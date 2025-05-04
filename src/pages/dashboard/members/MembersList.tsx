import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService, OrganizationSummary } from '@utils/api';

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
        // Используем API для получения организаций пользователя
        const response = await userService.getUserOrganizations();
        const organizations: OrganizationSummary[] = response.data;
        
        // Преобразуем данные в формат Member для отображения
        const formattedMembers = organizations.map((org) => ({
          id: org.id,
          name: org.name,
          email: '', // Эти данные отсутствуют в API, можно дополнить при наличии
          role: org.role_in_org,
          status: 'Активен', // По умолчанию считаем активным
          created_at: new Date().toISOString().split('T')[0] // Заглушка, т.к. нет даты в API
        }));
        
        setMembers(formattedMembers);
      } catch (err) {
        console.error('Ошибка при загрузке списка участников:', err);
        // Здесь можно установить сообщение об ошибке, если нужно
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