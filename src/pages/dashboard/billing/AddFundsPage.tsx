import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCardIcon, ArrowLeftIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

const suggestedAmounts = [500, 1000, 2000, 5000];

const AddFundsPage = () => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError(null); // Сбрасываем ошибку при изменении суммы
    }
  };

  const handleSuggestedAmountClick = (suggested: number) => {
    setAmount(suggested.toString());
    setError(null); // Сбрасываем ошибку
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Пожалуйста, введите корректную сумму (больше 0).');
      return;
    }

    setLoading(true);
    console.log(`Попытка пополнения на сумму: ${numericAmount} ₽`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Баланс успешно пополнен (имитация).');
    setLoading(false);
    alert(`Баланс успешно пополнен на ${numericAmount} ₽ (имитация).`);
    navigate('/dashboard/billing');
  };

  return (
    <div className="py-8">
      <div className="mb-8"> {/* Увеличен отступ снизу для ссылки назад */}
        <Link to="/dashboard/billing" className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors">
          <ArrowLeftIcon className="h-5 w-5 mr-1.5" />
          Назад к Биллингу
        </Link>
      </div>

      <div className="bg-white shadow-xl rounded-xl p-8 sm:p-10 max-w-lg mx-auto">
        <div className="flex items-center mb-8"> {/* Увеличен отступ снизу */}
          <CreditCardIcon className="h-9 w-9 text-primary-600" />
          <div className="ml-4">
            <h1 className="text-2xl font-semibold text-secondary-900">Пополнение баланса</h1>
            <p className="text-sm text-secondary-500 mt-1">Выберите или введите сумму для пополнения.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="amountInput" className="block text-sm font-medium text-secondary-700 mb-1">
              Сумма пополнения
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {suggestedAmounts.map((sa) => (
                <button
                  type="button"
                  key={sa}
                  onClick={() => handleSuggestedAmountClick(sa)}
                  disabled={loading}
                  className="w-full py-2 px-3 border border-secondary-300 rounded-md shadow-sm text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50"
                >
                  {sa} ₽
                </button>
              ))}
            </div>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PlusCircleIcon className="h-5 w-5 text-secondary-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="amount"
                id="amountInput" // Изменен id для соответствия с label
                className={`block w-full pl-10 pr-12 py-2.5 sm:text-sm rounded-md focus:ring-primary-500 focus:border-primary-500 ${error ? 'border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-secondary-300'}`}
                placeholder="Другая сумма"
                value={amount}
                onChange={handleAmountChange}
                aria-describedby="amount-currency"
                disabled={loading}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-secondary-500 sm:text-sm" id="amount-currency">
                  ₽
                </span>
              </div>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          <div className="pt-2">
            <h3 className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-2">Способ оплаты</h3>
            <div className="text-sm p-3 bg-secondary-50 rounded-md border border-secondary-200 text-secondary-600">
              На данный момент пополнение происходит напрямую с вашего счета. Функционал выбора способов оплаты (банковские карты и т.д.) будет добавлен на следующем этапе интеграции с платежной системой.
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
            >
              {loading ? 'Обработка...' : `Пополнить на ${amount ? parseFloat(amount).toLocaleString('ru-RU') : '0'} ₽`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFundsPage; 