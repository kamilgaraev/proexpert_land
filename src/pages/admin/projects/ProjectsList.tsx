import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Project {
  id: number;
  name: string;
  address: string;
  status: string;
  start_date: string;
  end_date: string | null;
  progress: number;
  foreman: string;
  team_count: number;
}

const ProjectsList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    // Имитация загрузки данных с API
    setTimeout(() => {
      const mockProjects: Project[] = [
        {
          id: 1,
          name: 'ЖК Солнечный',
          address: 'г. Москва, ул. Солнечная, 10',
          status: 'В процессе',
          start_date: '2023-01-15',
          end_date: '2023-12-31',
          progress: 45,
          foreman: 'Иванов И.И.',
          team_count: 8,
        },
        {
          id: 2,
          name: 'ЖК Riverside',
          address: 'г. Москва, набережная Пресненская, 2',
          status: 'В процессе',
          start_date: '2023-03-01',
          end_date: '2024-05-30',
          progress: 25,
          foreman: 'Петров П.П.',
          team_count: 12,
        },
        {
          id: 3,
          name: 'Офисный центр "Небоскреб"',
          address: 'г. Москва, Ленинградский пр-т, 80',
          status: 'Завершен',
          start_date: '2022-05-10',
          end_date: '2023-04-20',
          progress: 100,
          foreman: 'Сидоров С.С.',
          team_count: 0,
        },
        {
          id: 4,
          name: 'ТЦ "Мегамол"',
          address: 'г. Москва, Кутузовский пр-т, 32',
          status: 'Планируется',
          start_date: '2023-08-01',
          end_date: null,
          progress: 0,
          foreman: 'Не назначен',
          team_count: 0,
        },
      ];
      setProjects(mockProjects);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Фильтрация проектов
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      project.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.foreman.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'В процессе':
        return 'bg-blue-100 text-blue-800';
      case 'Завершен':
        return 'bg-green-100 text-green-800';
      case 'Планируется':
        return 'bg-yellow-100 text-yellow-800';
      case 'Приостановлен':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Загрузка...</div>;
  }

  if (error) {
    return <div className="text-red-500">Ошибка: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление объектами</h1>
        <Link to="/admin/projects/create" className="btn btn-primary">
          Добавить объект
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
                placeholder="Поиск по названию объекта, адресу или прорабу"
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full md:w-64">
            <label htmlFor="status-filter" className="sr-only">
              Фильтр по статусу
            </label>
            <select
              id="status-filter"
              name="status-filter"
              className="form-select w-full border border-gray-300 rounded-md py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Все статусы</option>
              <option value="В процессе">В процессе</option>
              <option value="Завершен">Завершен</option>
              <option value="Планируется">Планируется</option>
              <option value="Приостановлен">Приостановлен</option>
            </select>
          </div>
        </div>
      </div>

      {/* Карточки проектов */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold text-gray-800 mb-1">{project.name}</h2>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{project.address}</p>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Прогресс:</span>
                  <span className="text-sm font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div 
                    className="bg-primary-600 h-2.5 rounded-full" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div>
                    <span className="text-xs text-gray-500 block">Начало:</span>
                    <span className="text-sm">{project.start_date}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Окончание:</span>
                    <span className="text-sm">{project.end_date || 'Не определено'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Прораб:</span>
                    <span className="text-sm">{project.foreman}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Бригад:</span>
                    <span className="text-sm">{project.team_count}</span>
                  </div>
                </div>
                
                <div className="flex justify-between mt-4">
                  <Link
                    to={`/admin/projects/${project.id}`}
                    className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                  >
                    Просмотр деталей
                  </Link>
                  <div>
                    <Link
                      to={`/admin/projects/edit/${project.id}`}
                      className="text-primary-600 hover:text-primary-800 text-sm font-medium mr-3"
                    >
                      Редактировать
                    </Link>
                    <button
                      onClick={() => {
                        if (window.confirm('Вы уверены, что хотите удалить этот объект?')) {
                          console.log('Удаление объекта', project.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 py-8 text-center text-gray-500">
            Объекты не найдены
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsList; 