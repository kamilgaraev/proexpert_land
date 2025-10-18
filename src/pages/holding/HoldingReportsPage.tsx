import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { 
  ChartBarIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { SEOHead } from '@components/shared/SEOHead';
import { PageHeader, LoadingSpinner } from '@components/holding/shared';
import HoldingReportsDashboard from '@/components/holding/HoldingReportsDashboard';
import OrganizationsComparison from '@/components/holding/OrganizationsComparison';
import FinancialReport from '@/components/holding/FinancialReport';
import KpiReport from '@/components/holding/KpiReport';
import { usePermissionsContext } from '@/contexts/PermissionsContext';

const HoldingReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { can } = usePermissionsContext();
  
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!can('multi-organization.reports.view')) {
      navigate('/');
      return;
    }
  }, [navigate, can]);

  const tabs = [
    {
      name: 'Дашборд',
      icon: ChartBarIcon,
      component: <HoldingReportsDashboard />,
      permission: 'multi-organization.reports.dashboard'
    },
    {
      name: 'Сравнение организаций',
      icon: BuildingOfficeIcon,
      component: <OrganizationsComparison />,
      permission: 'multi-organization.reports.comparison'
    },
    {
      name: 'Финансовый отчет',
      icon: CurrencyDollarIcon,
      component: <FinancialReport />,
      permission: 'multi-organization.reports.financial'
    },
    {
      name: 'KPI метрики',
      icon: ClipboardDocumentListIcon,
      component: <KpiReport />,
      permission: 'multi-organization.reports.kpi'
    }
  ];

  const availableTabs = tabs.filter(tab => can(tab.permission));

  if (availableTabs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="bg-amber-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <ChartBarIcon className="h-12 w-12 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Доступ ограничен</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            У вас нет прав для просмотра отчетов холдинга. Обратитесь к администратору для получения необходимых разрешений.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-orange-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Перейти к дашборду
            </button>
            <button
              onClick={() => navigate('/organizations')}
              className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Управление организациями
            </button>
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-800">
              <strong>Необходимые права:</strong> просмотр отчетов мультиорганизации
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SEOHead 
        title="Отчетность холдинга - ProHelper"
        description="Комплексная система отчетности для холдинговых структур. Дашборды, KPI метрики, финансовые отчеты и сравнение организаций."
        keywords="отчетность холдинга, дашборд, KPI, финансовые отчеты, аналитика"
      />

      <PageHeader
        title="Отчетность холдинга"
        subtitle="Комплексная аналитика и отчетность"
        icon={<ChartBarIcon className="w-8 h-8" />}
      />

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <Tab.List className="flex border-b border-gray-200 bg-gradient-to-r from-orange-50 to-blue-50">
            {availableTabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  `flex-1 py-4 px-6 font-medium text-sm focus:outline-none transition-all ${
                    selected
                      ? 'text-orange-600 border-b-2 border-orange-600 bg-white'
                      : 'text-gray-600 hover:text-orange-600 hover:bg-white/50'
                  }`
                }
              >
                <div className="flex items-center justify-center gap-2">
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
  );
};

export default HoldingReportsPage;
