import PageLayout from '../../components/shared/PageLayout';
import { 
  UserGroupIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const PartnersPage = () => {
  const partnerTypes = [
    {
      title: 'Реселлеры',
      description: 'Продавайте ProHelper под собственным брендом',
      icon: UserGroupIcon,
      benefits: [
        'Комиссия до 30% с продаж',
        'Эксклюзивные территории',
        'Маркетинговая поддержка',
        'Техническое обучение'
      ],
      requirements: 'Опыт в B2B продажах, клиентская база в строительстве',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Системные интеграторы',
      description: 'Внедряйте ProHelper в рамках комплексных проектов',
      icon: CogIcon,
      benefits: [
        'Комиссия 20% за внедрение',
        'Техническая сертификация',
        'Приоритетная поддержка',
        'Совместные тендеры'
      ],
      requirements: 'Опыт внедрения корпоративных систем, сертифицированные специалисты',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Консультанты',
      description: 'Рекомендуйте ProHelper в рамках консалтинговых услуг',
      icon: AcademicCapIcon,
      benefits: [
        'Комиссия 15% за привлечение',
        'Статус сертифицированного консультанта',
        'Доступ к внутренним материалам',
        'Совместные вебинары'
      ],
      requirements: 'Консультационный опыт в строительстве, портфолио клиентов',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const currentPartners = [
    {
      name: 'ТехноСтрой Консалтинг',
      type: 'Системный интегратор',
      region: 'Москва и МО',
      projects: '45+ внедрений',
      description: 'Специализируется на автоматизации крупных строительных компаний'
    },
    {
      name: 'СтройАвтоматизация',
      type: 'Реселлер',
      region: 'Санкт-Петербург',
      projects: '120+ клиентов',
      description: 'Ведущий поставщик IT-решений для строительной отрасли СЗФО'
    },
    {
      name: 'БизнесПроцессы+',
      type: 'Консультант',
      region: 'Екатеринбург',
      projects: '30+ проектов',
      description: 'Консалтинг по оптимизации бизнес-процессов в строительстве'
    }
  ];

  const partnerProgram = {
    benefits: [
      'Доступ к демо-среде и обучающим материалам',
      'Персональный менеджер по работе с партнерами',
      'Совместные маркетинговые активности',
      'Техническая поддержка при внедрении',
      'Участие в партнерских мероприятиях',
      'Бонусы за перевыполнение планов'
    ],
    requirements: [
      'Юридическое лицо в РФ',
      'Опыт работы в IT или строительной сфере от 2 лет',
      'Наличие клиентской базы или экспертизы',
      'Готовность к долгосрочному сотрудничеству'
    ]
  };

  const steps = [
    {
      number: '01',
      title: 'Заявка',
      description: 'Заполните форму партнера и расскажите о вашей компании'
    },
    {
      number: '02',
      title: 'Интервью',
      description: 'Обсуждаем возможности сотрудничества и ваши цели'
    },
    {
      number: '03',
      title: 'Обучение',
      description: 'Проходите сертификацию и изучаете продукт'
    },
    {
      number: '04',
      title: 'Старт продаж',
      description: 'Начинаете работу с поддержкой нашей команды'
    }
  ];

  return (
    <PageLayout
      title="Партнерская программа ProHelper"
      subtitle="Развивайте бизнес вместе с нами"
      seoPage="partners"
    >
      <div className="bg-gradient-to-b from-slate-50 to-white">
        {/* Partnership Types */}
        <section className="py-24 bg-white">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Типы партнерства
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Выберите модель сотрудничества, которая лучше всего подходит вашему бизнесу
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {partnerTypes.map((type, index) => (
                <div key={index} className="bg-slate-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                  <div className={`w-16 h-16 bg-gradient-to-r ${type.color} rounded-2xl flex items-center justify-center mb-6`}>
                    <type.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{type.title}</h3>
                  <p className="text-slate-600 mb-6">{type.description}</p>
                  
                  <div className="mb-6">
                    <h4 className="font-semibold text-slate-900 mb-3">Преимущества:</h4>
                    <ul className="space-y-2">
                      {type.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start text-sm text-slate-600">
                          <CheckCircleIcon className="w-4 h-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
                    <h4 className="font-semibold text-slate-900 mb-2">Требования:</h4>
                    <p className="text-sm text-slate-600">{type.requirements}</p>
                  </div>
                  
                  <a 
                    href="/contact?type=partner"
                    className="w-full btn-primary text-center"
                  >
                    Стать партнером
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Current Partners */}
        <section className="py-24 bg-slate-50">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Наши партнеры
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Компании, которые уже развивают свой бизнес вместе с ProHelper
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentPartners.map((partner, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-construction-500 rounded-xl flex items-center justify-center mr-4">
                      <BuildingOfficeIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{partner.name}</h3>
                      <p className="text-sm text-construction-600">{partner.type}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Регион:</span>
                      <span className="text-slate-900">{partner.region}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Проекты:</span>
                      <span className="text-slate-900">{partner.projects}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-600">{partner.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits & Requirements */}
        <section className="py-24 bg-white">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">
                  Преимущества партнерства
                </h2>
                <div className="space-y-4">
                  {partnerProgram.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-emerald-500 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-slate-600">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">
                  Требования к партнерам
                </h2>
                <div className="space-y-4">
                  {partnerProgram.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-start">
                      <ShieldCheckIcon className="w-5 h-5 text-construction-500 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-slate-600">{requirement}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="py-24 bg-gradient-to-r from-construction-600 to-safety-600 text-white">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">
                Как стать партнером
              </h2>
              <p className="text-xl text-construction-100 max-w-3xl mx-auto">
                Простой процесс подключения к партнерской программе
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">{step.number}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-construction-100">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="py-24 bg-slate-50">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Результаты наших партнеров
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Реальные показатели успешности партнерской программы
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-construction-600 mb-2">50+</div>
                <p className="text-slate-600">Активных партнеров</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-construction-600 mb-2">500+</div>
                <p className="text-slate-600">Клиентов от партнеров</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-construction-600 mb-2">25%</div>
                <p className="text-slate-600">Средняя комиссия</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-construction-600 mb-2">95%</div>
                <p className="text-slate-600">Довольных партнеров</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-slate-900 text-white">
          <div className="container-custom text-center">
            <h2 className="text-4xl font-bold mb-6">
              Готовы стать нашим партнером?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Присоединяйтесь к растущей экосистеме ProHelper и развивайте свой бизнес
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contact?type=partner" 
                className="btn-primary inline-flex items-center justify-center px-8 py-4 text-lg"
              >
                Подать заявку
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </a>
              <a 
                href="/demo?type=partner" 
                className="btn-secondary inline-flex items-center justify-center px-8 py-4 text-lg border-slate-600 text-slate-300 hover:border-slate-500"
              >
                Посмотреть демо
              </a>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default PartnersPage; 