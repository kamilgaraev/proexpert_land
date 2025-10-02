import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { billingService } from '@utils/api';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { Switch } from '@headlessui/react';
import ConfirmActionModal from '@components/shared/ConfirmActionModal';
import { PageLoading } from '@components/common/PageLoading'; // Предполагаем наличие компонента-заглушки
import NotificationService from '@components/shared/NotificationService';

const PaidServicesPage = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const [currentPlan, setCurrentPlan] = useState<any | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoPayEnabled, setAutoPayEnabled] = useState<boolean | null>(null);
  const [autoPayUpdating, setAutoPayUpdating] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [changePlanLoading, setChangePlanLoading] = useState<string | null>(null);
  const [changePlanModal, setChangePlanModal] = useState<{ 
    plan: any; 
    previewData?: {
      current_subscription: any;
      new_subscription: any;
      billing_calculation: any;
      balance_check: any;
      can_proceed: boolean;
      message: string;
    } 
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Функция для разовых покупок и связанные состояния удалены как неиспользуемые
  const [planAction, setPlanAction] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [subRes, plansRes] = await Promise.all([
        billingService.getCurrentSubscription(),
        billingService.getPlans(),
      ]);
      const actualData = (subRes.data as any)?.data || subRes.data;
      const subscriptionData = actualData && typeof actualData === 'object' 
        ? ('has_subscription' in actualData && actualData.has_subscription 
          ? actualData.subscription 
          : actualData.status ? actualData : null)
        : null;
      
      setSubscription(subscriptionData);
      if (subscriptionData && typeof subscriptionData.is_auto_payment_enabled === 'boolean') {
        setAutoPayEnabled(subscriptionData.is_auto_payment_enabled);
      }
      const fetchedPlans = Array.isArray(plansRes.data) ? plansRes.data : [];
      setPlans(fetchedPlans);
      // определяем текущий план по subscription_plan_id, plan_name или slug
      const cp = subscriptionData ? fetchedPlans.find((p: any) => 
        p.id === subscriptionData.subscription_plan_id ||
        p.id === (subscriptionData.plan?.id) ||
        p.name === subscriptionData.plan_name ||
        p.slug === subscriptionData.plan_name ||
        p.name?.toLowerCase() === subscriptionData.plan_name?.toLowerCase() ||
        p.slug?.toLowerCase() === subscriptionData.plan_name?.toLowerCase()
      ) : null;
      setCurrentPlan(cp || null);
    } catch (e: any) {
      setError(e.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handlePlanChange = async (plan: any) => {
    setError(null);
    
    if (!subscription) {
      // Новая подписка
      setPlanAction(plan.slug);
      try {
        const response = await billingService.subscribeToPlan({ 
          plan_slug: plan.slug, 
          is_auto_payment_enabled: true 
        });

        // Проверяем статус ответа
        if (response.status === 402) {
          // Ошибка недостаточности средств
          const message = response.data?.message || 'Недостаточно средств на балансе';
          setError(message);
          NotificationService.show({
            type: 'error',
            title: 'Ошибка оплаты',
            message: message
          });
          return;
        } else if (response.status !== 200 && response.status !== 201) {
          // Другие ошибки сервера
          const message = response.data?.message || `Ошибка сервера: ${response.status}`;
          setError(message);
          NotificationService.show({
            type: 'error',
            title: 'Ошибка',
            message: message
          });
          return;
        } else if (!response.data?.success) {
          // Ошибка в логике приложения
          const message = response.data?.message || 'Не удалось оформить подписку';
          setError(message);
          NotificationService.show({
            type: 'error',
            title: 'Ошибка',
            message: message
          });
          return;
        }

        // Успешно - обновляем данные
        await fetchAll();
        NotificationService.show({
          type: 'success',
          title: 'Подписка оформлена',
          message: 'Тариф успешно активирован'
        });
      } catch (e: any) {
        const errorMessage = e.message || 'Ошибка оформления тарифа';
        setError(errorMessage);
        NotificationService.show({
          type: 'error',
          title: 'Ошибка',
          message: errorMessage
        });
      } finally {
        setPlanAction(null);
      }
    } else {
      // Получаем preview смены тарифа (без реального изменения)
      setChangePlanLoading(plan.slug);
      try {
        const response = await billingService.changePlanPreview({ plan_slug: plan.slug });
        
        if (response.data.success || response.status === 200) {
          // Извлекаем данные из новой структуры ответа с безопасной обработкой
          const apiData = response.data.data || {};
          const previewData = {
            current_subscription: apiData.current_subscription || {},
            new_subscription: apiData.new_subscription || {},
            billing_calculation: apiData.billing_calculation || {},
            balance_check: apiData.balance_check || {},
            can_proceed: apiData.can_proceed || false,
            message: response.data.message || 'Предпросмотр смены тарифа'
          };
          
          
          // Показываем модальное окно с детальным предпросмотром
          setChangePlanModal({ plan, previewData });
        }
      } catch (e: any) {
        // Обработка ошибок предпросмотра
        const errorData = e.response?.data;
        
        if (errorData?.success && errorData?.data) {
          // Недостаточно средств - API возвращает данные в ошибке
          const apiData = errorData.data || {};
          const previewData = {
            current_subscription: apiData.current_subscription || {},
            new_subscription: apiData.new_subscription || {},
            billing_calculation: apiData.billing_calculation || {},
            balance_check: apiData.balance_check || {},
            can_proceed: apiData.can_proceed || false,
            message: errorData.message || 'Недостаточно средств для смены тарифа'
          };
          
          setChangePlanModal({ plan, previewData });
        } else {
          // Реальная ошибка API
          setError(e.message || errorData?.message || 'Ошибка получения информации о смене тарифа');
        }
      } finally {
        setChangePlanLoading(null);
      }
    }
  };

  const confirmPlanChange = async () => {
    if (!changePlanModal) return;
    
    setChangePlanLoading(changePlanModal.plan.slug);
    try {
      // Теперь делаем реальную смену тарифа
      const response = await billingService.changePlan({ plan_slug: changePlanModal.plan.slug });
      
      if (response.data.success || response.status === 200) {
        setChangePlanModal(null);
        
        // Показываем сообщение об успешной смене
        const successMessage = response.data.message || `Тариф успешно изменён на "${changePlanModal.plan.name}"`;
        console.log('✅ Тариф успешно изменён:', successMessage);
        
        // Очищаем предыдущие ошибки
        setError(null);
        
        await fetchAll();
      } else {
        setError(response.data.message || 'Ошибка смены тарифа');
      }
    } catch (e: any) {
      setError(e.message || 'Ошибка смены тарифа');
    } finally {
      setChangePlanLoading(null);
    }
  };


  // Функция для разовых покупок и связанные состояния удалены как неиспользуемые

  const handleToggleAutoPay = async () => {
    if (autoPayEnabled === null) return;
    const newValue = !autoPayEnabled;
    setAutoPayUpdating(true);
    try {
      await billingService.updateAutoPayment(newValue);
      setAutoPayEnabled(newValue);
    } catch (e: any) {
      setError(e.message || 'Ошибка обновления автоплатежа');
    } finally {
      setAutoPayUpdating(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    try {
      await billingService.cancelSubscription();
      setShowCancelModal(false);
      await fetchAll();
    } catch (e: any) {
      setError(e.message || 'Ошибка отмены подписки');
    } finally {
      setCancelLoading(false);
    }
  };

  const formatDate = (date?: string) => date ? new Date(date).toLocaleDateString('ru-RU') : '—';

  if (loading) return <PageLoading message="Загрузка платных услуг..." />;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 space-y-12">
      <h1 className="text-3xl font-bold mb-6">Платные услуги</h1>
      {error && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="font-medium">Требуется пополнение баланса</div>
            <div className="text-sm">{error}</div>
          </div>
          <div className="shrink-0">
            <Link
              to="/dashboard/billing/add-funds"
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-semibold"
            >
              Пополнить баланс
            </Link>
          </div>
        </div>
      )}

      {/* Текущая подписка */}
      <section className="bg-white shadow-lg rounded-2xl p-8 mb-10 ring-1 ring-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-steel-900">Текущая подписка</h2>
        {subscription && (subscription.status === 'active' || subscription.status === 'canceled_active') && currentPlan ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2">
                <span className="text-2xl font-bold text-orange-600">{currentPlan.name}</span>
                {subscription.status === 'canceled_active' ? (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">Отменён</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">Активен</span>
                )}
              </div>
              <div className="text-gray-600">{currentPlan.description}</div>
              <div className="text-sm text-gray-500">Действует до: {formatDate(subscription.ends_at)}</div>
              {subscription.status === 'canceled_active' && (
                <div className="text-sm text-yellow-600 font-medium">
                  ⚠️ Подписка отменена. Доступ сохранится до {formatDate(subscription.ends_at)}
                </div>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm">Автоплатёж</span>
                <Switch
                  checked={autoPayEnabled || false}
                  onChange={handleToggleAutoPay}
                  disabled={autoPayEnabled===null || autoPayUpdating}
                  className={`${autoPayEnabled ? 'bg-orange-500' : 'bg-gray-300'} relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500`}
                >
                  <span
                    aria-hidden="true"
                    className={`${autoPayEnabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform`}
                  />
                </Switch>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setShowCancelModal(true)} className="btn btn-outline text-red-600">Отменить подписку</button>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">Нет активной подписки</div>
        )}
      </section>

      {/* Тарифные планы */}
      <section className="bg-white shadow-lg rounded-2xl p-8 mb-10 ring-1 ring-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-steel-900">Тарифные планы</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.isArray(plans) && plans.map(plan => {
            const isActive = currentPlan && currentPlan.id === plan.id;
            return (
              <div
                key={plan.id}
                className={`group relative rounded-2xl p-6 flex flex-col shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg cursor-pointer ${isActive ? 'border-2 border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border border-gray-200 bg-white'}`}
              >
                <div className="mb-3">
                  <h3 className={`font-extrabold text-lg ${isActive ? 'text-orange-600' : 'text-steel-900 group-hover:text-orange-600'}`}>{plan.name}</h3>
                  <p className="text-2xl font-bold text-orange-600 mt-1">{plan.price.toLocaleString('ru-RU', { style: 'currency', currency: plan.currency })}<span className="text-base font-medium text-steel-600"> / {plan.duration_in_days === 30 ? 'мес.' : `${plan.duration_in_days} дн.`}</span></p>
                  {plan.description && <p className="text-sm text-steel-600 mt-2 leading-snug">{plan.description}</p>}
                </div>
                <ul className="text-sm text-steel-700 space-y-1 mb-6 flex-1">
                  {(() => {
                    // Обрабатываем features как массив строк или объект с массивами
                    if (Array.isArray(plan.features)) {
                      return plan.features.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2"><CheckCircleIcon className="h-5 w-5 text-green-500 shrink-0" /> <span>{f}</span></li>
                      ));
                    } else if (plan.features && typeof plan.features === 'object') {
                      // Если features - объект, объединяем все массивы
                      const allFeatures = Object.values(plan.features as Record<string, string[]>).flat().filter(Boolean);
                      return Array.isArray(allFeatures) ? allFeatures.map((f, i) => (
                        <li key={i} className="flex items-start gap-2"><CheckCircleIcon className="h-5 w-5 text-green-500 shrink-0" /> <span>{String(f)}</span></li>
                      )) : null;
                    }
                    return null;
                  })()}
                  {plan.max_foremen && <li>Прорабы: {plan.max_foremen}</li>}
                  {plan.max_projects && <li>Проекты: {plan.max_projects}</li>}
                  {plan.max_storage_gb && <li>Хранилище: {plan.max_storage_gb} ГБ</li>}
                </ul>
                {isActive ? (
                  <span className="inline-block w-full text-center py-2 text-sm font-semibold text-white rounded-md bg-gradient-to-r from-orange-500 to-orange-600">Ваш тариф</span>
                ) : (
                  <button
                    onClick={() => handlePlanChange(plan)}
                    disabled={planAction === plan.slug || changePlanLoading === plan.slug}
                    className="inline-block w-full py-2 text-sm font-semibold text-white rounded-md bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-60"
                  >
                    {planAction === plan.slug || changePlanLoading === plan.slug 
                      ? (subscription ? 'Смена...' : 'Подписка…') 
                      : (subscription ? 'Сменить' : 'Выбрать')
                    }
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>


      {/* Разовые покупки удалены по требованию */}
      <ConfirmActionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelSubscription}
        title="Отменить подписку?"
        message="После отмены услуги будут действовать до конца оплаченного периода."
        confirmLabel="Отменить"
        confirmColorClass="red"
        isLoading={cancelLoading}
      />

      {/* Модальное окно смены тарифа */}
      {changePlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6">Предпросмотр смены тарифа</h3>
            
            {changePlanModal.previewData ? (
              <div className="space-y-6">
                {/* Сообщение */}
                <div className={`p-4 rounded-lg ${changePlanModal.previewData.can_proceed ? 'bg-blue-50 border border-blue-200' : 'bg-red-50 border border-red-200'}`}>
                  {changePlanModal.previewData.can_proceed ? (
                    <div className="text-sm text-blue-800">
                      <div className="font-medium mb-1">Готово к смене тарифа</div>
                      <div>Смена с "{changePlanModal.previewData.current_subscription.plan_name}" на "{changePlanModal.previewData.new_subscription.plan_name}". {
                        Number(changePlanModal.previewData.billing_calculation.difference) >= 0 
                          ? `Будет списано: ${Math.abs(Number(changePlanModal.previewData.billing_calculation.difference || 0)).toFixed(2)} ₽`
                          : `Будет возвращено: ${Math.abs(Number(changePlanModal.previewData.billing_calculation.difference || 0)).toFixed(2)} ₽`
                      }</div>
                    </div>
                  ) : (
                    <p className="text-sm text-red-800">
                      {changePlanModal.previewData.message}
                    </p>
                  )}
                </div>

                {/* Сравнение планов */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Текущий тариф</h4>
                    <div className="space-y-2 text-sm">
                      <div className="font-medium text-gray-800">
                        {changePlanModal.previewData.current_subscription.plan_name}
                      </div>
                      <div className="text-gray-600">
                        {Number(changePlanModal.previewData.current_subscription.price).toFixed(2)} ₽/мес
                      </div>
                      <div className="text-xs text-gray-500">
                        Действует до: {new Date(changePlanModal.previewData.current_subscription.ends_at).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-900 mb-3">Новый тариф</h4>
                    <div className="space-y-2 text-sm">
                      <div className="font-medium text-orange-800">
                        {changePlanModal.previewData.new_subscription.plan_name}
                      </div>
                      <div className="text-orange-700">
                        {Number(changePlanModal.previewData.new_subscription.price).toFixed(2)} ₽/мес
                      </div>
                      {changePlanModal.previewData.new_subscription.plan_description && (
                        <div className="text-xs text-orange-600">
                          {changePlanModal.previewData.new_subscription.plan_description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Сравнение лимитов */}
                {changePlanModal.previewData.new_subscription.limits && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Сравнение лимитов</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-gray-700 mb-2">Прорабы</div>
                          <div className="text-gray-600">
                            <span className="inline-block w-8 text-right">{currentPlan?.max_foremen || 0}</span>
                            <span className="mx-2 text-gray-400">→</span>
                            <span className={`font-medium ${
                              (changePlanModal.previewData.new_subscription.limits.max_foremen || 0) > (currentPlan?.max_foremen || 0) 
                                ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {changePlanModal.previewData.new_subscription.limits.max_foremen}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-700 mb-2">Проекты</div>
                          <div className="text-gray-600">
                            <span className="inline-block w-8 text-right">{currentPlan?.max_projects || 0}</span>
                            <span className="mx-2 text-gray-400">→</span>
                            <span className={`font-medium ${
                              (changePlanModal.previewData.new_subscription.limits.max_projects || 0) > (currentPlan?.max_projects || 0) 
                                ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {changePlanModal.previewData.new_subscription.limits.max_projects}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-700 mb-2">Хранилище</div>
                          <div className="text-gray-600">
                            <span className="inline-block w-8 text-right">{currentPlan?.max_storage_gb || 0}</span>
                            <span className="mx-2 text-gray-400">→</span>
                            <span className={`font-medium ${
                              (changePlanModal.previewData.new_subscription.limits.max_storage_gb || 0) > (currentPlan?.max_storage_gb || 0) 
                                ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {changePlanModal.previewData.new_subscription.limits.max_storage_gb} ГБ
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Расчёт платежа */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Детализация расчёта</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Оставшиеся дни:</span>
                      <span>{Math.round(Number(changePlanModal.previewData.billing_calculation.remaining_days || 0))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Остаток по текущему тарифу:</span>
                      <span>{Number(changePlanModal.previewData.billing_calculation.remaining_value || 0).toFixed(2)} ₽</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Стоимость нового тарифа:</span>
                      <span>{Number(changePlanModal.previewData.billing_calculation.new_plan_cost || 0).toFixed(2)} ₽</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>
                        {Number(changePlanModal.previewData.billing_calculation.difference) >= 0 ? 'К доплате:' : 'К возврату:'}
                      </span>
                      <span className={Number(changePlanModal.previewData.billing_calculation.difference) >= 0 ? 'text-red-600' : 'text-green-600'}>
                        {Math.abs(Number(changePlanModal.previewData.billing_calculation.difference || 0)).toFixed(2)} ₽
                      </span>
                    </div>
                  </div>
                </div>

                {/* Информация о балансе */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Баланс</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Текущий баланс:</span>
                      <span>{Number(changePlanModal.previewData.balance_check.current_balance || 0).toFixed(2)} ₽</span>
                    </div>
                    {changePlanModal.previewData.balance_check.required_amount > 0 && (
                      <div className="flex justify-between">
                        <span>Требуется:</span>
                        <span className="text-red-600">{Number(changePlanModal.previewData.balance_check.required_amount || 0).toFixed(2)} ₽</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold">
                      <span>Баланс после изменения:</span>
                      <span className={Number(changePlanModal.previewData.balance_check.balance_after_change) >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {Number(changePlanModal.previewData.balance_check.balance_after_change || 0).toFixed(2)} ₽
                      </span>
                    </div>
                  </div>
                </div>

                {/* Кнопки действий */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setChangePlanModal(null)}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Отменить
                  </button>
                  
                  {changePlanModal.previewData.can_proceed ? (
                    <button
                      onClick={confirmPlanChange}
                      disabled={changePlanLoading !== null}
                      className="flex-1 py-3 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-60 font-medium"
                    >
                      {changePlanLoading ? 'Смена тарифа...' : 'Подтвердить смену'}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setChangePlanModal(null);
                        navigate('/dashboard/billing/add-funds');
                      }}
                      className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Пополнить баланс
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Вы действительно хотите сменить тариф на <strong>{changePlanModal.plan.name}</strong>?
                  </p>
                  <p className="text-xs text-gray-500">
                    Изменение будет применено только после подтверждения
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setChangePlanModal(null)}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Отменить
                  </button>
                  <button
                    onClick={confirmPlanChange}
                    disabled={changePlanLoading !== null}
                    className="flex-1 py-2 px-4 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-60"
                  >
                    {changePlanLoading ? 'Смена...' : 'Подтвердить'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaidServicesPage; 