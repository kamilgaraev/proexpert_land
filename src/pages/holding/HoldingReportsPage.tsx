import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { 
  ChartBarIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  HomeIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  SwatchIcon
} from '@heroicons/react/24/outline';
import { useTheme, type ThemeColor } from '@components/shared/ThemeProvider';
import { SEOHead } from '@components/shared/SEOHead';
import HoldingReportsDashboard from '@/components/holding/HoldingReportsDashboard';
import OrganizationsComparison from '@/components/holding/OrganizationsComparison';
import FinancialReport from '@/components/holding/FinancialReport';
import KpiReport from '@/components/holding/KpiReport';
import { usePermissionsContext } from '@/contexts/PermissionsContext';

const HoldingReportsPage: React.FC = () => {
  const { holdingId } = useParams<{ holdingId: string }>();
  const navigate = useNavigate();
  const { can } = usePermissionsContext();
  const { color, setColor, getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const navigation = [
    { name: 'Дашборд', href: '/dashboard', icon: HomeIcon, current: false },
    { name: 'Организации', href: '/organizations', icon: BuildingOfficeIcon, current: false },
    { name: 'Отчеты', href: `/reports/${holdingId}`, icon: ChartBarIcon, current: true },
    { name: 'Настройки', href: '/settings', icon: CogIcon, current: false },
  ];

  const colorOptions: { value: ThemeColor; name: string; preview: string }[] = [
    { value: 'blue', name: 'Синий', preview: 'bg-blue-500' },
    { value: 'green', name: 'Зеленый', preview: 'bg-green-500' },
    { value: 'purple', name: 'Фиолетовый', preview: 'bg-purple-500' },
    { value: 'pink', name: 'Розовый', preview: 'bg-pink-500' },
    { value: 'indigo', name: 'Индиго', preview: 'bg-indigo-500' },
    { value: 'orange', name: 'Оранжевый', preview: 'bg-orange-500' }
  ];

  useEffect(() => {
    if (!holdingId || isNaN(Number(holdingId))) {
      navigate('/');
      return;
    }

    if (!can('multi-organization.reports.view')) {
      navigate('/');
      return;
    }
  }, [holdingId, navigate, can]);

  const holdingIdNumber = Number(holdingId);

  const tabs = [
    {
      name: 'Дашборд',
      icon: ChartBarIcon,
      component: <HoldingReportsDashboard holdingId={holdingIdNumber} />,
      permission: 'multi-organization.reports.dashboard'
    },
    {
      name: 'Сравнение организаций',
      icon: BuildingOfficeIcon,
      component: <OrganizationsComparison holdingId={holdingIdNumber} />,
      permission: 'multi-organization.reports.comparison'
    },
    {
      name: 'Финансовый отчет',
      icon: CurrencyDollarIcon,
      component: <FinancialReport holdingId={holdingIdNumber} />,
      permission: 'multi-organization.reports.financial'
    },
    {
      name: 'KPI метрики',
      icon: ClipboardDocumentListIcon,
      component: <KpiReport holdingId={holdingIdNumber} />,
      permission: 'multi-organization.reports.kpi'
    }
  ];

  const availableTabs = tabs.filter(tab => can(tab.permission));

  if (availableTabs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <ChartBarIcon className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Нет доступа</h1>
          <p className="text-gray-600 mb-4">У вас нет прав для просмотра отчетов холдинга</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  const renderSidebar = () => (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className={`flex flex-col flex-grow bg-white ${theme.border} border-r overflow-y-auto`}>
        <div className="flex items-center flex-shrink-0 px-6 py-4">
          <div className={`${theme.primary} p-2 rounded-xl shadow-lg`}>
            <BuildingOfficeIcon className="h-8 w-8 text-white" />
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-bold text-gray-900">Холдинг</h1>
            <p className="text-sm text-gray-600">Отчеты</p>
          </div>
        </div>
        <nav className="mt-2 flex-1 space-y-1 px-3">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                item.current
                  ? `${theme.primary} text-white`
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  item.current ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className={`w-full ${theme.secondary} ${theme.text} hover:bg-opacity-80 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm`}
            >
              <SwatchIcon className="h-4 w-4" />
              <span>Цветовая тема</span>
            </button>
            
            {showColorPicker && (
              <div className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Выберите цвет</h3>
                <div className="grid grid-cols-3 gap-2">
                  {colorOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setColor(option.value);
                        setShowColorPicker(false);
                      }}
                      className={`p-2 rounded-lg border-2 transition-all hover:scale-105 ${
                        color === option.value 
                          ? 'border-gray-900 bg-gray-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 ${option.preview} rounded-full mx-auto mb-1`}></div>
                      <span className="text-xs font-medium text-gray-700">{option.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMobileMenu = () => (
    <div className={`lg:hidden ${mobileMenuOpen ? 'fixed inset-0 z-50' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setMobileMenuOpen(false)} />
      
      <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center">
            <div className={`${theme.primary} p-2 rounded-xl shadow-lg`}>
              <BuildingOfficeIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-bold text-gray-900">Холдинг</h1>
              <p className="text-sm text-gray-600">Отчеты</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                item.current
                  ? `${theme.primary} text-white`
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  item.current ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="Отчетность холдинга - ProHelper"
        description="Комплексная система отчетности для холдинговых структур. Дашборды, KPI метрики, финансовые отчеты и сравнение организаций."
        keywords="отчетность холдинга, дашборд, KPI, финансовые отчеты, аналитика"
      />

      {renderSidebar()}
      {renderMobileMenu()}

      <div className="lg:pl-64">
        <div className="sticky top-0 z-40">
          <div className="flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            <div className="h-6 w-px bg-gray-200 lg:hidden" />

            <div className="flex flex-1 items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold leading-6 text-gray-900">Отчетность холдинга</h1>
                <p className="text-sm text-gray-600">Комплексная аналитика и отчетность</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border-b">
          <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
            <Tab.List className="flex space-x-8 px-4 sm:px-6 lg:px-8">
              {availableTabs.map((tab) => (
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    `py-4 px-1 border-b-2 font-medium text-sm focus:outline-none transition-colors ${
                      selected
                        ? `border-primary-500 text-primary-600`
                        : `border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`
                    }`
                  }
                >
                  <div className="flex items-center space-x-2">
                    <tab.icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </div>
                </Tab>
              ))}
            </Tab.List>

            <Tab.Panels>
              {availableTabs.map((tab) => (
                <Tab.Panel key={tab.name} className="focus:outline-none">
                  {tab.component}
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  );
};

export default HoldingReportsPage;
