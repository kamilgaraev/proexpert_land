import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserCircleIcon, XMarkIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  lastActive: string;
}

const mockAdmins: Admin[] = [
  {
    id: '1',
    name: 'Александр Иванов',
    email: 'ivanov@proexpert.ru',
    role: 'Главный администратор',
    lastActive: '2023-11-24'
  },
  {
    id: '2',
    name: 'Екатерина Смирнова',
    email: 'smirnova@proexpert.ru',
    role: 'Администратор',
    lastActive: '2023-11-23'
  },
  {
    id: '3',
    name: 'Дмитрий Козлов',
    email: 'kozlov@proexpert.ru',
    role: 'Администратор контента',
    lastActive: '2023-11-20'
  },
  {
    id: '4',
    name: 'Ольга Петрова',
    email: 'petrova@proexpert.ru',
    role: 'Администратор',
    lastActive: '2023-11-22'
  },
  {
    id: '5',
    name: 'Михаил Соколов',
    email: 'sokolov@proexpert.ru',
    role: 'Администратор поддержки',
    lastActive: '2023-11-21'
  }
];

const AdminsList = () => {
  const [admins, setAdmins] = useState<Admin[]>(mockAdmins);
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredAdmins = admins.filter(admin => 
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.role.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDeleteAdmin = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этого администратора?')) {
      setAdmins(prevAdmins => prevAdmins.filter(admin => admin.id !== id));
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Управление администраторами</h1>
        <Link
          to="/dashboard/admins/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Добавить администратора
        </Link>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Поиск администраторов..."
            className="w-full px-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Администратор
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Роль
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Последняя активность
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAdmins.length > 0 ? (
                filteredAdmins.map((admin) => (
                  <tr key={admin.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <UserCircleIcon className="h-6 w-6 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                          <div className="text-sm text-gray-500">{admin.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{admin.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(admin.lastActive).toLocaleDateString('ru-RU')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Редактировать"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          title="Удалить"
                          onClick={() => handleDeleteAdmin(admin.id)}
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    {searchTerm ? 'Администраторы не найдены' : 'Нет администраторов для отображения'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminsList; 