import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Subscription {
  id: number;
  plan_name: string;
  status: string;
  start_date: string;
  end_date: string;
  price: number;
  billing_period: string;
  auto_renew: boolean;
  features: string[];
}

const SubscriptionsList: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    // Имитация загрузки данных с API
    setTimeout(() => {
      const mockSubscriptions: Subscription[] = [
        {
          id: 1,
          plan_name: 'Базовый',
          status: 'Активна',
          start_date: '15.03.2023',
          end_date: '15.03.2024',
          price: 1990,
          billing_period: 'Ежемесячно',
          auto_renew: true,
          features: [
            'До 5 проектов',
            'До 10 пользователей',
            'Базовая отчетность',
            'Техническая поддержка',
          ],
        },
        {
          id: 2,
          plan_name: 'Корпоративный',
          status: 'Ожидает оплаты',
          start_date: '15.03.2024',
          end_date: '15.03.2025',
          price: 4990,
          billing_period: 'Ежемесячно',
          auto_renew: false,
          features: [
            'Неограниченное количество проектов',
            'До 50 пользователей',
            'Расширенная отчетность',
            'Приоритетная техническая поддержка',
            'API-интеграция',
            'Персональный менеджер',
          ],
        },
      ];
      setSubscriptions(mockSubscriptions);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'Активна':
        return 'bg-green-100 text-green-800';
      case 'Ожидает оплаты':
        return 'bg-yellow-100 text-yellow-800';
      case 'Приостановлена':
        return 'bg-red-100 text-red-800';
      case 'Отменена':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
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
        <h1 className="text-2xl font-bold">Управление подписками</h1>
        <Link to="/dashboard/subscriptions/new" className="btn btn-primary">
          Подключить новый тариф
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {subscriptions.map((subscription) => (
          <div
            key={subscription.id}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{subscription.plan_name}</h2>
                  <p className="text-gray-500 text-sm">
                    Тариф: {subscription.billing_period} - {subscription.price} ₽
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                    subscription.status
                  )}`}
                >
                  {subscription.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="block text-sm text-gray-500">Начало:</span>
                  <span className="font-medium">{subscription.start_date}</span>
                </div>
                <div>
                  <span className="block text-sm text-gray-500">Окончание:</span>
                  <span className="font-medium">{subscription.end_date}</span>
                </div>
                <div>
                  <span className="block text-sm text-gray-500">Автопродление:</span>
                  <span className="font-medium">
                    {subscription.auto_renew ? 'Включено' : 'Отключено'}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Включено в тариф:</h3>
                <ul className="space-y-1">
                  {subscription.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <svg
                        className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap justify-between space-y-2 sm:space-y-0">
                {subscription.status === 'Активна' && (
                  <button
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                    onClick={() => {
                      if (window.confirm('Вы уверены, что хотите отменить подписку?')) {
                        console.log('Отмена подписки', subscription.id);
                      }
                    }}
                  >
                    Отменить подписку
                  </button>
                )}
                {subscription.status === 'Ожидает оплаты' && (
                  <button className="btn btn-primary text-sm" onClick={() => console.log('Оплата подписки', subscription.id)}>
                    Оплатить сейчас
                  </button>
                )}
                <Link
                  to={`/dashboard/subscriptions/${subscription.id}`}
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                >
                  Подробнее
                </Link>
                <button
                  className={`text-sm font-medium ${
                    subscription.auto_renew
                      ? 'text-orange-600 hover:text-orange-800'
                      : 'text-green-600 hover:text-green-800'
                  }`}
                  onClick={() => console.log('Переключение автопродления', subscription.id)}
                >
                  {subscription.auto_renew ? 'Отключить автопродление' : 'Включить автопродление'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {subscriptions.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">У вас пока нет подписок</h2>
          <p className="text-gray-500 mb-6">
            Выберите подходящий тариф, чтобы начать пользоваться всеми возможностями системы
          </p>
          <Link to="/dashboard/subscriptions/plans" className="btn btn-primary">
            Выбрать тариф
          </Link>
        </div>
      )}

      <div className="mt-8 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Справка по тарифам</h3>
        <p className="text-blue-700 mb-2">
          Если у вас возникли вопросы по тарифам или вам нужен индивидуальный тариф, свяжитесь с
          нашим отделом продаж.
        </p>
        <a href="mailto:sales@proexpert.ru" className="text-blue-600 hover:text-blue-800 font-medium">
          sales@proexpert.ru
        </a>
        <span className="mx-2 text-blue-400">|</span>
        <a href="tel:+78001234567" className="text-blue-600 hover:text-blue-800 font-medium">
          8 (800) 123-45-67
        </a>
      </div>
    </div>
  );
};

export default SubscriptionsList; 