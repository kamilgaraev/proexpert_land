import { useHoldingDashboard } from '@/hooks/useHoldingDashboard';
import { 
  BuildingOfficeIcon, 
  BanknotesIcon, 
  DocumentTextIcon, 
  UsersIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { PageLoading } from '@components/common/PageLoading';
import { Link } from 'react-router-dom';

export const HoldingDashboard = () => {
  const { data, loading, error, refetch } = useHoldingDashboard();

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

