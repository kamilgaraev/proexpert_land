import React from 'react';
import PageLayout from '../../components/shared/PageLayout';
import { 
  BuildingStorefrontIcon,
  UserGroupIcon,
  BanknotesIcon,
  ChartBarIcon,
  ClockIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const SmallBusinessPage = () => {
  const benefits = [
    {
      icon: BanknotesIcon,
      title: 'Экономия до 40%',
      description: 'Сокращение затрат на управление проектами и координацию работ'
    },
    {
      icon: ClockIcon,
      title: 'Экономия времени',
      description: 'Автоматизация рутинных задач и упрощение документооборота'
    },
    {
      icon: ChartBarIcon,
      title: 'Контроль качества',
      description: 'Мониторинг выполнения работ и соблюдения стандартов'
    },
    {
      icon: UserGroupIcon,
      title: 'Управление командой',
      description: 'Координация работы всех участников проекта в одном месте'
    }
  ];

  const features = [
    {
      category: 'Управление проектами',
      items: [
        'Планирование и контроль сроков',
        'Распределение задач по исполнителям',
        'Отслеживание прогресса в реальном времени',
        'Уведомления о важных событиях'
      ]
    },
    {
      category: 'Финансовый контроль',
      items: [
        'Учет расходов и доходов по проектам',
        'Контроль бюджета в реальном времени',
        'Автоматические отчеты по финансам',
        'Интеграция с 1С и банковскими системами'
      ]
    },
    {
      category: 'Работа с клиентами',
      items: [
        'CRM для работы с заказчиками',
        'История всех взаимодействий',
        'Автоматические уведомления клиентам',
        'Портал клиента для отслеживания прогресса'
      ]
    },
    {
      category: 'Документооборот',
      items: [
        'Электронный архив документов',
        'Шаблоны договоров и актов',
        'Электронная подпись документов',
        'Автоматические отчеты для клиентов'
      ]
    }
  ];

  const cases = [
    {
      title: 'ООО "СтройДом"',
      description: 'Небольшая строительная компания, специализирующаяся на частном домостроении',
      problem: 'Проблемы с координацией работ, превышение бюджетов, недовольство клиентов',
      solution: 'Внедрение ProHelper для управления проектами и контроля финансов',
      result: 'Сокращение сроков строительства на 25%, экономия бюджета 30%, повышение удовлетворенности клиентов'
    },
    {
      title: 'ИП Сидоров',
      description: 'Индивидуальный предприниматель, выполняющий ремонтные работы',
      problem: 'Хаос в планировании, потеря документов, проблемы с отчетностью',
      solution: 'Использование мобильного приложения ProHelper для ведения проектов',
      result: 'Увеличение количества проектов на 40%, полная прозрачность для клиентов'
    },
    {
      title: 'ООО "РемСервис"',
      description: 'Компания по ремонту коммерческих помещений',
      problem: 'Сложности с координацией субподрядчиков, контролем качества',
      solution: 'Внедрение системы контроля качества и управления подрядчиками',
      result: 'Снижение количества претензий на 60%, увеличение повторных заказов'
    }
  ];

  return (
    <PageLayout 
      title="Решения для малого бизнеса" 
      subtitle="Эффективные инструменты для небольших строительных компаний"
    >
      <div className="mb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-concrete-100 text-center">
                <div className="w-16 h-16 bg-construction-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="w-8 h-8 text-construction-600" />
                </div>
                <h3 className="text-xl font-bold text-steel-900 mb-2">{benefit.title}</h3>
                <p className="text-steel-600">{benefit.description}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-construction-500 to-construction-600 rounded-lg flex items-center justify-center">
                <BuildingStorefrontIcon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-steel-900">Возможности системы</h2>
            </div>

            <div className="space-y-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-md border border-concrete-100">
                  <h3 className="text-lg font-semibold text-steel-900 mb-4">{feature.category}</h3>
                  <ul className="space-y-2">
                    {feature.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-construction-500 flex-shrink-0" />
                        <span className="text-steel-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-safety-500 to-safety-600 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-steel-900">Кейсы наших клиентов</h2>
            </div>

            <div className="space-y-6">
              {cases.map((caseItem, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-concrete-100">
                  <h3 className="text-lg font-bold text-steel-900 mb-2">{caseItem.title}</h3>
                  <p className="text-steel-600 text-sm mb-4">{caseItem.description}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-medium text-red-600 uppercase tracking-wide">Проблема:</span>
                      <p className="text-steel-600 text-sm mt-1">{caseItem.problem}</p>
                    </div>
                    
                    <div>
                      <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Решение:</span>
                      <p className="text-steel-600 text-sm mt-1">{caseItem.solution}</p>
                    </div>
                    
                    <div>
                      <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Результат:</span>
                      <p className="text-steel-600 text-sm mt-1">{caseItem.result}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-construction-600 to-safety-600 rounded-2xl p-8 text-white mb-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Начните с бесплатного тарифа</h3>
              <p className="text-lg opacity-90 mb-6">
                Специальное предложение для малого бизнеса - 30 дней бесплатного использования всех функций
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>До 3 проектов одновременно</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>До 10 пользователей</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>Мобильное приложение</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>Техническая поддержка</span>
                </li>
              </ul>
            </div>
            
            <div className="text-center">
              <div className="bg-white/20 rounded-xl p-6 backdrop-blur-sm mb-6">
                <div className="text-4xl font-bold mb-2">₽1,990</div>
                <div className="text-lg opacity-90">в месяц после бесплатного периода</div>
              </div>
              <button className="px-8 py-3 bg-white text-construction-600 font-semibold rounded-lg hover:shadow-lg transition-all w-full">
                Попробовать бесплатно
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-bold text-steel-900 mb-4">Нужна персональная консультация?</h3>
          <p className="text-lg text-steel-600 mb-8">
            Наши эксперты помогут настроить систему под ваш бизнес
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-construction-600 text-white font-semibold rounded-lg hover:bg-construction-700 transition-colors">
              Заказать демо
            </button>
            <button className="px-8 py-3 border-2 border-construction-600 text-construction-600 font-semibold rounded-lg hover:bg-construction-50 transition-colors">
              Связаться с экспертом
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SmallBusinessPage; 