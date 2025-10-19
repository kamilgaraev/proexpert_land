import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChartBarIcon,
  DocumentTextIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { SEOHead } from '@components/shared/SEOHead';
import { PageHeader } from '@components/holding/shared';
import { usePermissionsContext } from '@/contexts/PermissionsContext';
import { motion } from 'framer-motion';

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  route: string;
  permission: string;
  stats?: {
    label: string;
    value: string;
  }[];
}

const HoldingReportsIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const { can } = usePermissionsContext();

  const reports: ReportCard[] = [
    {
      id: 'projects',
      title: 'Отчет по проектам',
      description: 'Сводная информация по всем проектам холдинга с финансовыми показателями и статусами',
      icon: ChartBarIcon,
      route: '/reports/projects',
      permission: 'multi-organization.reports.view',
      stats: [
        { label: 'Общий бюджет', value: 'Анализ' },
        { label: 'Статусы проектов', value: 'Детализация' },
        { label: 'Топ проекты', value: 'Рейтинг' },
      ]
    },
    {
      id: 'contracts',
      title: 'Отчет по контрактам',
      description: 'Детальная информация по контрактам с подрядчиками, оплатам и исполнению обязательств',
      icon: DocumentTextIcon,
      route: '/reports/contracts',
      permission: 'multi-organization.reports.financial',
      stats: [
        { label: 'Суммы контрактов', value: 'Финансы' },
        { label: 'Подрядчики', value: 'Список' },
        { label: 'Оплаты', value: 'Контроль' },
      ]
    },
  ];

  const availableReports = reports.filter(report => can(report.permission));

  if (availableReports.length === 0) {
    return (
      <div className="min-h-screen bg-steel-50">
        <SEOHead 
          title="Отчеты холдинга - ProHelper"
          description="Отчеты холдинга ProHelper"
        />
        <PageHeader 
          title="Отчеты холдинга"
          subtitle="Аналитика и отчетность"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="bg-steel-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <ChartBarIcon className="h-12 w-12 text-steel-600" />
            </div>
            <h3 className="text-xl font-bold text-steel-900 mb-2">Доступ ограничен</h3>
            <p className="text-steel-600">У вас нет прав для просмотра отчетов холдинга</p>
          </div>
        </div>
      </div>
    );
  }

  const handleNavigate = (route: string) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-steel-50">
      <SEOHead 
        title="Отчеты холдинга - ProHelper"
        description="Отчеты холдинга ProHelper"
      />
      <PageHeader 
        title="Отчеты холдинга"
        subtitle="Выберите тип отчета для просмотра детальной аналитики"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableReports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="group"
            >
              <div 
                onClick={() => handleNavigate(report.route)}
                className="bg-white rounded-2xl shadow-lg border border-steel-200 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden h-full"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-steel-700 rounded-xl p-3 group-hover:bg-steel-800 transition-colors">
                      <report.icon className="w-8 h-8 text-white" />
                    </div>
                    <ArrowRightIcon className="w-5 h-5 text-steel-400 group-hover:text-steel-700 group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-steel-900 mb-2 group-hover:text-steel-800">
                    {report.title}
                  </h3>
                  
                  <p className="text-steel-600 text-sm mb-4 line-clamp-2">
                    {report.description}
                  </p>

                  {report.stats && (
                    <div className="space-y-2 pt-4 border-t border-steel-100">
                      {report.stats.map((stat, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-steel-600">{stat.label}</span>
                          <span className="text-steel-900 font-medium">{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-steel-50 px-6 py-3 border-t border-steel-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-steel-600">Открыть отчет</span>
                    <div className="flex items-center gap-1 text-steel-700 font-medium group-hover:gap-2 transition-all">
                      Перейти
                      <ArrowRightIcon className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-2xl shadow-lg border border-steel-200 p-6">
          <div className="flex items-start gap-4">
            <div className="bg-steel-100 rounded-lg p-3">
              <ChartBarIcon className="w-6 h-6 text-steel-700" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-steel-900 mb-2">О системе отчетов</h4>
              <p className="text-steel-600 text-sm mb-3">
                Система отчетов холдинга предоставляет детальную аналитику по проектам и контрактам 
                всех дочерних организаций. Вы можете фильтровать данные, экспортировать отчеты 
                в Excel или CSV для дальнейшего анализа.
              </p>
              <ul className="space-y-2 text-sm text-steel-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-steel-400"></div>
                  Консолидированные показатели по всем организациям
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-steel-400"></div>
                  Гибкая фильтрация по датам, статусам и суммам
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-steel-400"></div>
                  Экспорт данных в различных форматах
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoldingReportsIndexPage;

