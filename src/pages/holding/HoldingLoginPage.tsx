import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  ArrowRightIcon,
  BuildingOfficeIcon,
  UserIcon,
  LockClosedIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@hooks/useAuth';
import { multiOrganizationService } from '@utils/api';
import { SEOHead } from '@components/shared/SEOHead';

interface HoldingInfo {
  name: string;
  slug: string;
  description?: string;
}

const HoldingLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNetworkError, setShowNetworkError] = useState(false);
  const [holdingInfo, setHoldingInfo] = useState<HoldingInfo | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    const loadHoldingInfo = async () => {
      try {
        const hostname = window.location.hostname;
        const mainDomain = 'prohelper.pro';
        let slug = '';
        
        if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
          slug = 'proverocka';
          setHoldingInfo({
            name: 'Холдинг ProHelper',
            slug: 'proverocka',
            description: 'Система управления строительными проектами'
          });
        } else if (hostname !== mainDomain && hostname.endsWith(`.${mainDomain}`)) {
          slug = hostname.split('.')[0];
          try {
            const data = await multiOrganizationService.getHoldingPublicInfo(slug);
            setHoldingInfo({
              name: data.holding.name,
              slug: data.holding.slug,
              description: data.holding.description
            });
          } catch (err) {
            console.error('Ошибка получения информации о холдинге:', err);
            setHoldingInfo({
              name: 'Холдинг',
              slug: slug,
              description: 'Система управления'
            });
          }
        }
      } catch (err) {
        console.error('Ошибка загрузки информации о холдинге:', err);
      }
    };

    loadHoldingInfo();
  }, []);

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

  const holdingName = holdingInfo?.name || 'Загрузка...';

  return (
    <div className="min-h-screen bg-gradient-to-br from-concrete-50 via-steel-50 to-construction-50 flex items-center justify-center p-4">
      <SEOHead 
        title={`Вход в ${holdingName}`}
        description={`Авторизация в панели управления холдинга ${holdingName}`}
        keywords="авторизация, холдинг, панель управления"
      />

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
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                <BuildingOfficeIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-steel-900">{holdingName}</span>
            </Link>
            
            <h1 className="text-3xl lg:text-4xl font-bold text-steel-900 mb-3">
              Панель управления
            </h1>
            <p className="text-steel-600 text-lg">
              Войдите для доступа к системе управления холдингом
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
                  className="block w-full pl-12 pr-4 py-3 border border-steel-300 rounded-xl text-steel-900 placeholder-steel-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                  className="block w-full pl-12 pr-12 py-3 border border-steel-300 rounded-xl text-steel-900 placeholder-steel-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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

            {/* Запомнить меня */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-white border-steel-300 rounded focus:ring-blue-500 focus:ring-2"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="ml-2 text-sm text-steel-700">Запомнить меня</span>
              </label>
            </div>

            {/* Кнопка входа */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Вход...
                </div>
              ) : (
                <div className="flex items-center">
                  <span>Войти в панель управления</span>
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </div>
              )}
            </motion.button>
          </form>

          {/* Ссылка на главную */}
          <div className="mt-8 text-center">
            <Link 
              to="/" 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
            >
              ← Вернуться на главную страницу холдинга
            </Link>
          </div>
        </motion.div>

        {/* Правая панель - Информация */}
        <motion.div 
          className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-blue-500 to-blue-700 p-12 text-white relative overflow-hidden"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Фоновые элементы */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-center">
            <div className="mb-8">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <BuildingOfficeIcon className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold mb-4">
                Система управления холдингом
              </h2>
              <p className="text-blue-100 text-lg leading-relaxed mb-8">
                {holdingInfo?.description || 'Централизованное управление всеми компаниями холдинга, проектами и ресурсами в одной системе.'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-blue-100">Управление организациями</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-blue-100">Консолидированная отчетность</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-blue-100">Контроль доступов</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-blue-100">Аналитика и мониторинг</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HoldingLoginPage; 