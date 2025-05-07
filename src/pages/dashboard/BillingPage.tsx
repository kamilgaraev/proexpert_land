import { useState, useEffect, useCallback } from 'react';
import { billingService, OrganizationBalance, BalanceTransaction, PaginatedBalanceTransactions, TopUpBalanceRequest, ErrorResponse, PaymentGatewayChargeResponse } from '@utils/api';
import { PageLoading } from '@components/common/PageLoading';
import { ArrowPathIcon, CreditCardIcon, CurrencyDollarIcon, ReceiptRefundIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

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
  
  const [topUpAmount, setTopUpAmount] = useState<string>('');
  const [paymentMethodToken, setPaymentMethodToken] = useState<string>('tok_mock_visa_chargeable_russian_STANDARD'); // Пример токена
  const [isToppingUp, setIsToppingUp] = useState<boolean>(false);

  const fetchBalance = useCallback(async () => {
    setLoadingBalance(true);
    setErrorBalance(null);
    try {
      const response = await billingService.getBalance();
      if (response.status === 200) {
        setBalance(response.data as OrganizationBalance);
        console.log('Balance data from API:', response.data);
      } else {
        const errorData = response.data as unknown as ErrorResponse;
        throw new Error(errorData?.message || `Ошибка ${response.status}: ${response.statusText}`);
      }
    } catch (err: any) {
      console.error("Error fetching balance:", err);
      setErrorBalance(err.message || 'Не удалось загрузить баланс.');
    } finally {
      setLoadingBalance(false);
    }
  }, []);

  const fetchTransactions = useCallback(async (page: number) => {
    setLoadingTransactions(true);
    setErrorTransactions(null);
    try {
      const response = await billingService.getBalanceTransactions(page, 10); // 10 транзакций на страницу
      if (response.status === 200) {
        const paginatedData = response.data as PaginatedBalanceTransactions;
        setTransactions(paginatedData.data);
        setPagination(paginatedData.meta);
      } else {
        const errorData = response.data as unknown as ErrorResponse;
        throw new Error(errorData?.message || `Ошибка ${response.status}: ${response.statusText}`);
      }
    } catch (err: any) {
      console.error("Error fetching transactions:", err);
      setErrorTransactions(err.message || 'Не удалось загрузить историю транзакций.');
    } finally {
      setLoadingTransactions(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
    fetchTransactions(currentPage);
  }, [fetchBalance, fetchTransactions, currentPage]);

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
        currency: 'RUB', // Хардкод, как в OpenAPI
        payment_method_token: paymentMethodToken,
      };
      const response = await billingService.topUpBalance(payload);
      const responseData = response.data as PaymentGatewayChargeResponse;

      if (response.status === 200 && responseData.success) {
        if (responseData.redirectUrl) {
          console.log('Top-up response data:', responseData);
          console.log('Redirecting to:', responseData.redirectUrl);
          window.location.href = responseData.redirectUrl;
        } else {
          // Если редиректа нет, предполагаем, что оплата прошла или требует подтверждения
          // Обновляем баланс и транзакции
          alert(responseData.message || 'Запрос на пополнение успешно отправлен! Баланс скоро обновится.');
          setTopUpAmount(''); 
          fetchBalance(); 
          fetchTransactions(1); // Возвращаемся на первую страницу транзакций
          setCurrentPage(1);
        }
      } else {
        const errorData = response.data as unknown as ErrorResponse; // Может быть и PaymentGatewayChargeResponse с success: false
        throw new Error(errorData?.message || responseData.message || `Ошибка ${response.status}: ${response.statusText}`);
      }
    } catch (err: any) {
      console.error("Error topping up balance:", err);
      setErrorTopUp(err.message || 'Не удалось выполнить пополнение баланса.');
    } finally {
      setIsToppingUp(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Н/Д';
    return new Date(dateString).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loadingBalance) {
    return <PageLoading message="Загрузка информации о балансе..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      {/* Секция баланса и пополнения */}
      <section className="grid md:grid-cols-2 gap-8 items-start">
        <div className="bg-white shadow-xl rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Текущий баланс</h2>
          {errorBalance && <p className="text-red-500 text-sm mb-3">{errorBalance}</p>}
          {balance ? (
            <div className="text-4xl font-bold text-primary-600 mb-1">
              {balance.balance_formatted} <span className="text-2xl text-gray-500">{balance.currency}</span>
            </div>
          ) : (
            !errorBalance && <p className="text-gray-500">Не удалось загрузить данные о балансе.</p>
          )}
          <p className="text-xs text-gray-400">Обновлено: {balance ? formatDate(balance.updated_at) : 'Н/Д'}</p>
        </div>

        <div className="bg-white shadow-xl rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Пополнить баланс</h2>
          {errorTopUp && 
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0 text-red-500" />
                <span>{errorTopUp}</span>
            </div>
          }
          <form onSubmit={handleTopUp} className="space-y-4">
            <div>
              <label htmlFor="topUpAmount" className="block text-sm font-medium text-gray-700">Сумма (RUB)</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input 
                  type="number" 
                  name="topUpAmount" 
                  id="topUpAmount" 
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2"
                  placeholder="1000.00"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  required
                  min="1"
                />
              </div>
            </div>
            <div>
              <label htmlFor="paymentMethodToken" className="block text-sm font-medium text-gray-700">Токен метода оплаты (тест)</label>
               <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCardIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input 
                  type="text" 
                  name="paymentMethodToken" 
                  id="paymentMethodToken" 
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2"
                  value={paymentMethodToken}
                  onChange={(e) => setPaymentMethodToken(e.target.value)}
                  placeholder="tok_mock_visa_..."
                  required
                />
              </div>
            </div>
            <button 
              type="submit"
              disabled={isToppingUp}
              className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isToppingUp ? <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" /> : <CurrencyDollarIcon className="h-5 w-5 mr-2" />}
              {isToppingUp ? 'Обработка...' : 'Пополнить'}
            </button>
          </form>
        </div>
      </section>

      {/* Секция истории транзакций */}
      <section className="bg-white shadow-xl rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">История транзакций</h2>
        {errorTransactions && <p className="text-red-500 text-sm mb-3">{errorTransactions}</p>}
        {loadingTransactions && !transactions.length && <PageLoading message="Загрузка транзакций..." />}
        {!loadingTransactions && !transactions.length && !errorTransactions && (
          <p className="text-gray-500 text-center py-10">История транзакций пуста.</p>
        )}
        {transactions.length > 0 && (
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              {transactions.map((transaction, transactionIdx) => (
                <li key={transaction.id}>
                  <div className="relative pb-8">
                    {transactionIdx !== transactions.length - 1 ? (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                    ) : null}
                    <div className="relative flex space-x-3 items-center">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${transaction.type === 'credit' ? 'bg-green-500' : 'bg-red-500'}`}>
                          {transaction.type === 'credit' ? 
                            <CurrencyDollarIcon className="h-5 w-5 text-white" aria-hidden="true" /> : 
                            <ReceiptRefundIcon className="h-5 w-5 text-white" aria-hidden="true" />
                          }
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-700">
                            {transaction.description || (transaction.type === 'credit' ? 'Пополнение' : 'Списание')}
                            <span className="font-medium text-gray-900 ml-1">{transaction.amount_formatted} {balance?.currency}</span>
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time dateTime={transaction.created_at}>{formatDate(transaction.created_at)}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* Пагинация */} 
        {pagination && pagination.last_page > 1 && (
          <nav className="mt-8 border-t border-gray-200 px-4 flex items-center justify-between sm:px-0">
            <div className="-mt-px w-0 flex-1 flex">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="border-t-2 border-transparent pt-4 pr-1 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 disabled:opacity-50"
              >
                <ArrowPathIcon className="mr-3 h-5 w-5 text-gray-400 transform rotate-180" aria-hidden="true" /> {/* Иконка для 'Назад' */} 
                Предыдущая
              </button>
            </div>
            <div className="hidden md:-mt-px md:flex">
              {[...Array(pagination.last_page).keys()].map(num => num + 1).map(pageNumber => (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium ${currentPage === pageNumber ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  aria-current={currentPage === pageNumber ? 'page' : undefined}
                >
                  {pageNumber}
                </button>
              ))}
            </div>
            <div className="-mt-px w-0 flex-1 flex justify-end">
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.last_page}
                className="border-t-2 border-transparent pt-4 pl-1 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 disabled:opacity-50"
              >
                Следующая
                <ArrowPathIcon className="ml-3 h-5 w-5 text-gray-400" aria-hidden="true" /> {/* Иконка для 'Вперед' */} 
              </button>
            </div>
          </nav>
        )}
      </section>
    </div>
  );
};

export default BillingPage; 