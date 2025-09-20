import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { billingService, newModulesService, OrganizationBalance, BalanceTransaction, PaginatedBalanceTransactions, TopUpBalanceRequest, ErrorResponse, PaymentGatewayChargeResponse, ModuleBillingResponse } from '@utils/api';
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
  PlusIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const BillingPage = () => {
  const [balance, setBalance] = useState<OrganizationBalance | null>(null);
  const [transactions, setTransactions] = useState<BalanceTransaction[]>([]);
  const [pagination, setPagination] = useState<PaginatedBalanceTransactions['meta'] | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loadingBalance, setLoadingBalance] = useState<boolean>(true);
  const [loadingTransactions, setLoadingTransactions] = useState<boolean>(true);
  const [errorBalance, setErrorBalance] = useState<string | null>(null);
  const [errorTransactions, setErrorTransactions] = useState<string | null>(null);
  const [errorTopUp, setErrorTopUp] = useState<string | null>(null);
  
  const [billingStats, setBillingStats] = useState<ModuleBillingResponse | null>(null);
  const [errorStats, setErrorStats] = useState<string | null>(null);
  
  const [topUpAmount, setTopUpAmount] = useState<string>('');
  const [paymentMethodToken, setPaymentMethodToken] = useState<string>('tok_mock_visa_chargeable_russian_STANDARD');
  const [isToppingUp, setIsToppingUp] = useState<boolean>(false);

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
        setBillingStats(response.data as ModuleBillingResponse);
      } else {
        const errorData = response.data as unknown as ErrorResponse;
        throw new Error(errorData?.message || `Ошибка ${response.status}`);
      }
    } catch (err: any) {
      setErrorStats(err.message || 'Не удалось загрузить статистику модулей.');
    }
  }, []);

  useEffect(() => {
    fetchBalance();
    fetchTransactions(currentPage);
    fetchBillingStats();
  }, [fetchBalance, fetchTransactions, fetchBillingStats, currentPage]);

  const handleTopUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsToppingUp(true);
    setErrorTopUp(null);
    try {
      const amountNumber = parseFloat(topUpAmount);
      if (isNaN(amountNumber) || amountNumber <= 0) {
        throw new Error('Сумма пополнения должна быть положительным числом.');
      }
      const payload: TopUpBalanceRequest = {
        amount: amountNumber,
        currency: 'RUB',
        payment_method_token: paymentMethodToken,
      };
      const response = await billingService.topUpBalance(payload);
      const responseData = response.data as PaymentGatewayChargeResponse;

      if (response.status === 200 && responseData.success) {
        toast.success(responseData.message || 'Баланс успешно пополнен!');
        setTopUpAmount(''); 
        fetchBalance(); 
        fetchTransactions(1);
        setCurrentPage(1);
      } else {
        const errorData = response.data as unknown as ErrorResponse;
        throw new Error(errorData?.message || responseData.message || `Ошибка ${response.status}`);
      }
    } catch (err: any) {
      setErrorTopUp(err.message || 'Не удалось выполнить пополнение баланса.');
      toast.error(err.message || 'Ошибка пополнения баланса');
    } finally {
      setIsToppingUp(false);
    }
  };

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
    switch (type.toLowerCase()) {
      case 'deposit':
      case 'top_up':
        return <ArrowUpIcon className="w-5 h-5 text-earth-600" />;
      case 'withdrawal':
      case 'charge':
        return <ArrowDownIcon className="w-5 h-5 text-construction-600" />;
      default:
        return <CurrencyDollarIcon className="w-5 h-5 text-steel-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'deposit':
      case 'top_up':
        return 'text-earth-600 bg-earth-50';
      case 'withdrawal':
      case 'charge':
        return 'text-construction-600 bg-construction-50';
      default:
        return 'text-steel-600 bg-steel-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return <CheckCircleIcon className="w-4 h-4 text-earth-600" />;
      case 'failed':
      case 'error':
        return <XCircleIcon className="w-4 h-4 text-construction-600" />;
      case 'pending':
        return <ClockIcon className="w-4 h-4 text-safety-600" />;
      default:
        return <ClockIcon className="w-4 h-4 text-steel-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'bg-earth-100 text-earth-800';
      case 'failed':
      case 'error':
        return 'bg-construction-100 text-construction-800';
      case 'pending':
        return 'bg-safety-100 text-safety-800';
      default:
        return 'bg-steel-100 text-steel-800';
    }
  };

  const quickAmounts = [1000, 5000, 10000, 25000];

  if (loadingBalance) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-construction-200 border-t-construction-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-steel-900 mb-2">Финансы</h1>
        <p className="text-steel-600 text-lg">Управление бюджетом и платежами</p>
      </motion.div>

      {/* Карточки статистики */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {/* Текущий баланс */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-steel-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-steel-600 text-sm font-medium">Текущий баланс</p>
              {errorBalance ? (
                <p className="text-construction-600 text-lg font-bold">Ошибка загрузки</p>
              ) : balance ? (
                <p className="text-3xl font-bold text-steel-900">
                  {balance.balance_formatted} <span className="text-lg text-steel-600">{balance.currency}</span>
                </p>
              ) : (
                <p className="text-steel-500">Загрузка...</p>
              )}
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-construction-500 to-construction-600 rounded-xl flex items-center justify-center">
              <WalletIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center text-sm text-steel-500">
            <CalendarIcon className="w-4 h-4 mr-1" />
            <span>Обновлено: {balance ? formatDate(balance.updated_at) : 'Н/Д'}</span>
          </div>
        </div>

        {/* Всего потрачено */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-steel-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-steel-600 text-sm font-medium">Всего потрачено</p>
              {errorStats ? (
                <p className="text-construction-600 text-lg font-bold">Ошибка загрузки</p>
              ) : billingStats ? (
                <p className="text-3xl font-bold text-steel-900">
                  ₽{billingStats.stats.stats.total_spent_all_time.toLocaleString()}
                </p>
              ) : (
                <p className="text-steel-500">Загрузка...</p>
              )}
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-safety-500 to-safety-600 rounded-xl flex items-center justify-center">
              <ChartBarIcon className="w-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex items-center text-sm text-steel-500">
            <ArrowDownIcon className="w-4 h-4 mr-1" />
            <span>За все время</span>
          </div>
        </div>

        {/* Ежемесячные платежи */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-steel-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-steel-600 text-sm font-medium">Ежемесячные платежи</p>
              {errorStats ? (
                <p className="text-construction-600 text-lg font-bold">Ошибка загрузки</p>
              ) : billingStats ? (
                <p className="text-3xl font-bold text-steel-900">
                  ₽{billingStats.stats.stats.monthly_recurring.toLocaleString()}
                </p>
              ) : (
                <p className="text-steel-500">Загрузка...</p>
              )}
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-earth-500 to-earth-600 rounded-xl flex items-center justify-center">
              <BanknotesIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center text-sm text-steel-500">
            <ChartBarIcon className="w-4 h-4 mr-1" />
            <span>Регулярные подписки</span>
          </div>
        </div>
      </motion.div>

      {/* Дополнительная статистика модулей */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Активные модули */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-steel-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-steel-600 text-sm font-medium">Активные модули</p>
              {errorStats ? (
                <p className="text-construction-600 text-lg font-bold">Ошибка</p>
              ) : billingStats ? (
                <p className="text-3xl font-bold text-steel-900">
                  {billingStats.stats.stats.active_modules}
                </p>
              ) : (
                <p className="text-steel-500">Загрузка...</p>
              )}
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-construction-500 to-construction-600 rounded-xl flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center text-sm text-steel-500">
            <span>из {billingStats?.stats.stats.total_modules_ever || 0} всего</span>
          </div>
        </div>

        {/* Подписки */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-steel-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-steel-600 text-sm font-medium">Подписки</p>
              {errorStats ? (
                <p className="text-construction-600 text-lg font-bold">Ошибка</p>
              ) : billingStats ? (
                <p className="text-3xl font-bold text-steel-900">
                  {billingStats.stats.breakdown_by_type.subscription}
                </p>
              ) : (
                <p className="text-steel-500">Загрузка...</p>
              )}
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-safety-500 to-safety-600 rounded-xl flex items-center justify-center">
              <CreditCardIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center text-sm text-steel-500">
            <span>Регулярные платежи</span>
          </div>
        </div>

        {/* Разовые покупки */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-steel-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-steel-600 text-sm font-medium">Разовые покупки</p>
              {errorStats ? (
                <p className="text-construction-600 text-lg font-bold">Ошибка</p>
              ) : billingStats ? (
                <p className="text-3xl font-bold text-steel-900">
                  {billingStats.stats.breakdown_by_type.one_time}
                </p>
              ) : (
                <p className="text-steel-500">Загрузка...</p>
              )}
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-earth-500 to-earth-600 rounded-xl flex items-center justify-center">
              <CurrencyDollarIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center text-sm text-steel-500">
            <span>₽{billingStats?.stats.stats.one_time_this_month.toLocaleString() || 0} в этом месяце</span>
          </div>
        </div>

        {/* Бесплатные модули */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-steel-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-steel-600 text-sm font-medium">Бесплатные модули</p>
              {errorStats ? (
                <p className="text-construction-600 text-lg font-bold">Ошибка</p>
              ) : billingStats ? (
                <p className="text-3xl font-bold text-steel-900">
                  {billingStats.stats.breakdown_by_type.free}
                </p>
              ) : (
                <p className="text-steel-500">Загрузка...</p>
              )}
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-steel-500 to-steel-600 rounded-xl flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center text-sm text-steel-500">
            <span>Без оплаты</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Пополнение баланса */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-steel-100">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-construction-500 to-construction-600 rounded-xl flex items-center justify-center mr-3">
                <PlusIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-steel-900">Пополнить баланс</h3>
                <p className="text-steel-600 text-sm">Добавьте средства на счет</p>
              </div>
            </div>

            {errorTopUp && (
              <motion.div 
                className="mb-4 p-3 bg-construction-50 border border-construction-200 text-construction-700 rounded-xl text-sm flex items-start"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0 text-construction-500" />
                <span>{errorTopUp}</span>
              </motion.div>
            )}

            <form onSubmit={handleTopUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-steel-700 mb-2">
                  Сумма пополнения
                </label>
                <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CurrencyDollarIcon className="h-5 w-5 text-steel-400" />
                </div>
                <input 
                  type="number" 
                    className="w-full pl-10 pr-4 py-3 border border-steel-300 rounded-xl focus:ring-2 focus:ring-construction-500 focus:border-construction-500 transition-colors"
                    placeholder="Введите сумму"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  required
                  min="1"
                />
              </div>
            </div>

              {/* Быстрые суммы */}
            <div>
                <p className="text-sm font-medium text-steel-700 mb-2">Быстрый выбор</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setTopUpAmount(amount.toString())}
                      className="px-3 py-2 text-sm font-medium text-steel-700 bg-steel-50 rounded-lg hover:bg-construction-50 hover:text-construction-700 transition-colors"
                    >
                      ₽{amount.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-steel-700 mb-2">
                  Токен метода оплаты
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCardIcon className="h-5 w-5 text-steel-400" />
                </div>
                <input 
                  type="text" 
                    className="w-full pl-10 pr-4 py-3 border border-steel-300 rounded-xl focus:ring-2 focus:ring-construction-500 focus:border-construction-500 transition-colors"
                  value={paymentMethodToken}
                  onChange={(e) => setPaymentMethodToken(e.target.value)}
                  placeholder="tok_mock_visa_..."
                  required
                />
              </div>
            </div>

              <motion.button 
              type="submit"
              disabled={isToppingUp}
                className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-construction-500 to-construction-600 text-white rounded-xl hover:shadow-construction focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-construction-500 disabled:opacity-50 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isToppingUp ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                ) : (
                  <PlusIcon className="h-5 w-5 mr-2" />
                )}
                {isToppingUp ? 'Обработка...' : 'Пополнить баланс'}
              </motion.button>
          </form>
        </div>
        </motion.div>

        {/* История транзакций */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="bg-white rounded-2xl shadow-lg border border-steel-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-steel-50 to-concrete-50 border-b border-steel-100">
              <div className="flex items-center justify-between">
                      <div>
                  <h3 className="text-xl font-bold text-steel-900">История транзакций</h3>
                  <p className="text-steel-600 text-sm">Последние операции по счету</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-steel-500 to-steel-600 rounded-xl flex items-center justify-center">
                  <ReceiptRefundIcon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            <div className="p-6">
              {loadingTransactions ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-construction-200 border-t-construction-600"></div>
                </div>
              ) : errorTransactions ? (
                <div className="text-center py-8">
                  <ExclamationTriangleIcon className="h-12 w-12 text-construction-400 mx-auto mb-3" />
                  <p className="text-construction-600">{errorTransactions}</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <ReceiptRefundIcon className="h-12 w-12 text-steel-300 mx-auto mb-3" />
                  <p className="text-steel-500">Транзакции не найдены</p>
                      </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <motion.div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-steel-50 rounded-xl hover:bg-steel-100 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTransactionColor(transaction.type)}`}>
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-medium text-steel-900">{transaction.description || 'Транзакция'}</p>
                          <p className="text-sm text-steel-600">{formatDate(transaction.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                                                 <p className={`font-bold ${
                           transaction.type.toLowerCase().includes('deposit') || transaction.type.toLowerCase().includes('top_up')
                             ? 'text-earth-600' 
                             : 'text-construction-600'
                         }`}>
                           {transaction.type.toLowerCase().includes('deposit') || transaction.type.toLowerCase().includes('top_up') ? '+' : '-'}
                           {transaction.amount_formatted} {balance?.currency || 'RUB'}
                         </p>
                         <div className="flex items-center justify-end mt-1">
                           {getStatusIcon('completed')}
                           <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor('completed')}`}>
                             Завершено
                           </span>
                    </div>
                  </div>
                    </motion.div>
              ))}
          </div>
        )}

        {/* Пагинация */} 
        {pagination && pagination.last_page > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex space-x-2">
                    {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
              <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          page === currentPage
                            ? 'bg-construction-600 text-white'
                            : 'bg-steel-100 text-steel-700 hover:bg-steel-200'
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
    </div>
  );
};

export default BillingPage; 