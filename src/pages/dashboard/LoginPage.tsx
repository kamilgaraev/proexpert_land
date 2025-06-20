import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  ArrowRightIcon,
  ShieldCheckIcon,
  UserIcon,
  LockClosedIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@hooks/useAuth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNetworkError, setShowNetworkError] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }
    
    setError('');
    setIsLoading(true);
    setShowNetworkError(false);
    
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Ошибка входа:', err);
      
      if (err.message.includes('Не удалось подключиться к серверу')) {
        setShowNetworkError(true);
        setError('Не удалось подключиться к серверу. Проверьте подключение к интернету или попробуйте позже.');
      } else if (err.message.includes('Неверные учетные данные')) {
        setError('Неверный email или пароль');
      } else {
        setError(err.message || 'Ошибка при входе. Проверьте учетные данные.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-concrete-50 via-steel-50 to-construction-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex bg-white rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Левая панель - Форма входа */}
        <motion.div 
          className="w-full lg:w-1/2 p-8 lg:p-12"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Логотип и заголовок */}
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-construction-500 to-construction-600 rounded-xl flex items-center justify-center shadow-construction mr-3">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-2xl font-bold text-steel-900">ProHelper</span>
            </Link>
            
            <h1 className="text-3xl lg:text-4xl font-bold text-steel-900 mb-3">
              Добро пожаловать!
            </h1>
            <p className="text-steel-600 text-lg">
              Войдите в свой аккаунт для управления строительными проектами
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
                  <p className="text-red-700 font-medium mb-1">Ошибка входа</p>
                  <p className="text-red-600 text-sm">{error}</p>
                  {showNetworkError && (
                    <div className="mt-3 text-red-600 text-sm">
                      <p className="font-medium mb-1">Возможные причины:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Сервер временно недоступен</li>
                        <li>Проблемы с интернет-соединением</li>
                        <li>Блокировка запросов браузером</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Форма */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-steel-700 mb-2">
                Email адрес
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-steel-400" />
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

            {/* Пароль */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-steel-700 mb-2">
                Пароль
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-steel-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="block w-full pl-12 pr-12 py-3 border border-steel-300 rounded-xl text-steel-900 placeholder-steel-400 focus:outline-none focus:ring-2 focus:ring-construction-500 focus:border-construction-500 transition-all duration-200"
                  placeholder="Введите ваш пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-steel-400 hover:text-steel-600 transition-colors" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-steel-400 hover:text-steel-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Запомнить меня и Забыли пароль */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-construction-600 bg-white border-steel-300 rounded focus:ring-construction-500 focus:ring-2"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="ml-2 text-sm text-steel-700">Запомнить меня</span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-sm font-medium text-construction-600 hover:text-construction-700 transition-colors"
              >
                Забыли пароль?
              </Link>
            </div>

            {/* Кнопка входа */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-construction-500 to-construction-600 text-white py-3 px-6 rounded-xl font-semibold text-lg shadow-construction hover:shadow-construction-lg disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Вход в систему...
                </>
              ) : (
                <>
                  Войти в систему
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Ссылка на регистрацию */}
          <div className="mt-8 pt-6 border-t border-steel-200">
            <p className="text-center text-steel-600">
              Нет аккаунта?{' '}
              <Link 
                to="/register" 
                className="font-semibold text-construction-600 hover:text-construction-700 transition-colors"
              >
                Зарегистрироваться бесплатно
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Правая панель - Информационная секция */}
        <motion.div 
          className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-construction-500 via-construction-600 to-construction-700 p-12 flex-col justify-center relative overflow-hidden"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Декоративные элементы */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative z-10">
            <div className="mb-8">
              <ShieldCheckIcon className="w-16 h-16 text-white mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">
                Управляйте строительством профессионально
              </h2>
              <p className="text-construction-100 text-lg leading-relaxed">
                ProHelper — это современная платформа для управления строительными проектами, 
                командой и финансами в одном месте.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Контроль проектов</h3>
                  <p className="text-construction-100 text-sm">Отслеживайте прогресс и управляйте задачами</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Управление командой</h3>
                  <p className="text-construction-100 text-sm">Координируйте работу прорабов и рабочих</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Финансовая отчетность</h3>
                  <p className="text-construction-100 text-sm">Контролируйте бюджеты и расходы</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <p className="text-white text-sm">
                <span className="font-semibold">Безопасность:</span> Ваши данные защищены современными методами шифрования
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage; 