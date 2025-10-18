import { useHoldingDashboard } from '@/hooks/useHoldingDashboard';
import { useAuth } from '@/hooks/useAuth';
import { 
  BuildingOfficeIcon, 
  BanknotesIcon, 
  DocumentTextIcon, 
  UsersIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ArrowRightIcon,
  PlusIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import { PageLoading } from '@components/common/PageLoading';
import { Link } from 'react-router-dom';

export const HoldingDashboard = () => {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useHoldingDashboard();

  // Проверяем тип организации
  const userOrg = user && 'organization' in user ? (user.organization as any) : null;
  const isHoldingOrg = userOrg?.organization_type === 'holding';

  // Если не холдинг, показываем экран создания холдинга
  if (!isHoldingOrg) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-12 text-white">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <RocketLaunchIcon className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center mb-3">
              Создайте свой холдинг
            </h1>
            <p className="text-center text-purple-100 max-w-2xl mx-auto">
              Преобразуйте вашу организацию в холдинг для управления дочерними компаниями, 
              консолидации отчетности и централизованного контроля проектов
            </p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Управление организациями</h3>
                <p className="text-sm text-gray-600">
                  Создавайте и управляйте дочерними организациями в единой системе
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChartBarIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Консолидированная отчетность</h3>
                <p className="text-sm text-gray-600">
                  Получайте сводную аналитику по всем проектам и контрактам
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UsersIcon className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Централизованный контроль</h3>
                <p className="text-sm text-gray-600">
                  Управляйте доступами и правами пользователей всех организаций
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Что произойдет при создании холдинга:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Ваша организация "{userOrg?.name}" станет родительской организацией холдинга</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Вы сможете создавать и управлять дочерними организациями</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Получите доступ к консолидированным отчетам и аналитике</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Существующие проекты и данные сохранятся без изменений</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg font-semibold"
                onClick={() => {
                  // TODO: Реализовать создание холдинга
                  alert('Функция создания холдинга будет доступна в следующей версии. Обратитесь к администратору.');
                }}
              >
                <PlusIcon className="w-5 h-5" />
                Создать холдинг
              </button>
              <Link
                to="/dashboard"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Отмена
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Дальше идет обычная логика для холдинга

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Повторить попытку
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Нет данных для отображения</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Обзор холдинга "{data.holding_info.name}"
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Обновлено: {formatDate(data.last_update)}
          </p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowPathIcon className="w-5 h-5" />
          Обновить
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
            <ChartBarIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{data.summary.projects}</div>
          <div className="text-sm text-gray-500 mt-1">Всего проектов</div>
          <div className="mt-3 text-xs text-gray-600">
            Активных: <span className="font-semibold text-green-600">{data.summary.active_projects}</span>
            {' • '}
            Завершенных: <span className="font-semibold">{data.summary.completed_projects}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <BanknotesIcon className="w-8 h-8 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {formatCurrency(data.summary.budget)}
          </div>
          <div className="text-sm text-gray-500 mt-1">Общий бюджет</div>
          <div className="mt-3 text-xs text-gray-600">
            {(data.summary.budget / 1_000_000).toFixed(1)} млн ₽
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <DocumentTextIcon className="w-8 h-8 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{data.summary.contracts}</div>
          <div className="text-sm text-gray-500 mt-1">Контракты</div>
          <div className="mt-3 text-xs text-gray-600">
            На сумму: {formatCurrency(data.summary.contract_amount)}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <UsersIcon className="w-8 h-8 text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{data.summary.users}</div>
          <div className="text-sm text-gray-500 mt-1">Сотрудники</div>
          <div className="mt-3 text-xs text-gray-600">
            Всего пользователей в холдинге
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Дочерние организации</h2>
        </div>
        <div className="p-6">
          {data.organizations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Дочерние организации не найдены
            </div>
          ) : (
            <div className="space-y-3">
              {data.organizations.map((org) => (
                <Link
                  key={org.org_id}
                  to={`/landing/multi-organization/projects?org=${org.org_id}`}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 group-hover:text-blue-600">
                        {org.org_name}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {org.projects} проектов • {org.users} сотрудников
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(org.budget)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {org.contracts} контрактов
                    </div>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/landing/multi-organization/projects"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                Все проекты холдинга
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Просмотр и управление проектами всех организаций
              </p>
            </div>
            <ArrowRightIcon className="w-6 h-6 text-gray-400 group-hover:text-blue-600" />
          </div>
        </Link>

        <Link
          to="/landing/multi-organization/contracts"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                Все контракты холдинга
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Просмотр контрактов всех организаций
              </p>
            </div>
            <ArrowRightIcon className="w-6 h-6 text-gray-400 group-hover:text-blue-600" />
          </div>
        </Link>
      </div>
    </div>
  );
};

