import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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
    // Имитация загрузки данных с API
    setTimeout(() => {
      const mockMembers: Member[] = [
        {
          id: 1,
          name: 'Иванов Иван',
          email: 'ivanov@example.com',
          role: 'Администратор',
          status: 'Активен',
          created_at: '2023-05-15',
        },
        {
          id: 2,
          name: 'Петров Петр',
          email: 'petrov@example.com',
          role: 'Менеджер',
          status: 'Активен',
          created_at: '2023-06-20',
        },
        {
          id: 3,
          name: 'Сидорова Анна',
          email: 'sidorova@example.com',
          role: 'Помощник',
          status: 'Приглашен',
          created_at: '2023-07-10',
        },
      ];
      setMembers(mockMembers);
      setIsLoading(false);
    }, 1000);
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
            {members.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{member.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{member.email}</div>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MembersList; 