import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { 
  ChartBarIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
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
  
  const [selectedIndex, setSelectedIndex] = useState(0);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="Отчетность холдинга - ProHelper"
        description="Комплексная система отчетности для холдинговых структур. Дашборды, KPI метрики, финансовые отчеты и сравнение организаций."
        keywords="отчетность холдинга, дашборд, KPI, финансовые отчеты, аналитика"
      />

      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Отчетность холдинга</h1>
                <p className="text-gray-600 mt-1">Комплексная аналитика и отчетность</p>
              </div>
              
              <button
                onClick={() => navigate(-1)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Назад
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <div className="bg-white border-b">
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
          </div>

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
