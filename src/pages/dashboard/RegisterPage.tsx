import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Building2, 
  MapPin, 
  AlertTriangle, 
  Camera, 
  X,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import useDaData from '@/hooks/useDaData';
import AutocompleteInput from '@/components/shared/AutocompleteInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'react-toastify';

const RegisterPage = () => {
  // User Data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  
  // Org Data
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
  // const [showNetworkError, setShowNetworkError] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const { searchAddresses, searchCities, searchOrganizations, isLoading: isDaDataLoading } = useDaData();

  const handleOrganizationSearch = async (query: string) => {
    const results = await searchOrganizations(query);
    return results.map(item => ({
      value: item.data.name.short || item.value,
      label: item.data.name.short || item.value,
      data: item.data
    }));
  };

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

  const handleOrganizationSelect = (value: string, data?: any) => {
    setOrganizationName(value);
    if (data) {
      if (data.name?.full) setOrganizationLegalName(data.name.full);
      if (data.inn) setOrganizationTaxNumber(data.inn);
      if (data.ogrn) setOrganizationRegistrationNumber(data.ogrn);
      if (data.address?.unrestricted_value) {
        setOrganizationAddress(data.address.unrestricted_value);
      }
    }
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
      
      setShowEmailVerificationModal(true);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 5000);
    } catch (err: any) {
      console.error('Ошибка при регистрации:', err);
      
      if (err.message?.includes('Не удалось подключиться к серверу')) {
        // setShowNetworkError(true);
        setError('Не удалось подключиться к серверу. Проверьте подключение к интернету или попробуйте позже.');
      } else if (err.message?.includes('уже занят')) {
        setValidationErrors(prev => ({
          ...prev,
          email: 'Этот email уже используется. Попробуйте войти или используйте другой email'
        }));
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

  // Helper to apply styles to AutocompleteInput or regular inputs if needed, though Shadcn inputs handle their own style usually.
  // We will pass className to Shadcn components.
  const getInputClassName = (field: string) => {
     return cn(
        "pl-10 h-11",
        hasError(field) && "border-destructive focus-visible:ring-destructive"
     )
  }

  const steps = [
    { id: 1, name: 'Личные данные', description: 'Основная информация' },
    { id: 2, name: 'Организация', description: 'Данные компании' }
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
       <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://img.freepik.com/free-vector/construction-set-icons_1284-13233.jpg')] bg-repeat bg-[length:400px]"></div>

      <motion.div 
        className="w-full max-w-4xl bg-card border rounded-3xl shadow-2xl overflow-hidden relative z-10"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        
        {/* Header */}
        <div className="bg-primary px-8 py-6">
            <div className="flex items-center justify-between mb-6">
                <Link to="/" className="flex items-center gap-3 text-primary-foreground">
                     <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center font-bold">P</div>
                     <span className="font-bold text-xl">ProHelper</span>
                </Link>
                 <Link 
                    to="/login" 
                    className="text-primary-foreground/80 hover:text-primary-foreground text-sm font-medium transition-colors"
                >
                    Уже есть аккаунт? Войти
                </Link>
            </div>
            
            <h1 className="text-2xl font-bold text-primary-foreground mb-2">Создание аккаунта</h1>
             <p className="text-primary-foreground/70 text-sm">Присоединяйтесь к ProHelper для управления строительными проектами</p>

             {/* Progress Steps */}
            <div className="mt-8 flex items-center">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                        <div className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all",
                            currentStep >= step.id 
                                ? "bg-white border-white text-primary" 
                                : "border-white/40 text-white/40"
                        )}>
                            {currentStep > step.id ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{step.id}</span>}
                        </div>
                        <div className="ml-3 hidden sm:block">
                            <div className={cn("text-sm font-medium", currentStep >= step.id ? "text-white" : "text-white/60")}>{step.name}</div>
                            <div className="text-[10px] text-white/50">{step.description}</div>
                        </div>
                         {index < steps.length - 1 && (
                            <div className={cn(
                                "mx-4 h-[2px] w-12 transition-all",
                                currentStep > step.id ? "bg-white" : "bg-white/20"
                            )} />
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* Error Alert */}
        {error && (
             <motion.div 
              className="mx-8 mt-6 p-4 rounded-xl bg-destructive/10 text-destructive flex items-start gap-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
               <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
               <div className="text-sm">
                 <p className="font-bold">Ошибка регистрации</p>
                 <p>{error}</p>
               </div>
            </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
             <AnimatePresence mode="wait">
                 {currentStep === 1 && (
                     <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                     >
                        {/* Avatar Upload */}
                        <div className="flex flex-col items-center mb-8">
                             <div className="relative group cursor-pointer">
                                 <div className={cn(
                                     "w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors",
                                     avatarPreview ? "border-primary" : "border-muted-foreground/20 group-hover:border-primary"
                                 )}>
                                     {avatarPreview ? (
                                         <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                     ) : (
                                         <Camera className="w-8 h-8 text-muted-foreground/50" />
                                     )}
                                 </div>
                                 <input type="file" accept="image/*" onChange={handleAvatarChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                 {avatarPreview && (
                                     <button type="button" onClick={removeAvatar} className="absolute -top-1 -right-1 bg-destructive text-white p-1 rounded-full shadow-sm hover:bg-destructive/90">
                                         <X className="w-3 h-3" />
                                     </button>
                                 )}
                             </div>
                             <p className="text-sm text-muted-foreground mt-2">Фото профиля (необязательно)</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Полное имя</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input id="name" value={name} onChange={e => setName(e.target.value)} className={getInputClassName('name')} placeholder="Иван Иванов" />
                                </div>
                                {hasError('name') && <p className="text-xs text-destructive">{getErrorMessage('name')}</p>}
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className={getInputClassName('email')} placeholder="ivan@example.com" />
                                </div>
                                {hasError('email') && <p className="text-xs text-destructive">{getErrorMessage('email')}</p>}
                            </div>

                             <div className="space-y-2">
                                <Label htmlFor="password">Пароль</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="password" 
                                        type={showPassword ? 'text' : 'password'} 
                                        value={password} 
                                        onChange={e => setPassword(e.target.value)} 
                                        className={cn(getInputClassName('password'), "pr-10")} 
                                        placeholder="••••••••" 
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {hasError('password') && <p className="text-xs text-destructive">{getErrorMessage('password')}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="passwordConfirmation">Подтверждение пароля</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="passwordConfirmation" 
                                        type={showPasswordConfirmation ? 'text' : 'password'} 
                                        value={passwordConfirmation} 
                                        onChange={e => setPasswordConfirmation(e.target.value)} 
                                        className={cn(getInputClassName('passwordConfirmation'), "pr-10")} 
                                        placeholder="••••••••" 
                                    />
                                    <button type="button" onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                                        {showPasswordConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {hasError('passwordConfirmation') && <p className="text-xs text-destructive">{getErrorMessage('passwordConfirmation')}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Телефон</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="pl-10 h-11" placeholder="+7 (999) 000-00-00" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="position">Должность</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input id="position" value={position} onChange={e => setPosition(e.target.value)} className="pl-10 h-11" placeholder="Генеральный директор" />
                                </div>
                            </div>
                        </div>
                     </motion.div>
                 )}

                 {currentStep === 2 && (
                     <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                     >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <Label htmlFor="organizationName">Название организации</Label>
                                <AutocompleteInput
                                    value={organizationName}
                                    onChange={handleOrganizationSelect}
                                    onSearch={handleOrganizationSearch}
                                    placeholder="ООО СтройКомплект"
                                    className={getInputClassName('organizationName')}
                                    icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
                                    isLoading={isDaDataLoading}
                                />
                                {hasError('organizationName') && <p className="text-xs text-destructive">{getErrorMessage('organizationName')}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="organizationTaxNumber">ИНН</Label>
                                <Input id="organizationTaxNumber" value={organizationTaxNumber} onChange={e => setOrganizationTaxNumber(e.target.value)} className="h-11" placeholder="1234567890" />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="organizationRegistrationNumber">ОГРН</Label>
                                <Input id="organizationRegistrationNumber" value={organizationRegistrationNumber} onChange={e => setOrganizationRegistrationNumber(e.target.value)} className="h-11" placeholder="1234567890123" />
                            </div>

                             <div className="space-y-2">
                                <Label htmlFor="organizationPhone">Телефон организации</Label>
                                <Input id="organizationPhone" value={organizationPhone} onChange={e => setOrganizationPhone(e.target.value)} className="h-11" placeholder="+7 (495) 000-00-00" />
                            </div>

                             <div className="space-y-2">
                                <Label htmlFor="organizationEmail">Email организации</Label>
                                <Input id="organizationEmail" value={organizationEmail} onChange={e => setOrganizationEmail(e.target.value)} className="h-11" placeholder="info@company.com" />
                            </div>

                             <div className="md:col-span-2 space-y-2">
                                <Label htmlFor="organizationAddress">Адрес</Label>
                                <AutocompleteInput
                                    value={organizationAddress}
                                    onChange={handleAddressSelect}
                                    onSearch={handleAddressSearch}
                                    placeholder="г. Москва, ул. Ленина, д. 1"
                                    className="pl-10 h-11"
                                    icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
                                    isLoading={isDaDataLoading}
                                />
                            </div>

                             <div className="space-y-2">
                                <Label htmlFor="organizationCity">Город</Label>
                                <AutocompleteInput
                                    value={organizationCity}
                                    onChange={handleCitySelect}
                                    onSearch={handleCitySearch}
                                    placeholder="Москва"
                                    className="pl-10 h-11"
                                    icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
                                    isLoading={isDaDataLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="organizationPostalCode">Индекс</Label>
                                <Input id="organizationPostalCode" value={organizationPostalCode} onChange={e => setOrganizationPostalCode(e.target.value)} className="h-11" placeholder="101000" />
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} />
                                <span className="text-sm text-muted-foreground">
                                    Я согласен с <Link to="/terms" className="text-primary hover:underline">условиями предоставления услуг</Link> и <Link to="/privacy" className="text-primary hover:underline">политикой конфиденциальности</Link>
                                </span>
                            </label>
                            {hasError('agreeTerms') && <p className="text-xs text-destructive mt-1">{getErrorMessage('agreeTerms')}</p>}
                        </div>
                     </motion.div>
                 )}
             </AnimatePresence>

             <div className="mt-8 flex items-center justify-between pt-6 border-t">
                {currentStep > 1 ? (
                    <Button type="button" variant="outline" onClick={handleBack} className="h-12 px-6">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Назад
                    </Button>
                ) : (
                    <div />
                )}

                <Button 
                    type="submit" 
                    className="h-12 px-8 shadow-lg shadow-primary/25" 
                    disabled={isLoading}
                >
                    {isLoading ? (
                         <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {currentStep === 1 ? 'Далее...' : 'Создание...'}
                         </>
                    ) : (
                        <>
                            {currentStep === 1 ? 'Далее' : 'Создать аккаунт'}
                            {currentStep === 1 ? <ArrowRight className="w-4 h-4 ml-2" /> : <Check className="w-4 h-4 ml-2" />}
                        </>
                    )}
                </Button>
             </div>
        </form>
      </motion.div>

      {showEmailVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Регистрация успешна!
            </h2>
            <p className="text-gray-600 mb-2">
              Мы отправили письмо на адрес <span className="font-semibold text-gray-900">{email}</span>
            </p>
            <p className="text-gray-600 mb-6">
              Пожалуйста, проверьте свою почту и подтвердите email, чтобы получить полный доступ ко всем функциям платформы.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
              <Mail className="w-4 h-4" />
              <span>Письмо может попасть в папку "Спам"</span>
            </div>
            <Button
              onClick={() => {
                setShowEmailVerificationModal(false);
                navigate('/dashboard');
              }}
              className="w-full"
            >
              Перейти в личный кабинет
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
