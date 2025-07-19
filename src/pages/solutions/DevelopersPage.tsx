import PageLayout from '../../components/shared/PageLayout';
import { 
  BuildingOffice2Icon,
  ChartBarIcon,
  BanknotesIcon,
  UsersIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  BuildingStorefrontIcon,
  CogIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const DevelopersPage = () => {
  const features = [
    {
      icon: ChartBarIcon,
      title: 'Управление портфелем проектов',
      description: 'Централизованный контроль всех строительных проектов девелоперской компании с детальной аналитикой.'
    },
    {
      icon: BanknotesIcon,
      title: 'Финансовое планирование',
      description: 'Планирование инвестиций, контроль бюджетов по проектам, анализ ROI и прогнозирование доходности.'
    },
    {
      icon: UsersIcon,
      title: 'Координация подрядчиков',
      description: 'Управление множественными подрядчиками, контроль качества работ и соблюдения сроков.'
    },
    {
      icon: BuildingStorefrontIcon,
      title: 'Контроль продаж',
      description: 'Интеграция с отделом продаж, отслеживание готовности объектов для реализации.'
    },
    {
      icon: CogIcon,
      title: 'Автоматизация процессов',
      description: 'Автоматические уведомления, отчеты для инвесторов, интеграция с внешними системами.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Соответствие стандартам',
      description: 'Контроль соблюдения строительных норм, экологических стандартов и требований безопасности.'
    }
  ];

  const benefits = [
    'Сокращение времени на управление проектами до 50%',
    'Повышение прозрачности для инвесторов',
    'Контроль качества на всех этапах строительства',
    'Оптимизация работы с подрядчиками',
    'Снижение рисков срыва сроков проектов',
    'Улучшение финансового планирования'
  ];

  const caseStudies = [
    {
      company: 'ГК "Эталон"',
      project: 'ЖК "Эталон-Сити"',
      result: 'Сокращение времени координации подрядчиков на 40%',
      description: 'Автоматизация процессов контроля качества и управления 15+ подрядчиками в рамках крупного жилого комплекса.'
    },
    {
      company: 'ПИК',
      project: 'Комплексная застройка в Мытищах',
      result: 'Повышение прозрачности проекта для инвесторов',
      description: 'Внедрение системы real-time отчетности по всем этапам строительства многоэтажного комплекса.'
    }
  ];

  const integrations = [
    'SAP для управления финансами',
    'AutoCAD для работы с проектной документацией', 
    '1С для ведения бухгалтерского учета',
    'Salesforce для управления продажами',
    'MS Project для планирования проектов',
    'Slack/Teams для коммуникации команды'
  ];

  return (
    <PageLayout
      title="ProHelper для девелоперов"
      subtitle="Комплексное управление портфелем строительных проектов"
      seoPage="developers"
    >
      <div className="bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Benefits */}
        <section className="py-16">
          <div className="container-custom">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-construction-600 mb-2">100+</div>
                <p className="text-slate-600">Девелоперских проектов</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-construction-600 mb-2">40%</div>
                <p className="text-slate-600">Сокращение времени управления</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-construction-600 mb-2">15+</div>
                <p className="text-slate-600">Подрядчиков на проект</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 bg-white">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Возможности для девелоперов
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                ProHelper адаптирован под специфику девелоперского бизнеса: от планирования до сдачи объектов
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-slate-50 rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-construction-500 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits List */}
        <section className="py-24 bg-gradient-to-r from-construction-600 to-safety-600 text-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-center mb-12">
                Преимущества для девелоперского бизнеса
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircleIcon className="w-6 h-6 text-construction-200 mr-4 mt-1 flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Case Studies */}
        <section className="py-24 bg-slate-50">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Кейсы наших клиентов
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Истории успеха девелоперских компаний, использующих ProHelper
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {caseStudies.map((study, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-sm">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-construction-500 rounded-xl flex items-center justify-center mr-4">
                      <BuildingOffice2Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">{study.company}</h3>
                      <p className="text-slate-600">{study.project}</p>
                    </div>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
                    <p className="text-emerald-800 font-semibold">{study.result}</p>
                  </div>
                  <p className="text-slate-600">{study.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Integrations */}
        <section className="py-24 bg-white">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Интеграция с корпоративными системами
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                ProHelper легко интегрируется с существующими системами девелоперской компании
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations.map((integration, index) => (
                <div key={index} className="flex items-center p-4 bg-slate-50 rounded-xl">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500 mr-3" />
                  <span className="text-slate-700">{integration}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-slate-900 text-white">
          <div className="container-custom text-center">
            <h2 className="text-4xl font-bold mb-6">
              Готовы оптимизировать управление проектами?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Получите персональную демонстрацию ProHelper для девелоперской компании
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/demo?type=developer" 
                className="btn-primary inline-flex items-center justify-center px-8 py-4 text-lg"
              >
                Заказать демо
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </a>
              <a 
                href="/contact?type=developer" 
                className="btn-secondary inline-flex items-center justify-center px-8 py-4 text-lg border-slate-600 text-slate-300 hover:border-slate-500"
              >
                Обсудить проект
              </a>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default DevelopersPage; 