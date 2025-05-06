import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserCircleIcon, XMarkIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/outline';
import { userService } from '../../../utils/api';

console.log('[AdminsList] Component importing/rendering... (top level)');

interface Admin {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

const AdminsList = () => {
  console.log('[AdminsList] Component function body executing...');
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    console.log('[AdminsList] useEffect triggered.');
    const fetchAdmins = async () => {
      console.log('[AdminsList] fetchAdmins async function started.');
      try {
        setLoading(true);
        setError(null);
        console.log('[AdminsList] Fetching admins...');
        const response = await userService.getOrganizationUsers();
        console.log('[AdminsList] Response from userService:', response);
        
        if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
          console.log('[AdminsList] Data from API (response.data.data):', response.data.data);
          const fetchedAdmins = response.data.data.map((user: any) => ({
            id: String(user.id),
            name: user.name,
            email: user.email,
            is_active: user.is_active,
            created_at: user.created_at,
          }));
          console.log('[AdminsList] Mapped admins (fetchedAdmins):', fetchedAdmins);
          setAdmins(fetchedAdmins);
          if (fetchedAdmins.length === 0) {
            console.log('[AdminsList] No admins found in the response, but the structure was correct.');
          }
        } else {
          console.error("[AdminsList] Unexpected API response structure from userService:", response);
          setError("Не удалось получить список администраторов: неверный формат ответа от сервиса.");
        }
      } catch (err: any) {
        console.error("[AdminsList] Error fetching admins:", err);
        setError(`Ошибка при загрузке администраторов: ${err.message || 'Неизвестная ошибка'}`);
      }
      setLoading(false);
      console.log('[AdminsList] setLoading(false) executed. Current loading state should be false.');
    };

    fetchAdmins();
    console.log('[AdminsList] fetchAdmins() called within useEffect.');
  }, []);
  
  console.log('[AdminsList] States after useEffect declaration: admins, searchTerm, loading, error', admins, searchTerm, loading, error);
  
  const filteredAdmins = admins.filter(admin => 
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  console.log('[AdminsList] Admins in state:', admins);
  console.log('[AdminsList] Search term:', searchTerm);
  console.log('[AdminsList] Filtered admins:', filteredAdmins);
  
  const handleDeleteAdmin = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этого администратора?')) {
      setAdmins(prevAdmins => prevAdmins.filter(admin => admin.id !== id));
    }
  };
  
  if (loading) {
    return <div className="container mx-auto px-4 py-6 text-center">Загрузка администраторов...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-6 text-center text-red-500">{error}</div>;
  }
  
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
                  Статус
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата создания
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
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${admin.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {admin.is_active ? 'Активен' : 'Неактивен'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(admin.created_at).toLocaleDateString('ru-RU')}</div>
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