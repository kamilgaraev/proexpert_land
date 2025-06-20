import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Пожалуйста, введите ваш email');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Пожалуйста, введите корректный email');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      // Здесь будет вызов API для восстановления пароля
      await new Promise(resolve => setTimeout(resolve, 2000)); // Имитация запроса
      setIsSuccess(true);
    } catch (err: any) {
      setError('Произошла ошибка при отправке запроса. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-concrete-50 via-steel-50 to-construction-50 flex items-center justify-center p-4">
        <motion.div 
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 bg-gradient-to-r from-earth-500 to-earth-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-steel-900 mb-4">
            Письмо отправлено!
          </h1>
          
          <p className="text-steel-600 mb-6 leading-relaxed">
            Мы отправили инструкции по восстановлению пароля на адрес{' '}
            <span className="font-semibold text-steel-900">{email}</span>
          </p>
          
          <div className="bg-construction-50 rounded-xl p-4 mb-6">
            <p className="text-construction-800 text-sm">
              Не получили письмо? Проверьте папку "Спам" или попробуйте снова через несколько минут.
            </p>
          </div>
          
          <Link 
            to="/login"
            className="w-full bg-gradient-to-r from-construction-500 to-construction-600 text-white py-3 px-6 rounded-xl font-semibold shadow-construction hover:shadow-construction-lg transition-all duration-200 inline-flex items-center justify-center"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Вернуться к входу
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-concrete-50 via-steel-50 to-construction-50 flex items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Заголовок */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-construction-500 to-construction-600 rounded-xl flex items-center justify-center shadow-construction mr-3">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-2xl font-bold text-steel-900">ProHelper</span>
          </Link>
          
          <h1 className="text-3xl font-bold text-steel-900 mb-3">
            Восстановление пароля
          </h1>
          <p className="text-steel-600">
            Введите ваш email и мы отправим инструкции по восстановлению пароля
          </p>
        </div>

        {/* Сообщение об ошибке */}
        {error && (
          <motion.div 
            className="mb-6 bg-red-50 border-l-4 border-red-400 rounded-xl p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-red-700 font-medium mb-1">Ошибка</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Форма */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-steel-700 mb-2">
              Email адрес
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-steel-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full pl-12 pr-4 py-3 border border-steel-300 rounded-xl text-steel-900 placeholder-steel-400 focus:outline-none focus:ring-2 focus:ring-construction-500 focus:border-construction-500 transition-all duration-200"
                placeholder="Введите ваш email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-construction-500 to-construction-600 text-white py-3 px-6 rounded-xl font-semibold shadow-construction hover:shadow-construction-lg disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Отправка...
              </>
            ) : (
              'Отправить инструкции'
            )}
          </motion.button>
        </form>

        {/* Ссылка назад */}
        <div className="mt-8 pt-6 border-t border-steel-200 text-center">
          <Link 
            to="/login" 
            className="inline-flex items-center text-steel-600 hover:text-construction-600 transition-colors font-medium"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Вернуться к входу
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage; 