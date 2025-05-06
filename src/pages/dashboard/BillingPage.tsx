import { Link } from 'react-router-dom';
import { BanknotesIcon, ArrowPathIcon, ChartBarIcon, PlusCircleIcon, WalletIcon } from '@heroicons/react/24/outline';

const BillingPage = () => {
  // Заглушка для баланса, позже будет из API или пропсов
  const currentBalance = '15,750.00 ₽'; 

  return (
    <div className="py-6">
      <div className="mb-8">
        <div className="flex items-center">
          <BanknotesIcon className="h-10 w-10 text-primary-600" />
          <div className="ml-4">
            <h1 className="text-2xl font-semibold text-secondary-900">Биллинг и платежи</h1>
            <p className="mt-1 text-sm text-secondary-500">
              Управляйте своим балансом, просматривайте историю операций и статистику расходов.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Секция Текущий баланс и пополнение */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-medium text-secondary-900 flex items-center">
                <WalletIcon className="h-6 w-6 mr-2 text-primary-500" />
                Текущий баланс
              </h2>
              <p className="text-3xl font-semibold text-secondary-900 mt-1">{currentBalance}</p>
            </div>
            <Link 
              to="/dashboard/billing/add-funds" 
              className="mt-4 sm:mt-0 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Пополнить баланс
            </Link>
          </div>
        </div>

        {/* Секция История операций (заглушка) */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-lg font-medium text-secondary-900 flex items-center">
            <ArrowPathIcon className="h-6 w-6 mr-2 text-primary-500" />
            История операций
          </h2>
          <div className="mt-4 text-center text-secondary-500 py-8">
            <p>Раздел истории операций находится в разработке.</p>
            <p>Здесь будет отображаться таблица с вашими пополнениями и списаниями.</p>
          </div>
        </div>

        {/* Секция Статистика расходов (заглушка) */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-lg font-medium text-secondary-900 flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-2 text-primary-500" />
            Статистика расходов
          </h2>
          <div className="mt-4 text-center text-secondary-500 py-8">
            <p>Раздел статистики расходов находится в разработке.</p>
            <p>Здесь будут отображаться графики и сводные данные по вашим тратам.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage; 