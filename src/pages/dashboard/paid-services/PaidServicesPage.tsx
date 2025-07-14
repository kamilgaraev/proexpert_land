import { useState, useEffect, useCallback } from 'react';
import { billingService } from '@utils/api';
import { CheckCircleIcon, XCircleIcon, PuzzlePieceIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Switch } from '@headlessui/react';
import ConfirmActionModal from '@components/shared/ConfirmActionModal';
import { PageLoading } from '@components/common/PageLoading'; // Предполагаем наличие компонента-заглушки

const PaidServicesPage = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const [currentPlan, setCurrentPlan] = useState<any | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [connectedAddons, setConnectedAddons] = useState<any[]>([]);
  const [oneTimePurchases, setOneTimePurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoPayEnabled, setAutoPayEnabled] = useState<boolean | null>(null);
  const [autoPayUpdating, setAutoPayUpdating] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddonsModal, setShowAddonsModal] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({ type: '', description: '', amount: '', currency: 'RUB' });
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [addonAction, setAddonAction] = useState<number | null>(null);
  const [planAction, setPlanAction] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [subRes, plansRes, addonsRes, otpRes] = await Promise.all([
        billingService.getOrgSubscription(),
        billingService.getPlans(),
        billingService.getAddons(),
        billingService.getOneTimePurchases(),
      ]);
      setSubscription(subRes.data);
      if (subRes.data && typeof subRes.data.is_auto_payment_enabled === 'boolean') {
        setAutoPayEnabled(subRes.data.is_auto_payment_enabled);
      }
      const fetchedPlans = Array.isArray(plansRes.data) ? plansRes.data : [];
      setPlans(fetchedPlans);
      // определяем текущий план: API может вернуть subscription_plan_id или объект plan.id
      const cp = subRes.data ? fetchedPlans.find((p: any) => p.id === (subRes.data.subscription_plan_id ?? subRes.data.plan?.id)) : null;
      setCurrentPlan(cp || null);
      setAddons(Array.isArray(addonsRes.data.all) ? addonsRes.data.all : []);
      setConnectedAddons(Array.isArray(addonsRes.data.connected) ? addonsRes.data.connected : []);
      setOneTimePurchases(Array.isArray(otpRes.data) ? otpRes.data : []);
    } catch (e: any) {
      setError(e.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handlePlanChange = async (plan_slug: string) => {
    setError(null);
    setPlanAction(plan_slug);
    try {
      await billingService.subscribeToPlan({ plan_slug });
      await fetchAll();
    } catch (e: any) {
      setError(e.message || 'Ошибка оформления тарифа');
    } finally {
      setPlanAction(null);
    }
  };

  const handleAddonConnect = async (addon_id: number) => {
    setAddonAction(addon_id);
    try {
      await billingService.connectAddon(addon_id);
      await fetchAll();
    } catch (e: any) {
      setError(e.message || 'Ошибка подключения add-on');
    } finally {
      setAddonAction(null);
    }
  };

  const handleAddonDisconnect = async (subscription_addon_id: number) => {
    setAddonAction(subscription_addon_id);
    try {
      await billingService.disconnectAddon(subscription_addon_id);
      await fetchAll();
    } catch (e: any) {
      setError(e.message || 'Ошибка отключения add-on');
    } finally {
      setAddonAction(null);
    }
  };

  const handleOneTimePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setPurchaseLoading(true);
    setPurchaseError(null);
    setPurchaseSuccess(null);
    try {
      const { type, description, amount, currency } = purchaseForm;
      if (!type || !description || !amount || isNaN(Number(amount))) {
        setPurchaseError('Заполните все поля корректно');
        setPurchaseLoading(false);
        return;
      }
      await billingService.oneTimePurchase({ type, description, amount: Number(amount), currency });
      setPurchaseSuccess('Покупка успешно совершена');
      setPurchaseForm({ type: '', description: '', amount: '', currency: 'RUB' });
      await fetchAll();
    } catch (e: any) {
      setPurchaseError(e.message || 'Ошибка покупки');
    } finally {
      setPurchaseLoading(false);
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
    } catch (e: any) {
      setError(e.message || 'Ошибка отмены подписки');
    } finally {
      setCancelLoading(false);
    }
  };

  const formatDate = (date?: string) => date ? new Date(date).toLocaleDateString('ru-RU') : '—';

  if (loading) return <PageLoading message="Загрузка платных услуг..." />;

  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      <h1 className="text-3xl font-bold mb-6">Платные услуги</h1>
      {error && <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">{error}</div>}

      {/* Текущая подписка */}
      <section className="bg-white shadow rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Текущая подписка</h2>
        {subscription && subscription.status === 'active' && currentPlan ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2">
                <span className="text-2xl font-bold text-primary-700">{currentPlan.name}</span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">Активен</span>
              </div>
              <div className="text-gray-600">{currentPlan.description}</div>
              <div className="text-sm text-gray-500">Действует до: {formatDate(subscription.ends_at)}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm">Автоплатёж</span>
                <Switch
                  checked={autoPayEnabled || false}
                  onChange={handleToggleAutoPay}
                  disabled={autoPayEnabled===null || autoPayUpdating}
                  className={`${autoPayEnabled ? 'bg-primary-600' : 'bg-gray-300'} relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500`}
                >
                  <span
                    aria-hidden="true"
                    className={`${autoPayEnabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform`}
                  />
                </Switch>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {plans.filter(p => p.id !== currentPlan.id).map(plan => (
                <button key={plan.slug} onClick={() => handlePlanChange(plan.slug)} disabled={planAction===plan.slug} className="btn btn-outline disabled:opacity-60">
                  {planAction===plan.slug ? 'Обновление…' : `Перейти на ${plan.name}`}
                </button>
              ))}
              <button onClick={() => setShowCancelModal(true)} className="btn btn-outline text-red-600">Отменить подписку</button>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">Нет активной подписки</div>
        )}
      </section>

      {/* Тарифные планы */}
      <section className="bg-white shadow rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Тарифные планы</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.id} className={`rounded-lg p-4 flex flex-col border-2 ${currentPlan && currentPlan.id === plan.id ? 'border-primary-600 bg-primary-50' : 'border-gray-200 bg-white'}`}>
              <div className="font-bold text-lg mb-1">{plan.name}</div>
              <div className="text-primary-700 text-xl font-semibold mb-2">{plan.price.toLocaleString('ru-RU', { style: 'currency', currency: plan.currency })} / {plan.duration_in_days === 30 ? 'мес.' : `${plan.duration_in_days} дн.`}</div>
              <div className="text-gray-600 text-sm mb-2">{plan.description}</div>
              <ul className="text-xs text-gray-500 mb-2 space-y-1">
                {plan.features?.map((f: string, i: number) => <li key={i} className="flex items-center gap-1"><CheckCircleIcon className="h-4 w-4 text-green-500" />{f}</li>)}
                {plan.max_foremen && <li>Прорабы: {plan.max_foremen}</li>}
                {plan.max_projects && <li>Проекты: {plan.max_projects}</li>}
                {plan.max_storage_gb && <li>Хранилище: {plan.max_storage_gb} ГБ</li>}
              </ul>
              {currentPlan && currentPlan.id === plan.id ? (
                <span className="mt-auto inline-block px-3 py-1 text-sm text-white bg-primary-600 rounded">Ваш тариф</span>
              ) : (
                <button onClick={() => handlePlanChange(plan.slug)} disabled={planAction===plan.slug} className="btn btn-primary mt-auto disabled:opacity-60">
                  {planAction===plan.slug ? 'Подписка…' : 'Выбрать'}
                </button>
              )}
            </div>
          ))}
          </div>
      </section>

      {/* Add-ons */}
      <section className="bg-white shadow rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Дополнительные услуги (Add-ons)</h2>
          <button className="btn btn-outline flex items-center gap-1" onClick={() => setShowAddonsModal(true)}><PuzzlePieceIcon className="h-5 w-5" /> Управлять</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {connectedAddons.length === 0 && <span className="text-gray-500">Нет подключённых add-on</span>}
          {connectedAddons.map((addon: any) => (
            <span key={addon.id} className="inline-flex items-center px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
              {addon.name}
            </span>
          ))}
        </div>
        {showAddonsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowAddonsModal(false)}><XCircleIcon className="h-6 w-6" /></button>
              <h3 className="text-lg font-bold mb-4">Управление add-on</h3>
              <ul className="space-y-3">
                {addons.map((addon: any) => {
                  const connected = connectedAddons.some((a: any) => a.id === addon.id);
                  const subAddon = connectedAddons.find((a: any) => a.id === addon.id);
              return (
                    <li key={addon.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <div className="font-medium">{addon.name}</div>
                        <div className="text-xs text-gray-500">{addon.description}</div>
                      </div>
                      {connected ? (
                        <button disabled={addonAction === subAddon.subscription_addon_id} onClick={() => handleAddonDisconnect(subAddon.subscription_addon_id)} className="btn btn-outline text-red-600 flex items-center gap-1">
                          <TrashIcon className="h-4 w-4" /> Отключить
                        </button>
                      ) : (
                        <button disabled={addonAction === addon.id} onClick={() => handleAddonConnect(addon.id)} className="btn btn-primary flex items-center gap-1">
                          <PlusIcon className="h-4 w-4" /> Подключить
                      </button>
                    )}
                    </li>
              );
            })}
              </ul>
            </div>
      </div>
        )}
      </section>

      {/* Разовые покупки */}
      <section className="bg-white shadow rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Разовые покупки</h2>
        <form onSubmit={handleOneTimePurchase} className="flex flex-col md:flex-row gap-4 items-end mb-6">
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-sm">Тип</label>
            <input className="input" value={purchaseForm.type} onChange={e => setPurchaseForm(f => ({ ...f, type: e.target.value }))} required />
          </div>
          <div className="flex flex-col gap-2 w-full md:w-1/2">
            <label className="text-sm">Описание</label>
            <input className="input" value={purchaseForm.description} onChange={e => setPurchaseForm(f => ({ ...f, description: e.target.value }))} required />
          </div>
          <div className="flex flex-col gap-2 w-full md:w-1/6">
            <label className="text-sm">Сумма (RUB)</label>
            <input className="input" type="number" min="1" value={purchaseForm.amount} onChange={e => setPurchaseForm(f => ({ ...f, amount: e.target.value }))} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={purchaseLoading}>Купить</button>
        </form>
        {purchaseError && <div className="text-red-600 mb-2">{purchaseError}</div>}
        {purchaseSuccess && <div className="text-green-600 mb-2">{purchaseSuccess}</div>}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 text-left">ID</th>
                <th className="px-2 py-1 text-left">Тип</th>
                <th className="px-2 py-1 text-left">Описание</th>
                <th className="px-2 py-1 text-left">Сумма</th>
                <th className="px-2 py-1 text-left">Дата</th>
              </tr>
            </thead>
            <tbody>
              {oneTimePurchases.length === 0 && <tr><td colSpan={5} className="text-center text-gray-400 py-2">Нет покупок</td></tr>}
              {oneTimePurchases.map((p: any) => (
                <tr key={p.id} className="border-b">
                  <td className="px-2 py-1">{p.id}</td>
                  <td className="px-2 py-1">{p.type}</td>
                  <td className="px-2 py-1">{p.description}</td>
                  <td className="px-2 py-1">{p.amount} {p.currency}</td>
                  <td className="px-2 py-1">{formatDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
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
    </div>
  );
};

export default PaidServicesPage; 