import { useState, useEffect, useCallback } from 'react';
import { billingService, UserSubscription, SubscriptionPlan, SubscribeToPlanRequest, ErrorResponse } from '@utils/api';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ShoppingCartIcon, NoSymbolIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { PageLoading } from '@components/common/PageLoading'; // Предполагаем наличие компонента-заглушки

// Вспомогательный компонент для отображения деталей плана
const PlanFeature = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-center space-x-2">
    <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
    <span className="text-sm text-gray-700">{children}</span>
  </li>
);

const SubscriptionsPage = () => {
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingSubscription, setLoadingSubscription] = useState<boolean>(true);
  const [loadingPlans, setLoadingPlans] = useState<boolean>(true);
  const [errorSubscription, setErrorSubscription] = useState<string | null>(null);
  const [errorPlans, setErrorPlans] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null); // Для отслеживания slug плана при подписке/отмене

  const fetchSubscriptionAndPlans = useCallback(async () => {
    setLoadingSubscription(true);
    setLoadingPlans(true);
    setErrorSubscription(null);
    setErrorPlans(null);

    try {
      const subResponse = await billingService.getCurrentSubscription();
      console.log('[SubscriptionsList] Fetched current subscription response:', subResponse);

      if (subResponse.status === 200 && subResponse.data) {
        // Проверяем, есть ли вложенный объект 'data'
        const subscriptionData = (typeof subResponse.data === 'object' && subResponse.data !== null && 'data' in subResponse.data && typeof (subResponse.data as any).data === 'object') 
                               ? (subResponse.data as any).data as UserSubscription 
                               : subResponse.data as UserSubscription; // Или используем subResponse.data напрямую, если нет обертки
        
        // Дополнительная проверка, что subscriptionData содержит поле plan
        if (subscriptionData && typeof subscriptionData === 'object' && 'plan' in subscriptionData && subscriptionData.plan !== null) {
            setCurrentSubscription(subscriptionData);
            console.log('[SubscriptionsList] Current subscription SET in state:', subscriptionData);
        } else {
            console.warn('[SubscriptionsList] Subscription data received, but `plan` object is missing or null. Setting currentSubscription to null.', subscriptionData);
            setCurrentSubscription(null); // Если plan отсутствует, считаем, что данных для отображения нет
            // Можно также установить специфическую ошибку, если это ожидалось
            // setErrorSubscription('Данные о плане подписки не получены.'); 
        }
      } else if (subResponse.status === 404) {
        console.log('[SubscriptionsList] No active subscription found (404). Setting currentSubscription to null.');
        setCurrentSubscription(null);
      } else {
        const errorData = subResponse.data as unknown as ErrorResponse; 
        console.error('[SubscriptionsList] Error response from getCurrentSubscription:', errorData, subResponse.status);
        throw new Error(errorData?.message || `Ошибка ${subResponse.status}: ${subResponse.statusText}`);
      }
    } catch (err: any) {
      console.error("Error fetching current subscription:", err);
      setErrorSubscription(err.message || 'Не удалось загрузить текущую подписку.');
      setCurrentSubscription(null);
    } finally {
      setLoadingSubscription(false);
    }

    try {
      const plansResponse = await billingService.getPlans();
      if (plansResponse.status === 200 && Array.isArray(plansResponse.data)) {
        setPlans(plansResponse.data as SubscriptionPlan[]);
      } else if (plansResponse.status !== 200 && plansResponse.data && typeof plansResponse.data === 'object' && 'message' in plansResponse.data) {
        console.error("Error fetching plans (API error object received):", (plansResponse.data as ErrorResponse).message);
        setErrorPlans((plansResponse.data as ErrorResponse).message || 'Не удалось загрузить тарифные планы (ошибка API).');
        setPlans([]);
      } else {
        console.error("Error fetching plans (unexpected structure or non-array data):", plansResponse.data);
        setErrorPlans('Не удалось загрузить тарифные планы (неверный формат ответа).');
        setPlans([]);
      }
    } catch (err: any) {
      console.error("Error fetching plans (network/other error):", err);
      setErrorPlans(err.message || 'Не удалось загрузить тарифные планы (ошибка сети).');
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptionAndPlans();
  }, [fetchSubscriptionAndPlans]);

  const handleSubscribe = async (planSlug: string) => {
    setActionInProgress(planSlug);
    setErrorSubscription(null);
    try {
      const payload: SubscribeToPlanRequest = { plan_slug: planSlug };
      const response = await billingService.subscribeToPlan(payload);
      if (response.status === 201 || response.status === 200) { 
         console.log('Subscription process successful via API, refetching all subscription and plan data.');
         await fetchSubscriptionAndPlans(); 
      } else {
        const errorData = response.data as unknown as ErrorResponse;
        throw new Error(errorData?.message || `Ошибка ${response.status}: ${response.statusText}`);
      }
    } catch (err: any) {
      console.error(`Error subscribing to plan ${planSlug}:`, err);
      setErrorSubscription(err.message || `Не удалось подписаться на план ${planSlug}.`);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;
    setActionInProgress('cancel_current');
    setErrorSubscription(null);
    try {
      const response = await billingService.cancelSubscription({ at_period_end: true });
      if (response.status === 200) {
        setCurrentSubscription(response.data as UserSubscription);
      } else {
         const errorData = response.data as unknown as ErrorResponse;
        throw new Error(errorData?.message || `Ошибка ${response.status}: ${response.statusText}`);
      }
    } catch (err: any) {
      console.error("Error canceling subscription:", err);
      setErrorSubscription(err.message || 'Не удалось отменить подписку.');
    } finally {
      setActionInProgress(null);
    }
  };
  
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Н/Д';
    return new Date(dateString).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loadingSubscription || loadingPlans) {
    return <PageLoading message="Загрузка информации о подписках и планах..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Секция текущей подписки */}
      <section className="bg-white shadow-lg rounded-xl p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Текущая подписка</h2>
        {errorSubscription && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start">
            <XCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{errorSubscription}</p>
      </div>
        )}
        {currentSubscription && currentSubscription.plan ? (
          <div className="space-y-8">
            {/* УЛЬТРА-СОВРЕМЕННЫЙ блок информации о подписке */}
            <div className="bg-white rounded-2xl shadow-subtle overflow-hidden">
              {/* Шапка с названием плана и статусом */}
              <div className={`p-6 ${currentSubscription.canceled_at ? 'bg-gray-100' : 'bg-primary-600'}  text-white`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h3 className={`text-3xl font-extrabold tracking-tight ${currentSubscription.canceled_at ? 'text-gray-700' : 'text-white'}`}>{currentSubscription.plan.name}</h3>
                    <p className={`text-sm mt-1 ${currentSubscription.canceled_at ? 'text-gray-500' : 'opacity-80'}`}>{currentSubscription.plan.description}</p>
                </div>
                <span
                    className={`text-xs font-semibold py-1.5 px-3 rounded-full leading-none flex items-center space-x-1.5 whitespace-nowrap mt-2 sm:mt-0
                      ${currentSubscription.is_active_now && !currentSubscription.canceled_at ? 'bg-green-100 text-green-700 ring-1 ring-green-300' : ''}
                      ${!currentSubscription.is_active_now && !currentSubscription.canceled_at ? 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-300' : ''}
                      ${currentSubscription.canceled_at ? 'bg-red-100 text-red-700 ring-1 ring-red-300' : ''}
                    `}
                  >
                    {currentSubscription.is_active_now && !currentSubscription.canceled_at && <CheckCircleIcon className="h-4 w-4" />}
                    {!currentSubscription.is_active_now && !currentSubscription.canceled_at && <ExclamationTriangleIcon className="h-4 w-4" />}
                    {currentSubscription.canceled_at && <NoSymbolIcon className="h-4 w-4" />}
                    <span className="capitalize">
                      {currentSubscription.canceled_at ? `Отменена` : currentSubscription.status}
                </span>
                  </span>
                </div>
              </div>

              {/* Тело с деталями подписки */}
              <div className="p-6 bg-gray-50">
                <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4 text-sm">
                  {currentSubscription.starts_at && 
                    <div><dt className="font-medium text-gray-500">Дата начала:</dt> <dd className="text-gray-800 font-semibold">{formatDate(currentSubscription.starts_at)}</dd></div>}
                  {currentSubscription.ends_at && !currentSubscription.canceled_at && 
                    <div><dt className="font-medium text-gray-500">Дата окончания:</dt> <dd className="text-gray-800 font-semibold">{formatDate(currentSubscription.ends_at)}</dd></div>}
                  {currentSubscription.next_billing_at && !currentSubscription.canceled_at &&
                    <div><dt className="font-medium text-gray-500">Следующий платеж:</dt> <dd className="text-gray-800 font-semibold">{formatDate(currentSubscription.next_billing_at)}</dd></div>}
                  {currentSubscription.trial_ends_at && 
                    <div><dt className="font-medium text-gray-500">Пробный период до:</dt> <dd className="text-gray-800 font-semibold">{formatDate(currentSubscription.trial_ends_at)}</dd></div>}
                </dl>

                {currentSubscription.canceled_at && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-700 text-sm">
                    <p className="flex items-center"><InformationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                    Ваша подписка была отменена {formatDate(currentSubscription.canceled_at)} и будет активна до {formatDate(currentSubscription.ends_at)}.</p>
              </div>
                )}
              </div>
            </div>

            {currentSubscription.status === 'active' && !currentSubscription.canceled_at && (
              <button
                onClick={handleCancelSubscription}
                disabled={actionInProgress === 'cancel_current'}
                className="w-full flex items-center justify-center px-6 py-3.5 border border-transparent rounded-xl shadow-md text-base font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-150 ease-in-out transform hover:scale-102 active:scale-98 group"
              >
                <NoSymbolIcon className="h-5 w-5 mr-2.5 transition-transform duration-150 group-hover:rotate-12" />
                {actionInProgress === 'cancel_current' ? 'Отменяем подписку...' : 'Отменить подписку'}
              </button>
            )}
             {currentSubscription.status !== 'active' && currentSubscription.status !== 'trial' && (
                 <p className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-md text-sm flex items-start">
                    <InformationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>Ваша подписка не активна. Пожалуйста, выберите один из планов ниже.</span>
                </p>
             )}
          </div>
        ) : (
          !errorSubscription && !loadingSubscription && <p className="text-gray-600">У вас нет активной подписки.</p> // Добавил !loadingSubscription
        )}
      </section>

      {/* Секция доступных планов */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">Доступные тарифные планы</h2>
        {errorPlans && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start">
            <XCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{errorPlans}</p>
        </div>
      )}
        {plans.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.sort((a, b) => a.display_order - b.display_order).map((plan) => {
              const isCurrentPlan = currentSubscription?.plan?.id === plan.id && currentSubscription?.status === 'active';
              const isSubscribingToThis = actionInProgress === plan.slug;
              return (
                <div key={plan.slug} className={`bg-white rounded-xl shadow-lg p-6 flex flex-col ${isCurrentPlan ? 'ring-2 ring-primary-500' : 'border border-gray-200'}`}>
                  <div className="flex-grow space-y-3">
                    <h3 className="text-xl font-semibold text-gray-800">{plan.name}</h3>
                    <p className="text-2xl font-bold text-primary-600">
                      {plan.price.toLocaleString('ru-RU', { style: 'currency', currency: plan.currency, minimumFractionDigits: 0 })}
                      <span className="text-sm font-normal text-gray-500"> / {plan.duration_in_days === 30 ? 'месяц' : `${plan.duration_in_days} дней`}</span>
                    </p>
                    <p className="text-sm text-gray-600 min-h-[40px]">{plan.description || 'Базовый набор функций для начала работы.'}</p>
                    <ul className="space-y-1 pt-2">
                      {plan.features && Array.isArray(plan.features) 
                        ? plan.features.map((feature, index) => <PlanFeature key={index}>{feature}</PlanFeature>) 
                        : <PlanFeature>Основные возможности</PlanFeature>
                      }
                      {plan.max_foremen !== null && <PlanFeature>Прорабы: {plan.max_foremen ?? 'Без ограничений'}</PlanFeature>}
                      {plan.max_projects !== null && <PlanFeature>Проекты: {plan.max_projects ?? 'Без ограничений'}</PlanFeature>}
                      {plan.max_storage_gb !== null && <PlanFeature>Хранилище: {plan.max_storage_gb} ГБ</PlanFeature>}
                    </ul>
                  </div>
                  <div className="mt-6">
                    {isCurrentPlan ? (
                      <div className="flex items-center justify-center px-6 py-3 border border-green-500 rounded-md text-green-600 font-medium">
                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                        Ваш текущий план
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSubscribe(plan.slug)}
                        disabled={!!actionInProgress || currentSubscription?.status === 'active' || currentSubscription?.status === 'trial'}
                        className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingCartIcon className="h-5 w-5 mr-2" />
                        {isSubscribingToThis ? 'Обработка...' : 'Выбрать план'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
      </div>
        ) : (
           !errorPlans && !loadingPlans && <p className="text-center text-gray-600">Тарифные планы не найдены.</p> // Добавил !loadingPlans
        )}
      </section>
    </div>
  );
};

export default SubscriptionsPage; 