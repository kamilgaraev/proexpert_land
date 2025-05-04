import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  TruckIcon,
  CurrencyRupeeIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { DashboardIcon } from '@components/icons/DashboardIcons';

// Карточки с ключевыми метриками
const stats = [
  { id: 1, name: 'Активные объекты', value: '3', icon: BuildingOfficeIcon, color: 'bg-primary-100 text-primary-700', link: '/dashboard/projects' },
  { id: 2, name: 'Прорабы', value: '2', icon: UserGroupIcon, color: 'bg-green-100 text-green-700', link: '/dashboard/team' },
  { id: 3, name: 'Движения материалов', value: '127', icon: TruckIcon, color: 'bg-construction-100 text-construction-700', link: '/dashboard/documents' },
  { id: 4, name: 'Выполненные работы', value: '58', icon: DocumentTextIcon, color: 'bg-purple-100 text-purple-700', link: '/dashboard/projects' },
  { id: 5, name: 'Расходы', value: '2.3M ₽', icon: CurrencyRupeeIcon, color: 'bg-red-100 text-red-700', link: '/dashboard/finance' },
  { id: 6, name: 'Выполнение плана', value: '76%', icon: ArrowTrendingUpIcon, color: 'bg-blue-100 text-blue-700', link: '/dashboard/calendar' },
];

// Последние активности
const activities = [
  {
    id: 1,
    project: 'ЖК Солнечный',
    type: 'Приемка материалов',
    user: 'Иванов И.И.',
    date: '2023-05-03 14:23',
    description: 'Принято 2 тонны цемента М500',
  },
  {
    id: 2,
    project: 'БЦ Высотный',
    type: 'Списание материалов',
    user: 'Петров П.П.',
    date: '2023-05-03 12:15',
    description: 'Списано 150 кг арматуры на монтаж каркаса',
  },
  {
    id: 3,
    project: 'ЖК Солнечный',
    type: 'Выполненные работы',
    user: 'Иванов И.И.',
    date: '2023-05-03 09:30',
    description: 'Заливка фундамента, 120 м²',
  },
  {
    id: 4,
    project: 'ТЦ Центральный',
    type: 'Приемка материалов',
    user: 'Сидоров С.С.',
    date: '2023-05-02 16:45',
    description: 'Принято 50 м³ бетона М300',
  },
  {
    id: 5,
    project: 'ТЦ Центральный',
    type: 'Выполненные работы',
    user: 'Сидоров С.С.',
    date: '2023-05-02 15:20',
    description: 'Монтаж опалубки, 85 м²',
  },
];

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Имитация загрузки данных
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="py-6">
      <div className="mb-8">
        <div className="flex items-center">
          <DashboardIcon />
          <div className="ml-4">
            <h1 className="text-2xl font-semibold text-secondary-900">Обзор</h1>
            <p className="mt-1 text-sm text-secondary-500">
              Добро пожаловать в ваш личный кабинет. Здесь вы можете управлять организацией и видеть ключевые показатели.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-10 w-10 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <>
          {/* Карточки с метриками */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 p-3 rounded-md ${stat.color}`}>
                      <stat.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-secondary-500 truncate">{stat.name}</dt>
                        <dd>
                          <div className="text-lg font-medium text-secondary-900">{stat.value}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-secondary-50 px-5 py-3">
                  <div className="text-sm">
                    <Link to={stat.link} className="font-medium text-primary-700 hover:text-primary-900">
                      Подробнее
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Последние активности */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-secondary-900">Последние активности</h2>
            <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-secondary-200">
                {activities.map((activity) => (
                  <li key={activity.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-primary-600 truncate">
                          {activity.project} - {activity.type}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {activity.user}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="text-sm text-secondary-500">
                            {activity.description}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-secondary-500 sm:mt-0">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-secondary-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <p>
                            {activity.date}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage; 