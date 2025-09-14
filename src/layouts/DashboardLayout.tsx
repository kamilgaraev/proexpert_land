import { Fragment, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Bars3Icon, 
  XMarkIcon, 
  HomeIcon, 
  ArrowLeftOnRectangleIcon,
  UserCircleIcon,
  BanknotesIcon,
  QuestionMarkCircleIcon,
  TicketIcon,
  WalletIcon,
  BuildingOfficeIcon,
  CogIcon,
  BellIcon,
  UsersIcon,
  ShieldCheckIcon,
  ChartPieIcon,
  PuzzlePieceIcon,
  BuildingOffice2Icon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@hooks/useAuth';
import { useModules } from '@hooks/useModules';
import { useCanAccess } from '@/hooks/usePermissions';
import { Menu, Transition } from '@headlessui/react';
import { classNames } from '@utils/classNames';
import { billingService, OrganizationBalance, ErrorResponse } from '@utils/api';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [actualBalance, setActualBalance] = useState<OrganizationBalance | null>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const balanceLoadedRef = useRef(false);
  
  // Используем новую систему модулей
  const { 
    expiringModules, 
    hasExpiring
  } = useModules({ autoRefresh: true, refreshInterval: 900000 });

  // Вызываем все хуки для проверки прав на верхнем уровне
  const canViewOrganization = useCanAccess({ permission: 'organization.view' }) || 
                              useCanAccess({ role: 'organization_owner' }) ||
                              useCanAccess({ role: 'organization_admin' });
  
  const canManageUsers = useCanAccess({ permission: 'users.manage' }) ||
                         useCanAccess({ permission: 'users.manage_admin' }) ||
                         useCanAccess({ role: 'organization_owner' }) ||
                         useCanAccess({ role: 'organization_admin' });
  
  const canViewBilling = useCanAccess({ permission: 'billing.manage' }) ||
                         useCanAccess({ permission: 'billing.view' }) ||
                         useCanAccess({ role: 'organization_owner' }) ||
                         useCanAccess({ role: 'accountant' });
  
  const canViewLimits = useCanAccess({ role: 'organization_owner' }) ||
                        useCanAccess({ role: 'organization_admin' });
  
  const canManageBilling = useCanAccess({ permission: 'billing.manage' }) ||
                           useCanAccess({ role: 'organization_owner' });
  
  const canManageModules = useCanAccess({ permission: 'modules.manage' }) ||
                           useCanAccess({ role: 'organization_owner' }) ||
                           useCanAccess({ role: 'organization_admin' });
  
  const canInviteUsers = useCanAccess({ permission: 'users.invite' }) ||
                         useCanAccess({ role: 'organization_owner' }) ||
                         useCanAccess({ role: 'organization_admin' });

  const canManageMultiOrg = useCanAccess({ permission: 'multi_organization.manage' });
  const hasMultiOrgModule = useCanAccess({ module: 'multi-organization' });

  // Отладочное логирование для мультиорганизации
  console.log('🔍 DashboardLayout мультиорганизация проверки:', {
    canManageMultiOrg,
    hasMultiOrgModule,
    timestamp: new Date().toISOString()
  });

  const fetchHeaderBalance = useCallback(async () => {
    if (balanceLoadedRef.current) return; // Предотвращаем повторные вызовы
    
    setBalanceError(null);
    try {
      const response = await billingService.getBalance();
      if (response.status === 200) {
        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          setActualBalance((response.data as any).data as OrganizationBalance);
          balanceLoadedRef.current = true;
        } else {
          console.error('Unexpected balance data structure from API in Layout:', response.data);
          setBalanceError('Ошибка формата баланса');
          balanceLoadedRef.current = true;
        }
      } else if (response.status === 500) {
        console.warn('Серверная ошибка при загрузке баланса, игнорируем');
        setBalanceError('Временная ошибка сервера');
        balanceLoadedRef.current = true;
      } else {
        const errorData = response.data as unknown as ErrorResponse;
        setBalanceError(errorData?.message || `Ошибка ${response.status}`);
        balanceLoadedRef.current = true;
      }
    } catch (err: any) {
      console.error("Error fetching header balance:", err);
      setBalanceError('Временная ошибка загрузки');
      balanceLoadedRef.current = true;
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      // Загружаем баланс
      if (!balanceLoadedRef.current) {
        fetchHeaderBalance();
      }
    };
    
    loadData();
  }, [fetchHeaderBalance]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const mainNavigation = useMemo(() => {
    // Проверяем активность модуля мультиорганизации через систему прав
    const hasMultiOrgAccess = hasMultiOrgModule;

    // Определяем все возможные пункты навигации с проверками прав
    const allNavigationItems = [
      { 
        name: 'Обзор', 
        href: '/dashboard', 
        icon: HomeIcon,
        description: 'Общая статистика проектов',
        // Обзор доступен всем авторизованным пользователям
        visible: true
      },
      { 
        name: 'Организация', 
        href: '/dashboard/organization', 
        icon: BuildingOfficeIcon,
        description: 'Данные и верификация',
        // Организация доступна всем, кто может просматривать организацию
        visible: canViewOrganization
      },
      { 
        name: 'Команда', 
        href: '/dashboard/admins', 
        icon: UsersIcon,
        description: 'Администраторы и прорабы',
        // Команда доступна тем, кто может управлять пользователями
        visible: canManageUsers
      },
      { 
        name: 'Роли', 
        href: '/dashboard/custom-roles', 
        icon: ShieldCheckIcon,
        description: 'Кастомные роли организации',
        // Роли могут управлять только владельцы организации
        visible: canViewOrganization && canManageUsers
      },
      { 
        name: 'Финансы', 
        href: '/dashboard/billing', 
        icon: BanknotesIcon,
        description: 'Баланс и платежи',
        // Финансы доступны тем, кто может просматривать или управлять биллингом
        visible: canViewBilling
      },
      { 
        name: 'Лимиты', 
        href: '/dashboard/limits', 
        icon: ChartPieIcon,
        description: 'Лимиты подписки и использование',
        // Лимиты могут просматривать владельцы и админы
        visible: canViewLimits
      },
      { 
        name: 'Подписки', 
        href: '/dashboard/paid-services', 
        icon: TicketIcon,
        description: 'Управление подписками',
        // Подписки могут управлять только владельцы организации
        visible: canManageBilling
      },
      { 
        name: 'Модули', 
        href: '/dashboard/modules', 
        icon: PuzzlePieceIcon,
        description: 'Модули организации',
        badge: hasExpiring ? expiringModules.length : undefined,
        // Модули могут управлять владельцы и админы
        visible: canManageModules
      },
      { 
        name: 'Приглашения', 
        href: '/dashboard/contractor-invitations', 
        icon: EnvelopeIcon,
        description: 'Приглашения подрядчиков',
        // Приглашения могут отправлять те, кто может управлять пользователями
        visible: canInviteUsers
      }
    ];

    // Фильтруем видимые пункты меню
    const baseNavigation = allNavigationItems.filter(item => item.visible);

    // Добавляем мультиорганизацию только если модуль активирован И есть права
    console.log('🔍 Проверка добавления пункта "Холдинг":', {
      hasMultiOrgAccess,
      canManageMultiOrg,
      shouldAdd: hasMultiOrgAccess && canManageMultiOrg,
      currentNavigationCount: baseNavigation.length
    });
    
    if (hasMultiOrgAccess && canManageMultiOrg) {
      console.log('✅ Добавляем пункт "Холдинг" в навигацию');
      baseNavigation.push({
        name: 'Холдинг', 
        href: '/dashboard/multi-organization', 
        icon: BuildingOffice2Icon,
        description: 'Управление холдингом',
        visible: true
      });
    } else {
      console.log('❌ НЕ добавляем пункт "Холдинг":', {
        reason: !hasMultiOrgAccess ? 'Модуль неактивен' : 'Нет прав на управление'
      });
    }

    baseNavigation.push({
      name: 'Настройки', 
      href: '/dashboard/profile', 
      icon: CogIcon,
      description: 'Профиль и настройки',
      visible: true
    });

    console.log('🔍 Финальная навигация:', {
      itemsCount: baseNavigation.length,
      items: baseNavigation.map(item => ({ name: item.name, href: item.href }))
    });

    return baseNavigation;
  }, [hasExpiring, expiringModules.length, 
      canViewOrganization, canManageUsers, canViewBilling, canViewLimits, 
      canManageBilling, canManageModules, canInviteUsers, canManageMultiOrg, hasMultiOrgModule]);

  const supportNavigation = [
    { 
      name: 'Справка', 
      href: '/dashboard/help', 
      icon: QuestionMarkCircleIcon,
      description: 'База знаний и FAQ'
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const userNavigation = [
    { name: 'Профиль', href: '/dashboard/profile', onClick: () => {} },
    { name: 'Настройки', href: '/dashboard/settings', onClick: () => {} },
    { name: 'Выйти', href: '/login', onClick: handleLogout },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-concrete-50 to-steel-50">
      {/* Мобильная шторка */}
      <div 
        className={`fixed inset-0 z-50 flex md:hidden ${sidebarOpen ? 'visible' : 'invisible'}`}
        aria-hidden="true"
      >
        <div 
          className={`fixed inset-0 bg-steel-900 bg-opacity-75 transition-opacity duration-300 ease-linear ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setSidebarOpen(false)}
        />
        
        <div className={`relative flex w-full max-w-xs flex-1 flex-col bg-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Закрыть меню</span>
              <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
          
          {/* Логотип */}
          <div className="flex h-20 shrink-0 items-center px-6 bg-gradient-to-r from-construction-600 to-construction-500">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <div className="ml-3">
                <h1 className="text-white font-bold text-lg">ProHelper</h1>
                <p className="text-construction-100 text-xs">Личный кабинет</p>
              </div>
            </div>
          </div>
          
          {/* Навигация */}
          <div className="mt-6 flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 space-y-2 px-4">
              {mainNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-construction-500 to-construction-600 text-white shadow-construction'
                      : 'text-steel-700 hover:bg-construction-50 hover:text-construction-700'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${
                    isActive(item.href)
                      ? 'text-white'
                      : 'text-steel-500 group-hover:text-construction-600'
                  }`} aria-hidden="true" />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-medium">{item.name}</span>
                      {(item as any).badge && (
                        <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                          {(item as any).badge}
                        </span>
                      )}
                    </div>
                    <div className={`text-xs ${
                      isActive(item.href) 
                        ? 'text-construction-100' 
                        : 'text-steel-500 group-hover:text-construction-600'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              ))}
            </nav>
            
            {/* Раздел поддержки */}
            <div className="border-t border-steel-200 mt-6 pt-6">
              <nav className="space-y-2 px-4">
                {supportNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-safety-500 to-safety-600 text-white shadow-safety'
                        : 'text-steel-700 hover:bg-safety-50 hover:text-safety-700'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${
                      isActive(item.href)
                        ? 'text-white'
                        : 'text-steel-500 group-hover:text-safety-600'
                    }`} aria-hidden="true" />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className={`text-xs ${
                        isActive(item.href) 
                          ? 'text-safety-100' 
                          : 'text-steel-500 group-hover:text-safety-600'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
          
          {/* Выход */}
          <div className="border-t border-steel-200 p-4">
            <button
              onClick={handleLogout}
              className="group flex w-full items-center px-4 py-3 text-sm font-medium rounded-xl text-steel-700 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
            >
              <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5 text-steel-500 group-hover:text-red-600" aria-hidden="true" />
              <div className="flex-1 text-left">
                <div className="font-medium">Выйти</div>
                <div className="text-xs text-steel-500 group-hover:text-red-600">Завершить сеанс</div>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Статический сайдбар для десктопа */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-80 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-steel-200 shadow-xl">
          <div className="flex flex-1 flex-col overflow-y-auto">
            {/* Логотип */}
            <div className="flex items-center px-6 py-6 bg-gradient-to-r from-construction-600 to-construction-500">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">P</span>
              </div>
              <div className="ml-3">
                <h1 className="text-white font-bold text-xl">ProHelper</h1>
                <p className="text-construction-100 text-sm">Личный кабинет</p>
              </div>
            </div>
            
            {/* Навигация */}
            <nav className="mt-8 flex-1 space-y-2 px-4">
              {mainNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-construction-500 to-construction-600 text-white shadow-construction'
                      : 'text-steel-700 hover:bg-construction-50 hover:text-construction-700'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${
                    isActive(item.href)
                      ? 'text-white'
                      : 'text-steel-500 group-hover:text-construction-600'
                  }`} aria-hidden="true" />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-medium">{item.name}</span>
                      {(item as any).badge && (
                        <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                          {(item as any).badge}
                        </span>
                      )}
                    </div>
                    <div className={`text-xs ${
                      isActive(item.href) 
                        ? 'text-construction-100' 
                        : 'text-steel-500 group-hover:text-construction-600'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              ))}
            </nav>
            
            {/* Раздел поддержки */}
            <div className="border-t border-steel-200 mt-6 pt-6">
              <nav className="space-y-2 px-4">
                {supportNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-safety-500 to-safety-600 text-white shadow-safety'
                        : 'text-steel-700 hover:bg-safety-50 hover:text-safety-700'
                    }`}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${
                      isActive(item.href)
                        ? 'text-white'
                        : 'text-steel-500 group-hover:text-safety-600'
                    }`} aria-hidden="true" />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className={`text-xs ${
                        isActive(item.href) 
                          ? 'text-safety-100' 
                          : 'text-steel-500 group-hover:text-safety-600'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
          
          {/* Выход */}
          <div className="border-t border-steel-200 p-4">
            <button
              onClick={handleLogout}
              className="group flex w-full items-center px-4 py-3 text-sm font-medium rounded-xl text-steel-700 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
            >
              <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5 text-steel-500 group-hover:text-red-600" aria-hidden="true" />
              <div className="flex-1 text-left">
                <div className="font-medium">Выйти</div>
                <div className="text-xs text-steel-500 group-hover:text-red-600">Завершить сеанс</div>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Контент */}
      <div className="flex flex-1 flex-col md:pl-80">
        {/* Топ-бар */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-steel-200 shadow-sm">
          <div className="flex h-20 items-center justify-between px-4 md:px-8">
            <div className="flex items-center">
              <button
                type="button"
                className="md:hidden inline-flex h-12 w-12 items-center justify-center rounded-xl text-steel-500 hover:text-construction-600 hover:bg-construction-50 focus:outline-none transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Открыть меню</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>
              
              {/* Хлебные крошки */}
              <div className="hidden md:flex items-center space-x-2 text-sm">
                <BuildingOfficeIcon className="h-5 w-5 text-construction-500" />
                <span className="text-steel-900 font-medium">Личный кабинет</span>
                <span className="text-steel-400">/</span>
                <span className="text-steel-600">
                  {mainNavigation.find(item => isActive(item.href))?.name || 'Обзор'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Баланс */}
              <Link 
                to="/dashboard/billing" 
                className="hidden sm:flex items-center px-4 py-2 bg-gradient-to-r from-safety-500 to-safety-600 text-white rounded-xl hover:shadow-safety transition-all duration-200 hover:scale-105"
              >
                <WalletIcon className="h-5 w-5 mr-2" />
                <div className="text-sm">
                  <div className="font-medium">
                    {actualBalance ? actualBalance.balance_formatted : (balanceError ? 'Ошибка' : '...')}
                    {actualBalance && actualBalance.currency && <span className="ml-1">{actualBalance.currency}</span>}
                  </div>
                  <div className="text-xs text-safety-100">Баланс</div>
                </div>
              </Link>
              
              {/* Уведомления */}
              <button className="relative p-2 text-steel-500 hover:text-construction-600 hover:bg-construction-50 rounded-xl transition-colors">
                <BellIcon className="h-6 w-6" />
                {hasExpiring && (
                  <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
                )}
              </button>
              
              {/* Админ панель */}
              <a
                href="https://admin.prohelper.pro/"
                className="hidden lg:inline-flex items-center px-4 py-2 border border-steel-300 text-sm font-medium rounded-xl text-steel-700 bg-white hover:bg-steel-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-construction-500 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ShieldCheckIcon className="h-4 w-4 mr-2" />
                Админ панель
              </a>

              {/* Профиль */}
              <Menu as="div" className="relative">
                <div>
                  <Menu.Button className="relative flex items-center space-x-3 rounded-xl bg-white border border-steel-200 p-2 text-sm hover:bg-steel-50 focus:outline-none focus:ring-2 focus:ring-construction-500 focus:ring-offset-2 transition-colors">
                    <span className="sr-only">Открыть меню пользователя</span>
                    {user?.avatar_url ? (
                      <img
                        className="h-8 w-8 rounded-lg object-cover"
                        src={user.avatar_url}
                        alt="Аватар пользователя"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-construction-500 to-construction-600 flex items-center justify-center">
                        <UserCircleIcon className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div className="hidden md:block text-left">
                      <div className="font-medium text-steel-900">{user?.name || 'Пользователь'}</div>
                      <div className="text-xs text-steel-500">{user?.email}</div>
                    </div>
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-steel-200 ring-opacity-5 focus:outline-none">
                    <div className="py-2">
                      {userNavigation.map((item) => (
                        <Menu.Item key={item.name}>
                          {({ active }) => (
                            <Link
                              to={item.href}
                              onClick={item.onClick}
                              className={classNames(
                                active ? 'bg-steel-50 text-steel-900' : 'text-steel-700',
                                'block px-4 py-3 text-sm font-medium transition-colors'
                              )}
                            >
                              {item.name}
                            </Link>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>
        
        {/* Основной контент */}
        <main className="flex-1 relative">
          <div className="absolute inset-0 bg-construction-grid opacity-5"></div>
          <div className="relative z-10 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 