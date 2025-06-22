import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@hooks/useAuth';
import useDaData, { DaDataAddress, DaDataCity } from '@hooks/useDaData';
import AutocompleteInput from '@components/shared/AutocompleteInput';

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
  const [organizationCountry] = useState('Россия');
  
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNetworkError, setShowNetworkError] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const { searchAddresses, searchCities, isLoading: isDaDataLoading } = useDaData();

  const handleAddressSearch = async (query: string) => {
    const results = await searchAddresses(query);
    return results.map(item => ({
      value: item.value,
      label: item.value,
      data: item.data
    }));
  };

  const handleCitySearch = async (query: string) => {
    const results = await searchCities(query);
    return results.map(item => ({
      value: item.data.city || item.value,
      label: `${item.data.city}${item.data.region ? ', ' + item.data.region : ''}`,
      data: item.data
    }));
  };

  const handleAddressSelect = (value: string, data?: any) => {
    setOrganizationAddress(value);
    if (data) {
      if (data.city) setOrganizationCity(data.city);
      if (data.postal_code) setOrganizationPostalCode(data.postal_code);
    }
  };

  const handleCitySelect = (value: string) => {
    setOrganizationCity(value);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setValidationErrors(prev => ({ ...prev, avatar: 'Размер файла не должен превышать 2 МБ' }));
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        setValidationErrors(prev => ({ ...prev, avatar: 'Допустимые форматы: JPG, PNG, GIF' }));
        return;
      }
      
      setAvatarFile(file);
      setValidationErrors(prev => ({ ...prev, avatar: '' }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      }
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setValidationErrors(prev => ({ ...prev, avatar: '' }));
  };

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    
    if (!name.trim()) errors.name = 'Укажите ваше имя';
    if (!email.trim()) errors.email = 'Укажите email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Укажите корректный email';
    
    if (!password) errors.password = 'Укажите пароль';
    else if (password.length < 8) errors.password = 'Пароль должен содержать не менее 8 символов';
    
    if (!passwordConfirmation) errors.passwordConfirmation = 'Подтвердите пароль';
    else if (password !== passwordConfirmation) errors.passwordConfirmation = 'Пароли не совпадают';
    
    return errors;
  };

  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    
    if (!organizationName.trim()) errors.organizationName = 'Укажите название организации';
    if (!agreeTerms) errors.agreeTerms = 'Вы должны согласиться с условиями предоставления услуг';
    
    return errors;
  };

  const handleNext = () => {
    const errors = validateStep1();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError('Пожалуйста, исправьте ошибки в форме');
      return;
    }
    
    setValidationErrors({});
    setError('');
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 1) {
      handleNext();
      return;
    }
    
    const errors = validateStep2();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError('Пожалуйста, исправьте ошибки в форме');
      return;
    }
    
    setError('');
    setValidationErrors({});
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('password_confirmation', passwordConfirmation);
      if (phone) formData.append('phone', phone);
      if (position) formData.append('position', position);
      formData.append('organization_name', organizationName);
      if (organizationLegalName) formData.append('organization_legal_name', organizationLegalName);
      if (organizationTaxNumber) formData.append('organization_tax_number', organizationTaxNumber);
      if (organizationRegistrationNumber) formData.append('organization_registration_number', organizationRegistrationNumber);
      if (organizationPhone) formData.append('organization_phone', organizationPhone);
      if (organizationEmail) formData.append('organization_email', organizationEmail);
      if (organizationAddress) formData.append('organization_address', organizationAddress);
      if (organizationCity) formData.append('organization_city', organizationCity);
      if (organizationPostalCode) formData.append('organization_postal_code', organizationPostalCode);
      if (organizationCountry) formData.append('organization_country', organizationCountry);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      
      await register(formData);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Ошибка при регистрации:', err);
      
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
        if (err.errors && typeof err.errors === 'object') {
          const serverErrors: Record<string, string> = {};
          for (const key in err.errors) {
            if (Array.isArray(err.errors[key]) && err.errors[key].length > 0) {
              serverErrors[key] = err.errors[key][0];
            }
          }
          setValidationErrors(serverErrors);
          setError(err.message || 'Ошибка валидации данных на сервере.');
          if (serverErrors.name || serverErrors.email || serverErrors.password || serverErrors.avatar) {
            setCurrentStep(1);
          }
        } else {
          setError(err.message || 'Произошла ошибка при регистрации. Пожалуйста, попробуйте снова.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const hasError = (field: string): boolean => {
    return !!validationErrors[field];
  };

  const getErrorMessage = (field: string): string => {
    return validationErrors[field] || '';
  };

  const getInputClass = (field: string): string => {
    const baseClass = "block w-full pl-12 pr-4 py-3 border rounded-xl text-steel-900 placeholder-steel-400 focus:outline-none focus:ring-2 focus:ring-construction-500 focus:border-construction-500 transition-all duration-200";
    
    return hasError(field)
      ? `${baseClass} border-red-300 focus:ring-red-500 focus:border-red-500`
      : `${baseClass} border-steel-300`;
  };

  const steps = [
    { id: 1, name: 'Личные данные', description: 'Основная информация' },
    { id: 2, name: 'Организация', description: 'Данные компании' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-concrete-50 via-steel-50 to-construction-50 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Заголовок и прогресс */}
        <div className="bg-gradient-to-r from-construction-500 to-construction-600 px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="inline-flex items-center">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-2">
                <span className="text-white font-bold">P</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-white">ProHelper</span>
            </Link>
            
            <Link 
              to="/login" 
              className="text-construction-100 hover:text-white transition-colors text-xs sm:text-sm font-medium"
            >
              <span className="hidden sm:inline">Уже есть аккаунт? </span>Войти
            </Link>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Создание аккаунта</h1>
          <p className="text-construction-100 text-sm sm:text-base">
            <span className="hidden sm:inline">Присоединяйтесь к ProHelper для управления строительными проектами</span>
            <span className="sm:hidden">Присоединяйтесь к ProHelper</span>
          </p>
          
          {/* Индикатор прогресса */}
          <div className="mt-4 sm:mt-6">
            <div className="flex items-center justify-center sm:justify-start">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                    currentStep >= step.id 
                      ? 'bg-white border-white text-construction-600' 
                      : 'border-white/50 text-white/50'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckIcon className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-semibold">{step.id}</span>
                    )}
                  </div>
                  <div className="ml-2 sm:ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-white' : 'text-white/70'
                    }`}>
                      {step.name}
                    </p>
                    <p className="text-xs text-white/60">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`mx-3 sm:mx-6 h-0.5 w-8 sm:w-16 transition-all duration-300 ${
                      currentStep > step.id ? 'bg-white' : 'bg-white/30'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            {/* Мобильная версия названий шагов */}
            <div className="sm:hidden mt-3 text-center">
              <p className="text-white text-sm font-medium">
                {steps.find(step => step.id === currentStep)?.name}
              </p>
              <p className="text-white/60 text-xs">
                {steps.find(step => step.id === currentStep)?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Сообщение об ошибке */}
        {error && (
          <motion.div 
            className="mx-4 sm:mx-8 mt-4 sm:mt-6 bg-red-50 border-l-4 border-red-400 rounded-xl p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-red-700 font-medium mb-1">Ошибка регистрации</p>
                <p className="text-red-600 text-sm break-words">{error}</p>
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-8">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Аватар */}
                <div className="flex flex-col items-center mb-6 sm:mb-8">
                  <div className="relative group">
                    <div className="w-24 h-24 bg-gradient-to-br from-construction-100 to-construction-200 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-transparent group-hover:border-construction-300 transition-all duration-200">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Аватар" className="w-full h-full object-cover" />
                      ) : (
                        <PhotoIcon className="w-8 h-8 text-construction-400 group-hover:text-construction-500 transition-colors" />
                      )}
                    </div>
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                        title="Удалить фото"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      title="Выбрать фото профиля"
                    />
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-sm font-medium text-steel-700">Фото профиля</p>
                    <p className="text-xs text-steel-500 mt-1">
                      {avatarPreview ? 'Нажмите для замены' : 'Нажмите для загрузки'}
                    </p>
                    <p className="text-xs text-steel-400 mt-1">JPG, PNG или GIF до 2 МБ</p>
                  </div>
                </div>
                {hasError('avatar') && (
                  <p className="text-red-600 text-sm text-center -mt-4">{getErrorMessage('avatar')}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Имя */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-steel-700 mb-2">
                      Полное имя *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-steel-400" />
                      </div>
                      <input
                        id="name"
                        type="text"
                        required
                        className={getInputClass('name')}
                        placeholder="Введите ваше полное имя"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    {hasError('name') && (
                      <p className="mt-1 text-red-600 text-sm">{getErrorMessage('name')}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-steel-700 mb-2">
                      Email адрес *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-steel-400" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        required
                        className={getInputClass('email')}
                        placeholder="Введите ваш email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    {hasError('email') && (
                      <p className="mt-1 text-red-600 text-sm">{getErrorMessage('email')}</p>
                    )}
                  </div>

                  {/* Пароль */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-steel-700 mb-2">
                      Пароль *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <LockClosedIcon className="h-5 w-5 text-steel-400" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        className={getInputClass('password')}
                        placeholder="Минимум 8 символов"
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
                    {hasError('password') && (
                      <p className="mt-1 text-red-600 text-sm">{getErrorMessage('password')}</p>
                    )}
                  </div>

                  {/* Подтверждение пароля */}
                  <div>
                    <label htmlFor="passwordConfirmation" className="block text-sm font-semibold text-steel-700 mb-2">
                      Подтвердите пароль *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <LockClosedIcon className="h-5 w-5 text-steel-400" />
                      </div>
                      <input
                        id="passwordConfirmation"
                        type={showPasswordConfirmation ? 'text' : 'password'}
                        required
                        className={getInputClass('passwordConfirmation')}
                        placeholder="Повторите пароль"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                      >
                        {showPasswordConfirmation ? (
                          <EyeSlashIcon className="h-5 w-5 text-steel-400 hover:text-steel-600 transition-colors" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-steel-400 hover:text-steel-600 transition-colors" />
                        )}
                      </button>
                    </div>
                    {hasError('passwordConfirmation') && (
                      <p className="mt-1 text-red-600 text-sm">{getErrorMessage('passwordConfirmation')}</p>
                    )}
                  </div>

                  {/* Телефон */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-steel-700 mb-2">
                      Телефон
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <PhoneIcon className="h-5 w-5 text-steel-400" />
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        className={getInputClass('phone')}
                        placeholder="+7 (999) 123-45-67"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Должность */}
                  <div>
                    <label htmlFor="position" className="block text-sm font-semibold text-steel-700 mb-2">
                      Должность
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-steel-400" />
                      </div>
                      <input
                        id="position"
                        type="text"
                        className={getInputClass('position')}
                        placeholder="Например: Главный инженер"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Название организации */}
                  <div className="sm:col-span-2">
                    <label htmlFor="organizationName" className="block text-sm font-semibold text-steel-700 mb-2">
                      Название организации *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <BuildingOfficeIcon className="h-5 w-5 text-steel-400" />
                      </div>
                      <input
                        id="organizationName"
                        type="text"
                        required
                        className={getInputClass('organizationName')}
                        placeholder="ООО «Строительная компания»"
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                      />
                    </div>
                    {hasError('organizationName') && (
                      <p className="mt-1 text-red-600 text-sm">{getErrorMessage('organizationName')}</p>
                    )}
                  </div>

                  {/* Юридическое название */}
                  <div>
                    <label htmlFor="organizationLegalName" className="block text-sm font-semibold text-steel-700 mb-2">
                      Юридическое название
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <BuildingOfficeIcon className="h-5 w-5 text-steel-400" />
                      </div>
                      <input
                        id="organizationLegalName"
                        type="text"
                        className={getInputClass('organizationLegalName')}
                        placeholder="Полное юридическое название"
                        value={organizationLegalName}
                        onChange={(e) => setOrganizationLegalName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* ИНН */}
                  <div>
                    <label htmlFor="organizationTaxNumber" className="block text-sm font-semibold text-steel-700 mb-2">
                      ИНН
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-steel-400 text-sm font-mono">#</span>
                      </div>
                      <input
                        id="organizationTaxNumber"
                        type="text"
                        className={getInputClass('organizationTaxNumber')}
                        placeholder="1234567890"
                        value={organizationTaxNumber}
                        onChange={(e) => setOrganizationTaxNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* ОГРН */}
                  <div>
                    <label htmlFor="organizationRegistrationNumber" className="block text-sm font-semibold text-steel-700 mb-2">
                      ОГРН
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-steel-400 text-sm font-mono">#</span>
                      </div>
                      <input
                        id="organizationRegistrationNumber"
                        type="text"
                        className={getInputClass('organizationRegistrationNumber')}
                        placeholder="1234567890123"
                        value={organizationRegistrationNumber}
                        onChange={(e) => setOrganizationRegistrationNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Телефон организации */}
                  <div>
                    <label htmlFor="organizationPhone" className="block text-sm font-semibold text-steel-700 mb-2">
                      Телефон организации
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <PhoneIcon className="h-5 w-5 text-steel-400" />
                      </div>
                      <input
                        id="organizationPhone"
                        type="tel"
                        className={getInputClass('organizationPhone')}
                        placeholder="+7 (495) 123-45-67"
                        value={organizationPhone}
                        onChange={(e) => setOrganizationPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Email организации */}
                  <div>
                    <label htmlFor="organizationEmail" className="block text-sm font-semibold text-steel-700 mb-2">
                      Email организации
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-steel-400" />
                      </div>
                      <input
                        id="organizationEmail"
                        type="email"
                        className={getInputClass('organizationEmail')}
                        placeholder="info@company.ru"
                        value={organizationEmail}
                        onChange={(e) => setOrganizationEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Адрес */}
                  <div className="sm:col-span-2">
                    <label htmlFor="organizationAddress" className="block text-sm font-semibold text-steel-700 mb-2">
                      Адрес
                    </label>
                    <AutocompleteInput
                      value={organizationAddress}
                      onChange={handleAddressSelect}
                      onSearch={handleAddressSearch}
                      placeholder="Начните вводить адрес..."
                      className={getInputClass('organizationAddress')}
                      icon={<MapPinIcon className="h-5 w-5 text-steel-400" />}
                      isLoading={isDaDataLoading}
                    />
                  </div>

                  {/* Город */}
                  <div>
                    <label htmlFor="organizationCity" className="block text-sm font-semibold text-steel-700 mb-2">
                      Город
                    </label>
                    <AutocompleteInput
                      value={organizationCity}
                      onChange={handleCitySelect}
                      onSearch={handleCitySearch}
                      placeholder="Начните вводить город..."
                      className={getInputClass('organizationCity')}
                      icon={<MapPinIcon className="h-5 w-5 text-steel-400" />}
                      isLoading={isDaDataLoading}
                    />
                  </div>

                  {/* Почтовый индекс */}
                  <div>
                    <label htmlFor="organizationPostalCode" className="block text-sm font-semibold text-steel-700 mb-2">
                      Почтовый индекс
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-steel-400 text-sm font-mono">#</span>
                      </div>
                      <input
                        id="organizationPostalCode"
                        type="text"
                        className={getInputClass('organizationPostalCode')}
                        placeholder="123456"
                        value={organizationPostalCode}
                        onChange={(e) => setOrganizationPostalCode(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Согласие с условиями */}
                <div className="pt-4 sm:pt-6 border-t border-steel-200">
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-construction-600 bg-white border-steel-300 rounded focus:ring-construction-500 focus:ring-2 mt-0.5 flex-shrink-0"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                    />
                    <span className="text-sm text-steel-700 leading-relaxed min-w-0">
                      Я согласен с{' '}
                      <Link to="/terms" className="text-construction-600 hover:text-construction-700 font-medium break-words" target="_blank">
                        условиями предоставления услуг
                      </Link>
                      {' '}и{' '}
                      <Link to="/privacy" className="text-construction-600 hover:text-construction-700 font-medium break-words" target="_blank">
                        политикой конфиденциальности
                      </Link>
                    </span>
                  </label>
                  {hasError('agreeTerms') && (
                    <p className="mt-2 text-red-600 text-sm break-words">{getErrorMessage('agreeTerms')}</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Кнопки навигации */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-steel-200 gap-3 sm:gap-0">
            {currentStep > 1 ? (
              <motion.button
                type="button"
                onClick={handleBack}
                className="flex items-center justify-center px-4 sm:px-6 py-3 text-steel-700 bg-white border border-steel-300 rounded-xl hover:bg-steel-50 transition-colors font-medium order-2 sm:order-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Назад
              </motion.button>
            ) : (
              <div className="hidden sm:block"></div>
            )}

            <motion.button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center px-6 sm:px-8 py-3 bg-gradient-to-r from-construction-500 to-construction-600 text-white rounded-xl font-semibold shadow-construction hover:shadow-construction-lg disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 order-1 sm:order-2 min-h-[48px]"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="hidden sm:inline">Создание аккаунта...</span>
                  <span className="sm:hidden">Создание...</span>
                </>
              ) : currentStep === 1 ? (
                <>
                  Далее
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Создать аккаунт</span>
                  <span className="sm:hidden">Создать</span>
                  <CheckIcon className="w-4 h-4 ml-2" />
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage; 