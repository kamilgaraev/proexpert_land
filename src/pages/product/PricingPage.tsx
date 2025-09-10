import PageLayout from '../../components/shared/PageLayout';
import { 
  CheckIcon,
  XMarkIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const PricingPage = () => {
  const plans = [
    {
      name: 'Free',
      price: '0',
      period: '₽/мес',
      description: 'Бесплатный тариф для знакомства',
      featured: false,
      features: [
        { name: '1 прораб', included: true },
        { name: '1 объект', included: true },
        { name: '3 пользователя', included: true },
        { name: '1 ГБ хранилища', included: true },
        { name: '10 операций/мес', included: true },
        { name: 'Только базовые функции', included: true },
        { name: 'Интеграции', included: false },
        { name: 'API доступ', included: false },
        { name: 'White Label', included: false }
      ],
      cta: 'Выбрать',
      href: '/register'
    },
    {
      name: 'Start',
      price: '4 900',
      period: '₽/мес',
      description: '2 прораба, 3 объекта, 5 пользователей',
      featured: true,
      features: [
        { name: '2 прораба', included: true },
        { name: '3 проекта', included: true },
        { name: '5 пользователей', included: true },
        { name: '1 ГБ хранилища', included: true },
        { name: 'Базовые отчёты', included: true },
        { name: 'Мобильное приложение', included: true },
        { name: 'Email поддержка', included: true },
        { name: 'API доступ', included: false },
        { name: 'White Label', included: false }
      ],
      cta: 'Выбрать',
      href: '/register?plan=start'
    },
    {
      name: 'Business',
      price: '9 900',
      period: '₽/мес',
      description: '10 прорабов, 15 объектов, интеграции',
      featured: false,
      features: [
        { name: '10 прорабов', included: true },
        { name: '15 проектов', included: true },
        { name: '15 пользователей', included: true },
        { name: '5 ГБ хранилища', included: true },
        { name: 'Интеграции', included: true },
        { name: 'Расширенные отчёты', included: true },
        { name: 'Приоритетная поддержка', included: true },
        { name: 'API доступ', included: false },
        { name: 'White Label', included: false }
      ],
      cta: 'Выбрать',
      href: '/register?plan=business'
    },
    {
      name: 'Profi',
      price: '19 900',
      period: '₽/мес',
      description: '30 прорабов, 50 объектов, API, BI',
      featured: false,
      features: [
        { name: '30 прорабов', included: true },
        { name: '50 проектов', included: true },
        { name: '50 пользователей', included: true },
        { name: '20 ГБ хранилища', included: true },
        { name: 'API доступ', included: true },
        { name: 'BI аналитика', included: true },
        { name: 'White Label', included: true },
        { name: '24/7 поддержка', included: true },
        { name: 'Персональный менеджер', included: true }
      ],
      cta: 'Выбрать',
      href: '/register?plan=profi'
    },
    {
      name: 'Enterprise',
      price: '49 900',
      period: '₽/мес',
      description: 'Индивидуальные условия для корпораций',
      featured: false,
      features: [
        { name: 'Индивидуальные условия', included: true },
        { name: 'От 49 900 руб./мес', included: true },
        { name: 'Персональный менеджер', included: true },
        { name: 'Кастомизация', included: true },
        { name: 'Приоритетная поддержка 24/7', included: true },
        { name: 'On-premise размещение', included: true },
        { name: 'SLA 99.9%', included: true },
        { name: 'Обучение команды', included: true },
        { name: 'Неограниченные интеграции', included: true }
      ],
      cta: 'Выбрать',
      href: '/contact'
    }
  ];


  const faqs = [
    {
      question: 'Можно ли сменить тариф?',
      answer: 'Да, вы можете повысить или понизить тариф в любое время. При повышении доплачиваете разницу, при понижении остаток переносится на следующий период.'
    },
    {
      question: 'Есть ли скидки при годовой оплате?',
      answer: 'При оплате за год вы получаете скидку 20%. Это 2 месяца в подарок!'
    },
    {
      question: 'Что входит в бесплатный период?',
      answer: '14 дней полного доступа ко всем функциям выбранного тарифа. Никаких ограничений, карта не требуется.'
    },
    {
      question: 'Безопасны ли мои данные?',
      answer: 'Да, мы используем шифрование данных, регулярное резервное копирование и соответствуем стандартам безопасности.'
    }
  ];

  return (
    <PageLayout
      title="Тарифы ProHelper"
      subtitle="Выберите план, который подходит вашей компании"
      seoPage="pricing"
    >
      <div className="bg-gradient-to-b from-slate-50 to-white">
        {/* Pricing Plans */}
        <section className="py-24">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Прозрачные цены без скрытых комиссий
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Начните бесплатно и масштабируйтесь по мере роста. Все планы включают 14-дневный тестовый период.
              </p>
            </div>

            <div className="grid lg:grid-cols-5 gap-4 max-w-7xl mx-auto">
              {plans.map((plan, index) => (
                <div 
                  key={index} 
                  className={`relative rounded-2xl p-8 ${
                    plan.featured 
                      ? 'bg-gradient-to-b from-construction-50 to-white border-2 border-construction-500 shadow-xl' 
                      : 'bg-white border border-slate-200 shadow-sm'
                  }`}
                >
                  {plan.featured && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-construction-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                        <StarIcon className="w-4 h-4 mr-1" />
                        Популярный
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                    <p className="text-slate-600 mb-4">{plan.description}</p>
                    
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                      {plan.period && <span className="text-slate-600 ml-1">{plan.period}</span>}
                    </div>

                    <a 
                      href={plan.href}
                      className={`w-full inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all ${
                        plan.featured
                          ? 'bg-construction-500 text-white hover:bg-construction-600 shadow-lg'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      {plan.cta}
                      <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </a>
                  </div>

                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center">
                        {feature.included ? (
                          <CheckIcon className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                        ) : (
                          <XMarkIcon className="w-5 h-5 text-slate-300 mr-3 flex-shrink-0" />
                        )}
                        <span className={feature.included ? 'text-slate-700' : 'text-slate-400'}>
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* FAQ Section */}
        <section className="py-24 bg-slate-50">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold text-slate-900 text-center mb-12">
                Часто задаваемые вопросы
              </h2>
              
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">{faq.question}</h3>
                    <p className="text-slate-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Calculator Section */}
        <section className="py-24 bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">
                Рассчитайте экономию от ProHelper
              </h2>
              <p className="text-xl text-slate-600 mb-12">
                В среднем наши клиенты экономят 2-4 часа в день на административных задачах
              </p>

              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                  <div className="text-4xl font-bold text-construction-600 mb-2">40%</div>
                  <p className="text-slate-600">Сокращение времени на отчеты</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-construction-600 mb-2">30%</div>
                  <p className="text-slate-600">Снижение перерасхода материалов</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-construction-600 mb-2">25%</div>
                  <p className="text-slate-600">Ускорение выполнения проектов</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-construction-500 to-safety-500 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">
                  Окупаемость ProHelper составляет в среднем 2-3 месяца
                </h3>
                <p className="text-construction-100 mb-6">
                  Благодаря автоматизации учета, сокращению ошибок и повышению эффективности команды
                </p>
                <a 
                  href="/demo" 
                  className="inline-flex items-center px-6 py-3 bg-white text-construction-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Посмотреть расчет ROI
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-slate-900 text-white">
          <div className="container-custom text-center">
            <h2 className="text-4xl font-bold mb-6">
              Готовы начать экономить время и деньги?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Попробуйте ProHelper бесплатно 14 дней. Никаких карт, никаких обязательств.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/register" 
                className="btn-primary inline-flex items-center justify-center px-8 py-4 text-lg"
              >
                Начать бесплатно
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </a>
              <a 
                href="/contact" 
                className="btn-secondary inline-flex items-center justify-center px-8 py-4 text-lg border-slate-600 text-slate-300 hover:border-slate-500"
              >
                Связаться с продажами
              </a>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default PricingPage; 