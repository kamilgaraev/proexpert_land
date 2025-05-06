import { useState, useEffect, useCallback } from 'react';
import { billingService, UserSubscription, SubscriptionPlan, SubscribeToPlanRequest, ErrorResponse } from '@utils/api';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ShoppingCartIcon, NoSymbolIcon } from '@heroicons/react/24/outline';
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
      if (subResponse.status === 200) {
        setCurrentSubscription(subResponse.data as UserSubscription);
      } else if (subResponse.status === 404) {
        setCurrentSubscription(null);
      } else {
        const errorData = subResponse.data as unknown as ErrorResponse; 
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
      setPlans((plansResponse.data as SubscriptionPlan[]) || []);
    } catch (err: any) {
      console.error("Error fetching plans:", err);
      setErrorPlans(err.message || 'Не удалось загрузить тарифные планы.');
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
         setCurrentSubscription(response.data as UserSubscription);
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
          <div className="space-y-4">
            <div className="p-6 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md">
              <h3 className="text-xl font-bold">{currentSubscription.plan.name}</h3>
              <p className="text-sm opacity-90">{currentSubscription.plan.description}</p>
              <div className="mt-3 text-xs">
                <p>Статус: <span className="font-semibold capitalize">{currentSubscription.status}</span> {currentSubscription.is_active_now ? <CheckCircleIcon className="h-4 w-4 inline text-green-300" /> : <XCircleIcon className="h-4 w-4 inline text-red-300" />}</p>
                {currentSubscription.trial_ends_at && <p>Пробный период до: {formatDate(currentSubscription.trial_ends_at)}</p>}
                {currentSubscription.starts_at && <p>Начало: {formatDate(currentSubscription.starts_at)}</p>}
                {currentSubscription.ends_at && <p>Окончание: {formatDate(currentSubscription.ends_at)}</p>}
                {currentSubscription.next_billing_at && <p>Следующий платеж: {formatDate(currentSubscription.next_billing_at)}</p>}
                {currentSubscription.canceled_at && <p className="text-yellow-300">Отменена: {formatDate(currentSubscription.canceled_at)} (будет действовать до {formatDate(currentSubscription.ends_at)})</p>}
              </div>
            </div>
            
            {currentSubscription.status === 'active' && !currentSubscription.canceled_at && (
              <button
                onClick={handleCancelSubscription}
                disabled={actionInProgress === 'cancel_current'}
                className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                <NoSymbolIcon className="h-5 w-5 mr-2" />
                {actionInProgress === 'cancel_current' ? 'Отменяем...' : 'Отменить подписку'}
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
                      {plan.features.map((feature, index) => <PlanFeature key={index}>{feature}</PlanFeature>)}
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