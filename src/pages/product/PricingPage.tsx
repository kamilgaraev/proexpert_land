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
      name: 'Старт',
      price: 'Бесплатно',
      period: '',
      description: 'Для небольших проектов и знакомства с системой',
      featured: false,
      features: [
        { name: '1 проект', included: true },
        { name: '3 пользователя', included: true },
        { name: 'Базовый учет материалов', included: true },
        { name: 'Мобильное приложение', included: true },
        { name: 'Email поддержка', included: true },
        { name: 'Финансовые отчеты', included: false },
        { name: 'Интеграция с 1С', included: false },
        { name: 'API доступ', included: false },
        { name: 'Приоритетная поддержка', included: false }
      ],
      cta: 'Начать бесплатно',
      href: '/register'
    },
    {
      name: 'Проф',
      price: '4 900',
      period: '₽/мес',
      description: 'Для растущих строительных компаний',
      featured: true,
      features: [
        { name: '10 проектов', included: true },
        { name: '15 пользователей', included: true },
        { name: 'Полный учет материалов', included: true },
        { name: 'Мобильное приложение', included: true },
        { name: 'Email и чат поддержка', included: true },
        { name: 'Финансовые отчеты', included: true },
        { name: 'Интеграция с 1С', included: true },
        { name: 'Базовый API', included: true },
        { name: 'Приоритетная поддержка', included: false }
      ],
      cta: 'Попробовать 14 дней',
      href: '/register?plan=pro'
    },
    {
      name: 'Бизнес',
      price: '9 900',
      period: '₽/мес',
      description: 'Для крупных компаний с множеством проектов',
      featured: false,
      features: [
        { name: 'Неограниченно проектов', included: true },
        { name: '50 пользователей', included: true },
        { name: 'Расширенный учет материалов', included: true },
        { name: 'Мобильное приложение', included: true },
        { name: '24/7 поддержка', included: true },
        { name: 'Расширенные отчеты', included: true },
        { name: 'Полная интеграция с 1С', included: true },
        { name: 'Полный API доступ', included: true },
        { name: 'Приоритетная поддержка', included: true }
      ],
      cta: 'Попробовать 14 дней',
      href: '/register?plan=business'
    }
  ];

  const enterpriseFeatures = [
    'Неограниченное количество пользователей и проектов',
    'Персональный менеджер и техническая поддержка',
    'Индивидуальные интеграции и кастомизация',
    'Размещение на ваших серверах (on-premise)',
    'SLA 99.9% доступности',
    'Обучение команды и внедрение',
    'Белый лейбл (white-label) решение'
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

            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
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

        {/* Enterprise Section */}
        <section className="py-24 bg-slate-900 text-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6">
                Нужно решение для крупной компании?
              </h2>
              <p className="text-xl text-slate-300 mb-12">
                Enterprise план включает все необходимое для крупных строительных холдингов и корпораций
              </p>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="text-left">
                  <h3 className="text-2xl font-semibold mb-6">Enterprise включает:</h3>
                  <ul className="space-y-3">
                    {enterpriseFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckIcon className="w-5 h-5 text-emerald-400 mr-3 mt-1 flex-shrink-0" />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-slate-800 rounded-2xl p-8">
                  <h3 className="text-2xl font-semibold mb-4">Индивидуальный расчет</h3>
                  <p className="text-slate-300 mb-6">
                    Стоимость рассчитывается индивидуально в зависимости от количества пользователей, проектов и требований к интеграции.
                  </p>
                  <a 
                    href="/contact" 
                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-construction-500 text-white rounded-xl font-semibold hover:bg-construction-600 transition-colors"
                  >
                    Обсудить проект
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </a>
                </div>
              </div>
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