import { useState, useEffect, useCallback } from 'react';
import { billingService } from '@utils/api';
import { dispatchBalanceUpdate } from '@hooks/useBalance';
import { 
  CheckCircleIcon, 
  UserGroupIcon, 
  BuildingOfficeIcon, 
  CircleStackIcon,
  StarIcon,
  ArrowRightIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Switch } from '@headlessui/react';
import ConfirmActionModal from '@components/shared/ConfirmActionModal';
import NotificationService from '@components/shared/NotificationService';
import LimitWidget from '@components/dashboard/LimitWidget';

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
  const [planAction, setPlanAction] = useState<string | null>(null);

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
      
      // Важно: сохраняем лимиты из ответа, если они есть
      if (actualData && 'limits' in actualData) {
         subscriptionData.limits = actualData.limits;
      }

      setSubscription(subscriptionData);
      if (subscriptionData && typeof subscriptionData.is_auto_payment_enabled === 'boolean') {
        setAutoPayEnabled(subscriptionData.is_auto_payment_enabled);
      }
      const fetchedPlans = Array.isArray(plansRes.data) ? plansRes.data : [];
      setPlans(fetchedPlans);
      
      const cp = subscriptionData ? fetchedPlans.find((p: any) => {
        if (p.id === subscriptionData.subscription_plan_id || 
            p.id === subscriptionData.plan?.id ||
            String(p.id) === String(subscriptionData.subscription_plan_id) ||
            String(p.id) === String(subscriptionData.plan?.id)) {
          return true;
        }
        
        if (p.name === subscriptionData.plan_name ||
            p.slug === subscriptionData.plan_name ||
            p.name?.toLowerCase() === subscriptionData.plan_name?.toLowerCase() ||
            p.slug?.toLowerCase() === subscriptionData.plan_name?.toLowerCase()) {
          return true;
        }
        
        if (subscriptionData.plan && (
            p.slug === subscriptionData.plan.slug ||
            p.name === subscriptionData.plan.name ||
            p.name?.toLowerCase() === subscriptionData.plan.name?.toLowerCase())) {
          return true;
        }
        
        return false;
      }) : null;
      
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
      setPlanAction(plan.slug);
      try {
        const response = await billingService.subscribeToPlan({ 
          plan_slug: plan.slug, 
          is_auto_payment_enabled: true 
        });

        if (response.status === 402) {
          const message = response.data?.message || 'Недостаточно средств на балансе';
          setError(message);
          NotificationService.show({
            type: 'error',
            title: 'Ошибка оплаты',
            message: message
          });
          return;
        } else if (response.status !== 200 && response.status !== 201) {
          const message = response.data?.message || `Ошибка сервера: ${response.status}`;
          setError(message);
          NotificationService.show({
            type: 'error',
            title: 'Ошибка',
            message: message
          });
          return;
        } else if (!response.data?.success) {
          const message = response.data?.message || 'Не удалось оформить подписку';
          setError(message);
          NotificationService.show({
            type: 'error',
            title: 'Ошибка',
            message: message
          });
          return;
        }

        await fetchAll();
        dispatchBalanceUpdate();
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
      setChangePlanLoading(plan.slug);
      try {
        const response = await billingService.changePlanPreview({ plan_slug: plan.slug });
        
        if (response.data.success || response.status === 200) {
          const apiData = response.data.data || {};
          const previewData = {
            current_subscription: apiData.current_subscription || {},
            new_subscription: apiData.new_subscription || {},
            billing_calculation: apiData.billing_calculation || {},
            balance_check: apiData.balance_check || {},
            can_proceed: apiData.can_proceed || false,
            message: response.data.message || 'Предпросмотр смены тарифа'
          };
          
          setChangePlanModal({ plan, previewData });
        }
      } catch (e: any) {
        const errorData = e.response?.data;
        
        if (errorData?.success && errorData?.data) {
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
      const response = await billingService.changePlan({ plan_slug: changePlanModal.plan.slug });
      
      if (response.data.success || response.status === 200) {
        setChangePlanModal(null);
        setError(null);
        await fetchAll();
        dispatchBalanceUpdate();
      } else {
        setError(response.data.message || 'Ошибка смены тарифа');
      }
    } catch (e: any) {
      setError(e.message || 'Ошибка смены тарифа');
    } finally {
      setChangePlanLoading(null);
    }
  };

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
      dispatchBalanceUpdate();
    } catch (e: any) {
      setError(e.message || 'Ошибка отмены подписки');
    } finally {
      setCancelLoading(false);
    }
  };

  const formatDate = (date?: string) => date ? new Date(date).toLocaleDateString('ru-RU') : '—';

  if (loading) return (
     <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
           <ArrowPathIcon className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
           <p className="text-slate-500">Загрузка информации о тарифах...</p>
        </div>
     </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 pb-20">
      <div className="max-w-6xl mx-auto space-y-10">
        
        <div>
           <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Управление тарифом</h1>
           <p className="text-slate-500">
              Выберите подходящий план и управляйте подпиской 
           </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
            <div className="p-1 bg-red-100 rounded-full text-red-600">!</div>
            <div>
              <p className="font-bold text-red-800">Ошибка</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Current Subscription */}
        <section className="bg-white shadow-sm border border-slate-200 rounded-3xl overflow-hidden">
          <div className="p-1 bg-gradient-to-r from-orange-400 to-orange-600"></div>
          <div className="p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
               <StarIcon className="w-5 h-5 text-orange-500" />
               Ваша подписка
            </h2>
            
            {subscription && (subscription.status === 'active' || subscription.status === 'canceled_active') ? (
              <div className="space-y-8">
                {/* Plan Header */}
                <div className="flex flex-col md:flex-row justify-between gap-6 pb-8 border-b border-slate-100">
                  <div className="flex gap-5">
                     <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <StarIcon className="w-8 h-8 text-orange-600" />
                     </div>
                     <div>
                        <div className="flex items-center gap-3 mb-1">
                           <h3 className="text-2xl font-bold text-slate-900">{subscription.plan?.name || 'Тариф'}</h3>
                           <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              subscription.status === 'canceled_active' 
                                 ? 'bg-yellow-100 text-yellow-700' 
                                 : 'bg-emerald-100 text-emerald-700'
                           }`}>
                              {subscription.status === 'canceled_active' ? 'Отменён (активен)' : 'Активен'}
                           </span>
                        </div>
                        <p className="text-slate-500 mb-3">{subscription.plan?.description}</p>
                        <div className="flex items-center gap-2 text-2xl font-bold text-orange-600">
                           {subscription.plan?.price ? Number(subscription.plan.price).toLocaleString('ru-RU', { style: 'currency', currency: subscription.plan.currency || 'RUB' }) : ''}
                           <span className="text-sm font-medium text-slate-400">/ месяц</span>
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-4">
                     <div className="text-right">
                        <p className="text-sm text-slate-400 font-medium mb-1">Действует до</p>
                        <p className="text-lg font-bold text-slate-900">{formatDate(subscription.ends_at)}</p>
                     </div>
                     
                     <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                        <span className="text-sm font-medium text-slate-600">Автопродление</span>
                        <Switch
                          checked={autoPayEnabled || false}
                          onChange={handleToggleAutoPay}
                          disabled={autoPayEnabled===null || autoPayUpdating}
                          className={`${autoPayEnabled ? 'bg-orange-500' : 'bg-slate-300'} relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2`}
                        >
                          <span
                            aria-hidden="true"
                            className={`${autoPayEnabled ? 'translate-x-5' : 'translate-x-1'} pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform mt-1`}
                          />
                        </Switch>
                     </div>
                     
                     <button 
                        onClick={() => setShowCancelModal(true)} 
                        className="text-sm font-medium text-red-500 hover:text-red-600 hover:underline decoration-red-200 underline-offset-4 transition-all"
                     >
                        Отменить подписку
                     </button>
                  </div>
                </div>
                
                {/* Limits Grid */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 opacity-80">Ваши лимиты</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {subscription.limits && (
                      <>
                        <LimitWidget 
                           title="Прорабы" 
                           limit={subscription.limits.foremen} 
                           unit="чел." 
                           icon={UserGroupIcon} 
                        />
                        <LimitWidget 
                           title="Пользователи" 
                           limit={subscription.limits.users} 
                           unit="чел." 
                           icon={UserGroupIcon} 
                        />
                        <LimitWidget 
                           title="Проекты" 
                           limit={subscription.limits.projects} 
                           unit="шт." 
                           icon={BuildingOfficeIcon} 
                        />
                        <LimitWidget 
                           title="Хранилище" 
                           limit={subscription.limits.storage} 
                           unit="ГБ" 
                           icon={CircleStackIcon} 
                           isStorage={true}
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Features List */}
                {subscription.plan?.features && (
                   <div className="bg-slate-50 rounded-2xl p-6">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 opacity-80">Включенные опции</h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                         {Object.entries(subscription.plan.features as Record<string, string[]>).map(([category, items]) => (
                            <div key={category}>
                               <div className="text-xs font-bold text-orange-600 mb-2 uppercase">{category}</div>
                               <ul className="space-y-2">
                                  {Array.isArray(items) && items.map((item, i) => (
                                     <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                        <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <span>{String(item)}</span>
                                     </li>
                                  ))}
                               </ul>
                            </div>
                         ))}
                      </div>
                   </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                 <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <StarIcon className="w-8 h-8 text-slate-400" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 mb-2">Нет активной подписки</h3>
                 <p className="text-slate-500 max-w-md mx-auto">Выберите подходящий тариф ниже, чтобы получить доступ ко всем возможностям платформы.</p>
              </div>
            )}
          </div>
        </section>

        {/* Plans Grid */}
        <section>
           <h2 className="text-2xl font-bold text-slate-900 mb-6">Доступные тарифы</h2>
           <div className="grid md:grid-cols-3 gap-6">
             {Array.isArray(plans) && plans.map(plan => {
                const isActive = currentPlan && (
                   String(currentPlan.id) === String(plan.id) ||
                   currentPlan.slug === plan.slug
                );

                return (
                   <div 
                      key={plan.id}
                      className={`relative flex flex-col p-6 rounded-3xl border-2 transition-all duration-300 group ${
                         isActive 
                            ? 'bg-white border-orange-500 shadow-xl shadow-orange-100 ring-4 ring-orange-50' 
                            : 'bg-white border-slate-200 hover:border-orange-300 hover:shadow-lg'
                      }`}
                   >
                      {isActive && (
                         <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg uppercase tracking-wider">
                            Текущий план
                         </div>
                      )}

                      <div className="mb-6">
                         <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                         <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-slate-900">
                               {Number(plan.price).toLocaleString('ru-RU')} ₽
                            </span>
                            <span className="text-slate-500 font-medium">/ месяц</span>
                         </div>
                         <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                            {plan.description}
                         </p>
                      </div>

                      <div className="flex-1 mb-8">
                         <div className="space-y-3">
                            {/* Simplified limits display for card */}
                            <div className="flex items-center gap-3 text-sm text-slate-700">
                               <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 text-slate-500">
                                  <UserGroupIcon className="w-4 h-4" />
                               </div>
                               <span className="font-bold">{plan.max_foremen || '∞'}</span> прорабов
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-700">
                               <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 text-slate-500">
                                  <BuildingOfficeIcon className="w-4 h-4" />
                               </div>
                               <span className="font-bold">{plan.max_projects || '∞'}</span> проектов
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-700">
                               <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 text-slate-500">
                                  <CircleStackIcon className="w-4 h-4" />
                               </div>
                               <span className="font-bold">{plan.max_storage_gb || '∞'} ГБ</span> хранилище
                            </div>
                         </div>
                      </div>

                      <button
                         onClick={() => handlePlanChange(plan)}
                         disabled={isActive || planAction === plan.slug || changePlanLoading === plan.slug}
                         className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                            isActive
                               ? 'bg-slate-100 text-slate-400 cursor-default'
                               : 'bg-slate-900 text-white hover:bg-orange-600 shadow-lg hover:shadow-orange-200'
                         }`}
                      >
                         {isActive ? (
                            <>
                               <CheckCircleIcon className="w-5 h-5" />
                               Подключено
                            </>
                         ) : (
                            <>
                               {planAction === plan.slug || changePlanLoading === plan.slug ? 'Обработка...' : 'Выбрать тариф'}
                               {!isActive && <ArrowRightIcon className="w-4 h-4" />}
                            </>
                         )}
                      </button>
                   </div>
                );
             })}
           </div>
        </section>
      </div>

      {/* Cancel Modal */}
      <ConfirmActionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelSubscription}
        title="Отменить подписку?"
        message="После отмены услуги будут действовать до конца оплаченного периода."
        confirmLabel="Отменить подписку"
        confirmColorClass="red"
        isLoading={cancelLoading}
      />

      {/* Change Plan Modal */}
      {changePlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <h3 className="text-xl font-bold text-slate-900">Смена тарифа</h3>
               <button onClick={() => setChangePlanModal(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
               </button>
            </div>
            
            <div className="overflow-y-auto p-6">
               {changePlanModal.previewData ? (
                 <div className="space-y-6">
                   {/* Status Message */}
                   <div className={`p-4 rounded-xl border ${
                      changePlanModal.previewData.can_proceed 
                         ? 'bg-blue-50 border-blue-100 text-blue-900' 
                         : 'bg-red-50 border-red-100 text-red-900'
                   }`}>
                     <div className="font-bold mb-1">
                        {changePlanModal.previewData.can_proceed ? 'Подтверждение перехода' : 'Невозможно выполнить переход'}
                     </div>
                     <div className="text-sm opacity-90">
                        {changePlanModal.previewData.can_proceed 
                           ? `Вы переходите на тариф "${changePlanModal.previewData.new_subscription.plan_name}". Разница в стоимости будет учтена.`
                           : changePlanModal.previewData.message
                        }
                     </div>
                   </div>

                   {/* Comparison */}
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                         <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Сейчас</div>
                         <div className="font-bold text-slate-900">{changePlanModal.previewData.current_subscription.plan_name}</div>
                         <div className="text-sm text-slate-500">{Number(changePlanModal.previewData.current_subscription.price).toFixed(0)} ₽/мес</div>
                      </div>
                      <div className="p-4 rounded-xl border border-orange-200 bg-orange-50 relative">
                         <div className="absolute -top-3 -right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Новый</div>
                         <div className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2">Будет</div>
                         <div className="font-bold text-slate-900">{changePlanModal.previewData.new_subscription.plan_name}</div>
                         <div className="text-sm text-slate-500">{Number(changePlanModal.previewData.new_subscription.price).toFixed(0)} ₽/мес</div>
                      </div>
                   </div>

                   {/* Billing Calculation */}
                   <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                      <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Расчет стоимости</h4>
                      <div className="space-y-3 text-sm">
                         <div className="flex justify-between">
                            <span className="text-slate-500">Остаток текущего периода</span>
                            <span className="font-medium">{Number(changePlanModal.previewData.billing_calculation.remaining_value || 0).toFixed(2)} ₽</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-slate-500">Стоимость нового тарифа</span>
                            <span className="font-medium">{Number(changePlanModal.previewData.billing_calculation.new_plan_cost || 0).toFixed(2)} ₽</span>
                         </div>
                         <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                            <span className="font-bold text-slate-900">Итого к списанию</span>
                            <span className={`text-lg font-bold ${
                               Number(changePlanModal.previewData.billing_calculation.difference) >= 0 ? 'text-slate-900' : 'text-emerald-600'
                            }`}>
                               {Math.abs(Number(changePlanModal.previewData.billing_calculation.difference || 0)).toFixed(2)} ₽
                            </span>
                         </div>
                      </div>
                   </div>

                   {/* Balance Info */}
                   <div className="flex items-center justify-between text-sm px-2">
                      <span className="text-slate-500">Ваш баланс: <span className="font-bold text-slate-900">{Number(changePlanModal.previewData.balance_check.current_balance || 0).toFixed(2)} ₽</span></span>
                      <span className="text-slate-500">После списания: <span className={`font-bold ${
                         Number(changePlanModal.previewData.balance_check.balance_after_change) >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>{Number(changePlanModal.previewData.balance_check.balance_after_change || 0).toFixed(2)} ₽</span></span>
                   </div>
                 </div>
               ) : (
                 <div className="text-center py-8">
                   <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                   <p className="text-slate-500">Подготавливаем расчет...</p>
                 </div>
               )}
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
               <button
                  onClick={() => setChangePlanModal(null)}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all"
               >
                  Отмена
               </button>
               {changePlanModal.previewData?.can_proceed && (
                  <button
                     onClick={confirmPlanChange}
                     disabled={changePlanLoading !== null}
                     className="flex-1 py-3 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-200 transition-all disabled:opacity-50"
                  >
                     {changePlanLoading ? 'Обработка...' : 'Подтвердить и оплатить'}
                  </button>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaidServicesPage;