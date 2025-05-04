import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@hooks/useAuth';
import { RegisterData } from '@contexts/AuthContext';

const RegisterPage = () => {
  // Основные данные пользователя
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  
  // Данные организации
  const [organizationName, setOrganizationName] = useState('');
  const [organizationLegalName, setOrganizationLegalName] = useState('');
  const [organizationTaxNumber, setOrganizationTaxNumber] = useState('');
  const [organizationRegistrationNumber, setOrganizationRegistrationNumber] = useState('');
  const [organizationPhone, setOrganizationPhone] = useState('');
  const [organizationEmail, setOrganizationEmail] = useState('');
  const [organizationAddress, setOrganizationAddress] = useState('');
  const [organizationCity, setOrganizationCity] = useState('');
  const [organizationPostalCode, setOrganizationPostalCode] = useState('');
  const [organizationCountry, setOrganizationCountry] = useState('');
  
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNetworkError, setShowNetworkError] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Очищаем предыдущие ошибки
    setError('');
    setValidationErrors({});
    setShowNetworkError(false);
    
    // Базовая валидация
    if (currentStep === 1) {
      const errors: Record<string, string> = {};
      
      if (!name) errors.name = 'Укажите ваше имя';
      if (!email) errors.email = 'Укажите email';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Укажите корректный email';
      
      if (!password) errors.password = 'Укажите пароль';
      else if (password.length < 8) errors.password = 'Пароль должен содержать не менее 8 символов';
      
      if (!passwordConfirmation) errors.passwordConfirmation = 'Подтвердите пароль';
      else if (password !== passwordConfirmation) errors.passwordConfirmation = 'Пароли не совпадают';
      
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setError('Пожалуйста, исправьте ошибки в форме');
        return;
      }
      
      setCurrentStep(2);
      return;
    }
    
    // Валидация данных организации
    if (currentStep === 2) {
      const errors: Record<string, string> = {};
      
      if (!organizationName) errors.organizationName = 'Укажите название организации';
      
      if (!agreeTerms) errors.agreeTerms = 'Вы должны согласиться с условиями предоставления услуг';
      
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setError('Пожалуйста, исправьте ошибки в форме');
        return;
      }
      
      setIsLoading(true);
      
      try {
        const userData: RegisterData = {
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
          phone,
          position,
          organization_name: organizationName,
        };
        
        // Добавляем необязательные поля, только если они заполнены
        if (organizationLegalName) userData.organization_legal_name = organizationLegalName;
        if (organizationTaxNumber) userData.organization_tax_number = organizationTaxNumber;
        if (organizationRegistrationNumber) userData.organization_registration_number = organizationRegistrationNumber;
        if (organizationPhone) userData.organization_phone = organizationPhone;
        if (organizationEmail) userData.organization_email = organizationEmail;
        if (organizationAddress) userData.organization_address = organizationAddress;
        if (organizationCity) userData.organization_city = organizationCity;
        if (organizationPostalCode) userData.organization_postal_code = organizationPostalCode;
        if (organizationCountry) userData.organization_country = organizationCountry;
        
        await register(userData);
        
        // После успешной регистрации перенаправляем пользователя
        navigate('/dashboard');
      } catch (err: any) {
        console.error('Ошибка при регистрации:', err);
        
        // Проверяем тип ошибки для отображения соответствующего сообщения
        if (err.message.includes('Не удалось подключиться к серверу')) {
          setShowNetworkError(true);
          setError('Не удалось подключиться к серверу. Проверьте подключение к интернету или попробуйте позже.');
        } else if (err.message.includes('уже занят')) {
          setCurrentStep(1);
          setValidationErrors({
            email: 'Этот email уже используется. Попробуйте войти или используйте другой email'
          });
          setError('Email уже зарегистрирован в системе');
        } else {
          setError(err.message || 'Произошла ошибка при регистрации. Пожалуйста, попробуйте снова.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Проверяем наличие ошибки для конкретного поля
  const hasError = (field: string): boolean => {
    return !!validationErrors[field];
  };

  // Получаем текст ошибки для поля
  const getErrorMessage = (field: string): string => {
    return validationErrors[field] || '';
  };
  
  // Класс для поля с ошибкой
  const getInputClass = (field: string): string => {
    const baseClass = "mt-1 appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm";
    
    return hasError(field)
      ? `${baseClass} border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500`
      : `${baseClass} border-secondary-300`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <Link to="/" className="flex justify-center items-center">
            <img
              className="h-12 w-auto"
              src="/logo.svg"
              alt="Прораб-Финанс Мост"
            />
            <span className="ml-3 font-bold text-xl text-primary-700">ПрорабМост</span>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary-900">
            {currentStep === 1 ? 'Регистрация аккаунта' : 'Информация об организации'}
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-500">
            {currentStep === 1 ? (
              <>
                Или{' '}
                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                  войдите, если у вас уже есть аккаунт
                </Link>
              </>
            ) : (
              <>
                Шаг 2 из 2 - укажите данные вашей организации
              </>
            )}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                {showNetworkError && (
                  <p className="text-sm text-red-700 mt-2">
                    Возможные причины:
                    <ul className="list-disc list-inside mt-1">
                      <li>Сервер временно недоступен</li>
                      <li>Проблемы с интернет-соединением</li>
                      <li>Блокировка запросов браузером или сетевым оборудованием</li>
                    </ul>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {currentStep === 1 ? (
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-secondary-700">
                  Ваше имя <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className={getInputClass('name')}
                  placeholder="Иван Иванов"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {hasError('name') && (
                  <p className="mt-1 text-sm text-red-600">{getErrorMessage('name')}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-secondary-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={getInputClass('email')}
                  placeholder="ivan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {hasError('email') && (
                  <p className="mt-1 text-sm text-red-600">{getErrorMessage('email')}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-secondary-700">
                    Телефон
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className={getInputClass('phone')}
                    placeholder="+7 (999) 123-45-67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-secondary-700">
                    Должность
                  </label>
                  <input
                    id="position"
                    name="position"
                    type="text"
                    className={getInputClass('position')}
                    placeholder="Директор"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                  Пароль <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={getInputClass('password')}
                  placeholder="Минимум 8 символов"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {hasError('password') && (
                  <p className="mt-1 text-sm text-red-600">{getErrorMessage('password')}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="password-confirmation" className="block text-sm font-medium text-secondary-700">
                  Подтверждение пароля <span className="text-red-500">*</span>
                </label>
                <input
                  id="password-confirmation"
                  name="password-confirmation"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={getInputClass('passwordConfirmation')}
                  placeholder="Повторите пароль"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                />
                {hasError('passwordConfirmation') && (
                  <p className="mt-1 text-sm text-red-600">{getErrorMessage('passwordConfirmation')}</p>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Далее
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="organization-name" className="block text-sm font-medium text-secondary-700">
                  Название организации <span className="text-red-500">*</span>
                </label>
                <input
                  id="organization-name"
                  name="organization-name"
                  type="text"
                  required
                  className={getInputClass('organizationName')}
                  placeholder="ООО Строй-Компания"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                />
                {hasError('organizationName') && (
                  <p className="mt-1 text-sm text-red-600">{getErrorMessage('organizationName')}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="organization-legal-name" className="block text-sm font-medium text-secondary-700">
                  Юридическое название
                </label>
                <input
                  id="organization-legal-name"
                  name="organization-legal-name"
                  type="text"
                  className={getInputClass('organizationLegalName')}
                  placeholder="ООО Строительная Компания"
                  value={organizationLegalName}
                  onChange={(e) => setOrganizationLegalName(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="organization-tax-number" className="block text-sm font-medium text-secondary-700">
                    ИНН
                  </label>
                  <input
                    id="organization-tax-number"
                    name="organization-tax-number"
                    type="text"
                    className={getInputClass('organizationTaxNumber')}
                    placeholder="1234567890"
                    value={organizationTaxNumber}
                    onChange={(e) => setOrganizationTaxNumber(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="organization-registration-number" className="block text-sm font-medium text-secondary-700">
                    ОГРН
                  </label>
                  <input
                    id="organization-registration-number"
                    name="organization-registration-number"
                    type="text"
                    className={getInputClass('organizationRegistrationNumber')}
                    placeholder="1234567890123"
                    value={organizationRegistrationNumber}
                    onChange={(e) => setOrganizationRegistrationNumber(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="organization-phone" className="block text-sm font-medium text-secondary-700">
                    Телефон
                  </label>
                  <input
                    id="organization-phone"
                    name="organization-phone"
                    type="tel"
                    className={getInputClass('organizationPhone')}
                    placeholder="+7 (999) 123-45-67"
                    value={organizationPhone}
                    onChange={(e) => setOrganizationPhone(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="organization-email" className="block text-sm font-medium text-secondary-700">
                    Email организации
                  </label>
                  <input
                    id="organization-email"
                    name="organization-email"
                    type="email"
                    className={getInputClass('organizationEmail')}
                    placeholder="info@company.ru"
                    value={organizationEmail}
                    onChange={(e) => setOrganizationEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="organization-address" className="block text-sm font-medium text-secondary-700">
                  Адрес
                </label>
                <input
                  id="organization-address"
                  name="organization-address"
                  type="text"
                  className={getInputClass('organizationAddress')}
                  placeholder="ул. Строителей, 1"
                  value={organizationAddress}
                  onChange={(e) => setOrganizationAddress(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="organization-city" className="block text-sm font-medium text-secondary-700">
                    Город
                  </label>
                  <input
                    id="organization-city"
                    name="organization-city"
                    type="text"
                    className={getInputClass('organizationCity')}
                    placeholder="Москва"
                    value={organizationCity}
                    onChange={(e) => setOrganizationCity(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="organization-postal-code" className="block text-sm font-medium text-secondary-700">
                    Индекс
                  </label>
                  <input
                    id="organization-postal-code"
                    name="organization-postal-code"
                    type="text"
                    className={getInputClass('organizationPostalCode')}
                    placeholder="123456"
                    value={organizationPostalCode}
                    onChange={(e) => setOrganizationPostalCode(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="organization-country" className="block text-sm font-medium text-secondary-700">
                    Страна
                  </label>
                  <input
                    id="organization-country"
                    name="organization-country"
                    type="text"
                    className={getInputClass('organizationCountry')}
                    placeholder="Россия"
                    value={organizationCountry}
                    onChange={(e) => setOrganizationCountry(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center mt-4">
                <input
                  id="agree-terms"
                  name="agree-terms"
                  type="checkbox"
                  className={`h-4 w-4 focus:ring-primary-500 rounded ${hasError('agreeTerms') ? 'border-red-300 text-red-900' : 'border-secondary-300 text-primary-600'}`}
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <label htmlFor="agree-terms" className={`ml-2 block text-sm ${hasError('agreeTerms') ? 'text-red-900' : 'text-secondary-900'}`}>
                  Я согласен с{' '}
                  <Link to="/terms" className="font-medium text-primary-600 hover:text-primary-500">
                    условиями предоставления услуг
                  </Link>
                  {' '}и{' '}
                  <Link to="/privacy-policy" className="font-medium text-primary-600 hover:text-primary-500">
                    политикой конфиденциальности
                  </Link>
                </label>
              </div>
              {hasError('agreeTerms') && (
                <p className="mt-1 text-sm text-red-600">{getErrorMessage('agreeTerms')}</p>
              )}
              
              <div className="flex justify-between">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setCurrentStep(1)}
                >
                  Назад
                </button>
                <button
                  type="submit"
                  className={`btn btn-primary ${isLoading || !agreeTerms ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={isLoading || !agreeTerms}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Регистрация...
                    </>
                  ) : (
                    'Зарегистрироваться'
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
        
        <div className="mt-6">
          <p className="text-center text-xs text-secondary-500">
            Регистрируясь, вы получаете 14-дневный бесплатный доступ ко всем функциям сервиса.
            После окончания пробного периода вы можете выбрать подходящий тарифный план.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage; 