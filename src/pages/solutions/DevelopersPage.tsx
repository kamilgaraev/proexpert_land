import PageLayout from '../../components/shared/PageLayout';
import {
  ArrowRightIcon,
  BanknotesIcon,
  BuildingOffice2Icon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  CheckCircleIcon,
  CogIcon,
  ShieldCheckIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: ChartBarIcon,
    title: 'Управление портфелем проектов',
    description: 'Централизованный контроль строительных проектов девелопера с прозрачной управленческой картиной.',
  },
  {
    icon: BanknotesIcon,
    title: 'Финансовое планирование',
    description: 'Планирование бюджетов, контроль инвестиций и рабочая отчетность по проектам.',
  },
  {
    icon: UsersIcon,
    title: 'Координация подрядчиков',
    description: 'Контроль задач, сроков и статусов по внешним командам и внутреннему офису.',
  },
  {
    icon: BuildingStorefrontIcon,
    title: 'Контроль готовности к продаже',
    description: 'Единый контур по этапам проекта, документам и фактическому прогрессу объекта.',
  },
  {
    icon: CogIcon,
    title: 'Автоматизация процессов',
    description: 'Регламентные уведомления, маршрут согласования и проектные расширения по фактическому запросу.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Корпоративный контроль',
    description: 'Разделение доступа, прозрачность действий и управляемый запуск по корпоративным правилам.',
  },
];

const benefits = [
  'Сокращение времени на управление проектами и согласования.',
  'Повышение прозрачности для руководства и инвесторов.',
  'Контроль подрядчиков, документов и сроков в одном контуре.',
  'Снижение ручной нагрузки на офис и проектные команды.',
  'Более понятная картина по бюджету и ходу работ.',
  'Поэтапное внедрение без перегруза всей структуры сразу.',
];

const caseStudies = [
  {
    company: 'Девелоперский контур',
    project: 'Пилотный запуск на ключевом объекте',
    result: 'Сначала собираем базовый рабочий сценарий, затем расширяем систему на соседние процессы.',
    description: 'Такой подход помогает не тащить в запуск лишние роли и интеграции, а быстро довести до результата приоритетный участок работы.',
  },
  {
    company: 'Корпоративная команда',
    project: 'Управленческий и проектный слои',
    result: 'Руководство получает более прозрачную картину по объектам, срокам, документам и финансовому контуру.',
    description: 'После стабилизации базового процесса можно подключать дополнительные роли, аналитику и проектные расширения.',
  },
];

const integrations = [
  'Выгрузки в Excel/CSV для финансового и операционного контура.',
  'Обмен данными через API и webhooks по согласованному сценарию.',
  'Подключение соседних корпоративных сервисов при реальном бизнес-запросе.',
  'Обмен документами и отчетами без публичного каталога несуществующих коннекторов.',
  'Пилотные расширения под внутренний контур девелопера.',
  'Оценка релевантного обмена до старта внедрения.',
];

const DevelopersPage = () => {
  return (
    <PageLayout
      title="ProHelper для девелоперов"
      subtitle="Комплексное управление портфелем строительных проектов"
      seoPage="developers"
      showFooter={false}
    >
      <div className="bg-gradient-to-b from-slate-50 to-white">
        <section className="py-16">
          <div className="container-custom">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-construction-600 mb-2">Портфель</div>
                <p className="text-slate-600">Единая картина по объектам и стадиям работ</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-construction-600 mb-2">Контроль</div>
                <p className="text-slate-600">Роли, сроки, документы и бюджет в одном контуре</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-construction-600 mb-2">Поэтапно</div>
                <p className="text-slate-600">Запуск от приоритетного сценария к масштабированию</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-white">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Возможности для девелопера
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                ProHelper помогает собрать рабочий контур между руководством, офисом, объектом и подрядчиками.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div key={feature.title} className="bg-slate-50 rounded-2xl p-6 hover:shadow-md transition-shadow">
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

        <section className="py-24 bg-gradient-to-r from-construction-600 to-safety-600 text-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-center mb-12">
                Что получает девелоперская команда
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start">
                    <CheckCircleIcon className="w-6 h-6 text-construction-200 mr-4 mt-1 flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-slate-50">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Формат внедрения
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Не обещаем мгновенную магию: сначала разбираем реальный процесс и показываем релевантный маршрут запуска.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {caseStudies.map((study) => (
                <div key={study.project} className="bg-white rounded-2xl p-8 shadow-sm">
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

        <section className="py-24 bg-white">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Интеграции и внешние связи
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Для девелоперского контура обсуждаем только те внешние связи, которые нужны по фактическому сценарию команды.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations.map((integration) => (
                <div key={integration} className="flex items-center p-4 bg-slate-50 rounded-xl">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500 mr-3" />
                  <span className="text-slate-700">{integration}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-slate-900 text-white">
          <div className="container-custom text-center">
            <h2 className="text-4xl font-bold mb-6">
              Готовы оптимизировать управление проектами?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Получите персональную демонстрацию ProHelper для девелоперской компании.
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
