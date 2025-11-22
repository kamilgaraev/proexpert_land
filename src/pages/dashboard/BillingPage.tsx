import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { billingService, newModulesService, OrganizationBalance, BalanceTransaction, PaginatedBalanceTransactions, ErrorResponse, ModuleBillingResponse, SubscriptionResponse, Subscription } from '@utils/api';
import { 
  CreditCardIcon, 
  CurrencyDollarIcon, 
  ReceiptRefundIcon, 
  ExclamationTriangleIcon,
  WalletIcon,
  BanknotesIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  StarIcon,
  SparklesIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const BillingPage = () => {
  const [balance, setBalance] = useState<OrganizationBalance | null>(null);
  const [transactions, setTransactions] = useState<BalanceTransaction[]>([]);
  const [pagination, setPagination] = useState<PaginatedBalanceTransactions['meta'] | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loadingBalance, setLoadingBalance] = useState<boolean>(true);
  const [loadingTransactions, setLoadingTransactions] = useState<boolean>(true);
  const [errorBalance, setErrorBalance] = useState<string | null>(null);
  const [errorTransactions, setErrorTransactions] = useState<string | null>(null);
  
  const [billingStats, setBillingStats] = useState<ModuleBillingResponse | null>(null);
  const [errorStats, setErrorStats] = useState<string | null>(null);
  
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState<boolean>(true);
  const [errorSubscription, setErrorSubscription] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    setLoadingBalance(true);
    setErrorBalance(null);
    try {
      const response = await billingService.getBalance();
      if (response.status === 200) {
        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          setBalance((response.data as any).data as OrganizationBalance);
        } else {
          setBalance(null);
          setErrorBalance('Не удалось обработать данные о балансе.');
        }
      } else {
        const errorData = response.data as unknown as ErrorResponse;
        throw new Error(errorData?.message || `Ошибка ${response.status}`);
      }
    } catch (err: any) {
      setErrorBalance(err.message || 'Не удалось загрузить баланс.');
    } finally {
      setLoadingBalance(false);
    }
  }, []);

  const fetchTransactions = useCallback(async (page: number) => {
    setLoadingTransactions(true);
    setErrorTransactions(null);
    try {
      const response = await billingService.getBalanceTransactions(page, 10);
      if (response.status === 200) {
        const paginatedData = response.data as PaginatedBalanceTransactions;
        setTransactions(paginatedData.data);
        setPagination(paginatedData.meta);
      } else {
        const errorData = response.data as unknown as ErrorResponse;
        throw new Error(errorData?.message || `Ошибка ${response.status}`);
      }
    } catch (err: any) {
      setErrorTransactions(err.message || 'Не удалось загрузить историю транзакций.');
    } finally {
      setLoadingTransactions(false);
    }
  }, []);

  const fetchBillingStats = useCallback(async () => {
    setErrorStats(null);
    try {
      const response = await newModulesService.getBillingStats();
      if (response.status === 200) {
        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          setBillingStats((response.data as any).data as ModuleBillingResponse);
        } else {
          setBillingStats(response.data as ModuleBillingResponse);
        }
      } else {
        const errorData = response.data as unknown as ErrorResponse;
        throw new Error(errorData?.message || `Ошибка ${response.status}`);
      }
    } catch (err: any) {
      setErrorStats(err.message || 'Не удалось загрузить статистику модулей.');
      console.error('Ошибка загрузки статистики модулей: ', err);
    }
  }, []);

  const fetchSubscription = useCallback(async () => {
    setLoadingSubscription(true);
    setErrorSubscription(null);
    try {
      const response = await billingService.getCurrentSubscription();
      if (response.status === 200) {
        const subscriptionData = response.data as SubscriptionResponse;
        if (subscriptionData.success && subscriptionData.data.has_subscription) {
          setSubscription(subscriptionData.data.subscription);
        } else {
          setSubscription(null);
        }
      } else {
        const errorData = response.data as unknown as ErrorResponse;
        throw new Error(errorData?.message || `Ошибка ${response.status}`);
      }
    } catch (err: any) {
      setErrorSubscription(err.message || 'Не удалось загрузить информацию о подписке.');
    } finally {
      setLoadingSubscription(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
    fetchTransactions(currentPage);
    fetchBillingStats();
    fetchSubscription();
  }, [fetchBalance, fetchTransactions, fetchBillingStats, fetchSubscription, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Н/Д';
    return new Date(dateString).toLocaleString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <ArrowUpIcon className="w-5 h-5 text-emerald-600" />;
      case 'debit':
        return <ArrowDownIcon className="w-5 h-5 text-orange-600" />;
      default:
        return <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'credit':
        return 'text-emerald-600 bg-emerald-50';
      case 'debit':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return <CheckCircleIcon className="w-4 h-4 text-emerald-600" />;
      case 'failed':
      case 'error':
        return <XCircleIcon className="w-4 h-4 text-orange-600" />;
      case 'pending':
        return <ClockIcon className="w-4 h-4 text-amber-600" />;
      default:
        return <ClockIcon className="w-4 h-4 text-slate-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'bg-emerald-100 text-emerald-800';
      case 'failed':
      case 'error':
        return 'bg-orange-100 text-orange-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getSubscriptionStatus = (subscription: Subscription): { status: string; color: string; icon: any } => {
    if (subscription.is_canceled) {
      return { status: 'Отменена', color: 'bg-orange-100 text-orange-800', icon: XCircleIcon };
    }
    if (subscription.is_trial) {
      return { status: 'Пробная', color: 'bg-amber-100 text-amber-800', icon: SparklesIcon };
    }
    if (subscription.status === 'active') {
      return { status: 'Активна', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircleIcon };
    }
    return { status: 'Неактивна', color: 'bg-slate-100 text-slate-800', icon: ClockIcon };
  };

  const getFeatureIcon = (feature: string) => {
    if (feature.includes('прораб') || feature.includes('Прораб')) return UserGroupIcon;
    if (feature.includes('проект') || feature.includes('Проект')) return DocumentTextIcon;
    if (feature.includes('пользователь') || feature.includes('Пользователь')) return UserGroupIcon;
    if (feature.includes('ГБ') || feature.includes('хранилищ')) return ShieldCheckIcon;
    if (feature.includes('админ') || feature.includes('Админ')) return AcademicCapIcon;
    if (feature.includes('API')) return ShieldCheckIcon;
    if (feature.includes('менеджер') || feature.includes('SLA')) return StarIcon;
    return CheckCircleIcon;
  };

  if (loadingBalance) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 min-h-screen bg-slate-50 p-6 rounded-3xl">
      {/* Заголовок */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Финансы</h1>
          <p className="text-slate-500 text-lg">Управление бюджетом и платежами</p>
        </div>
        <div className="flex gap-3">
           <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-all shadow-sm">
              Скачать отчет
           </button>
           <button className="px-4 py-2 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200">
              Пополнить баланс
           </button>
        </div>
      </motion.div>

      {/* Карточки статистики */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {/* Текущая подписка */}
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 col-span-1 md:col-span-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-orange-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="relative z-10 flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-orange-200">
                <StarIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Текущая подписка</h3>
                <p className="text-slate-500 text-sm">Информация о вашем тарифе</p>
              </div>
            </div>
            {subscription && (() => {
              const statusInfo = getSubscriptionStatus(subscription);
              return (
                <div className={`flex items-center px-4 py-1.5 rounded-full text-sm font-bold ${statusInfo.color}`}>
                  <statusInfo.icon className="w-4 h-4 mr-1.5" />
                  {statusInfo.status}
                </div>
              );
            })()}
          </div>

          {loadingSubscription ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-200 border-t-orange-600"></div>
            </div>
          ) : errorSubscription ? (
            <div className="text-center py-8">
              <ExclamationTriangleIcon className="h-12 w-12 text-orange-400 mx-auto mb-3" />
              <p className="text-orange-600">{errorSubscription}</p>
            </div>
          ) : subscription ? (
            <div className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <h4 className="font-bold text-slate-900 text-lg mb-1">{subscription.plan.name}</h4>
                  <p className="text-slate-500 text-sm mb-4">{subscription.plan.description}</p>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-orange-600">
                      {Number(subscription.plan.price).toLocaleString('ru-RU')} ₽
                    </span>
                    <span className="text-slate-500 ml-1 font-medium">/{subscription.plan.currency === 'RUB' ? 'мес' : subscription.plan.currency}</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Автоплатеж</span>
                    <span className={`font-bold px-2 py-0.5 rounded-lg ${subscription.is_auto_payment_enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                      {subscription.is_auto_payment_enabled ? 'Включен' : 'Отключен'}
                    </span>
                  </div>
                  {subscription.ends_at && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 font-medium">Действует до</span>
                      <span className="font-bold text-slate-900">
                        {formatDate(subscription.ends_at)}
                      </span>
                    </div>
                  )}
                  {subscription.next_billing_at && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 font-medium">Следующий платеж</span>
                      <span className="font-bold text-slate-900">
                        {formatDate(subscription.next_billing_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <h5 className="font-bold text-slate-900 mb-4 flex items-center">
                   <SparklesIcon className="w-4 h-4 text-orange-500 mr-2" />
                   Включенные возможности
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(subscription.plan.features).map(([category, features]) => (
                    <div key={category} className="space-y-2">
                      <h6 className="font-bold text-orange-600 text-xs uppercase tracking-wider">{category}</h6>
                      {Array.isArray(features) && features.map((feature: string, index: number) => {
                        const IconComponent = getFeatureIcon(feature);
                        return (
                          <div key={index} className="flex items-center text-sm text-slate-700 font-medium">
                            <IconComponent className="w-4 h-4 mr-2 text-emerald-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <SparklesIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Подписка не оформлена</p>
              <button className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors">
                 Выбрать тариф
              </button>
            </div>
          )}
        </div>

        {/* Текущий баланс */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 shadow-xl text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-orange-500 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
          
          <div className="relative z-10">
             <div className="flex items-center justify-between mb-6">
               <div>
                 <p className="text-slate-400 text-sm font-medium mb-1">Текущий баланс</p>
                 {errorBalance ? (
                   <p className="text-orange-400 font-bold">Ошибка</p>
                 ) : balance ? (
                   <p className="text-4xl font-bold text-white tracking-tight">
                     {balance.balance_formatted} <span className="text-2xl text-slate-400 font-normal">{balance.currency}</span>
                   </p>
                 ) : (
                   <p className="text-slate-500">...</p>
                 )}
               </div>
               <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10">
                 <WalletIcon className="w-6 h-6 text-orange-400" />
               </div>
             </div>
             
             <div className="space-y-2">
                <div className="flex justify-between text-sm">
                   <span className="text-slate-400">Заблокировано</span>
                   <span className="font-medium">0.00 ₽</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full bg-orange-500 w-0"></div>
                </div>
             </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/10 flex items-center text-xs text-slate-400 relative z-10">
            <CalendarIcon className="w-4 h-4 mr-1.5" />
            <span>Обновлено: {balance ? formatDate(balance.updated_at) : 'Н/Д'}</span>
          </div>
        </div>
      </motion.div>

      {/* Дополнительная статистика */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Всего потрачено */}
        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-slate-500 text-sm font-medium">Всего потрачено</p>
              {errorStats ? (
                <p className="text-red-500 text-sm font-bold">Ошибка</p>
              ) : billingStats?.stats?.stats?.total_spent_all_time ? (
                <p className="text-2xl font-bold text-slate-900">
                  ₽{billingStats.stats.stats.total_spent_all_time.toLocaleString()}
                </p>
              ) : (
                <p className="text-slate-400">...</p>
              )}
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <div className="flex items-center text-sm text-slate-500">
            <ArrowDownIcon className="w-4 h-4 mr-1 text-red-500" />
            <span>За все время</span>
          </div>
        </div>

        {/* Ежемесячные платежи */}
        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-slate-500 text-sm font-medium">Ежемесячно</p>
              {errorStats ? (
                <p className="text-red-500 text-sm font-bold">Ошибка</p>
              ) : billingStats?.stats?.stats?.monthly_recurring !== undefined ? (
                <p className="text-2xl font-bold text-slate-900">
                  ₽{billingStats.stats.stats.monthly_recurring.toLocaleString()}
                </p>
              ) : (
                <p className="text-slate-400">...</p>
              )}
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
              <BanknotesIcon className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <div className="flex items-center text-sm text-slate-500">
            <ChartBarIcon className="w-4 h-4 mr-1 text-orange-500" />
            <span>Регулярные подписки</span>
          </div>
        </div>

        {/* Активные модули */}
        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-slate-500 text-sm font-medium">Активные модули</p>
              {errorStats ? (
                <p className="text-red-500 text-sm font-bold">Ошибка</p>
              ) : billingStats?.stats?.stats?.active_modules !== undefined ? (
                <p className="text-2xl font-bold text-slate-900">
                  {billingStats.stats.stats.active_modules}
                </p>
              ) : (
                <p className="text-slate-400">...</p>
              )}
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <div className="flex items-center text-sm text-slate-500">
            <span className="text-emerald-600 font-bold mr-1">{Math.round((billingStats?.stats?.stats?.active_modules || 0) / (billingStats?.stats?.stats?.total_modules_ever || 1) * 100)}%</span>
            <span>от всех доступных</span>
          </div>
        </div>
      </motion.div>

      {/* Детализация расходов */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center justify-between group hover:border-orange-300 transition-colors cursor-pointer">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors">
                 <CreditCardIcon className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Подписки</p>
                 <p className="text-lg font-bold text-slate-900">{billingStats?.stats?.breakdown_by_type?.subscription || 0}</p>
              </div>
           </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center justify-between group hover:border-orange-300 transition-colors cursor-pointer">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-xl text-purple-600 group-hover:bg-purple-100 transition-colors">
                 <CurrencyDollarIcon className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Разовые</p>
                 <p className="text-lg font-bold text-slate-900">{billingStats?.stats?.breakdown_by_type?.one_time || 0}</p>
              </div>
           </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center justify-between group hover:border-orange-300 transition-colors cursor-pointer">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 rounded-xl text-slate-600 group-hover:bg-slate-200 transition-colors">
                 <CheckCircleIcon className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Бесплатные</p>
                 <p className="text-lg font-bold text-slate-900">{billingStats?.stats?.breakdown_by_type?.free || 0}</p>
              </div>
           </div>
        </div>
      </motion.div>

      {/* История транзакций */}
      <motion.div
        className="w-full"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">История транзакций</h3>
              <p className="text-slate-500 text-sm">Последние операции по счету</p>
            </div>
            <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600">
               <ReceiptRefundIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {loadingTransactions ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-200 border-t-orange-600"></div>
              </div>
            ) : errorTransactions ? (
              <div className="text-center py-8">
                <ExclamationTriangleIcon className="h-12 w-12 text-orange-400 mx-auto mb-3" />
                <p className="text-orange-600">{errorTransactions}</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <ReceiptRefundIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Транзакции не найдены</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <motion.div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md hover:border-orange-200 transition-all group"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${getTransactionColor(transaction.type)}`}>
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{transaction.description || 'Транзакция'}</p>
                        <p className="text-xs text-slate-500 font-medium">{formatDate(transaction.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${
                        transaction.type === 'credit'
                          ? 'text-emerald-600' 
                          : 'text-slate-900'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}
                        {transaction.amount_formatted} {balance?.currency || 'RUB'}
                      </p>
                      <div className="flex items-center justify-end mt-1">
                        <span className={`flex items-center text-xs font-bold ${
                           transaction.status === 'completed' ? 'text-emerald-600' : 'text-slate-400'
                        }`}>
                           {transaction.status === 'completed' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
                           {transaction.status === 'completed' ? 'Проведено' : transaction.status}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Пагинация */} 
            {pagination && pagination.last_page > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl">
                  {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        page === currentPage
                          ? 'bg-white text-orange-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BillingPage; 