import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { 
  ChartBarIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { SEOHead } from '@components/shared/SEOHead';
import { PageHeader } from '@components/holding/shared';
import HoldingReportsDashboard from '@/components/holding/HoldingReportsDashboard';
import FinancialReport from '@/components/holding/FinancialReport';
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
  }, [can]);

  const tabs = [
    {
      name: 'Отчет по проектам',
      icon: ChartBarIcon,
      component: <HoldingReportsDashboard />,
      permission: 'multi-organization.reports.view'
    },
    {
      name: 'Отчет по контрактам',
      icon: CurrencyDollarIcon,
      component: <FinancialReport />,
      permission: 'multi-organization.reports.financial'
    }
  ];

  const availableTabs = tabs.filter(tab => can(tab.permission));

  if (availableTabs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SEOHead 
          title="Отчеты холдинга - ProHelper"
          description="Отчеты холдинга ProHelper"
        />
        <PageHeader 
          title="Отчеты холдинга"
          subtitle="Аналитика и отчетность по холдингу"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="bg-amber-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <ChartBarIcon className="h-12 w-12 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Доступ ограничен</h3>
            <p className="text-gray-600">У вас нет прав для просмотра отчетов холдинга</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="Отчеты холдинга - ProHelper"
        description="Отчеты холдинга ProHelper"
      />
      <PageHeader 
        title="Отчеты холдинга"
        subtitle="Аналитика и отчетность по холдингу"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <Tab.List className="flex space-x-1 rounded-xl bg-white p-1 mb-8 shadow-sm border border-gray-200">
            {availableTabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  `w-full rounded-lg py-3 px-4 text-sm font-semibold leading-5 transition-all
                  focus:outline-none focus:ring-2 ring-offset-2 ring-offset-slate-400 ring-white ring-opacity-60
                  ${
                    selected
                      ? 'bg-gradient-to-r from-orange-500 to-blue-600 text-white shadow'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <div className="flex items-center justify-center gap-2">
                  <tab.icon className="w-5 h-5" />
                  {tab.name}
                </div>
              </Tab>
            ))}
          </Tab.List>
          
          <Tab.Panels>
            {availableTabs.map((tab, idx) => (
              <Tab.Panel
                key={idx}
                className="rounded-xl bg-white shadow-sm border border-gray-200"
              >
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
