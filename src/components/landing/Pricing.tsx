import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  CheckIcon, 
  XMarkIcon,
  StarIcon,
  WrenchScrewdriverIcon,
  BuildingOfficeIcon,
  TruckIcon,
  CurrencyDollarIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import useAnalytics from '../../hooks/useAnalytics';

const Pricing = () => {
  const { trackButtonClick, trackPricingView } = useAnalytics();

  const handlePlanClick = (planName: string) => {
    trackButtonClick(`select_plan_${planName.toLowerCase()}`, 'pricing_section');
    trackPricingView(planName);
  };

  const plans = [
    {
      name: 'Стартовый',
      price: 'Бесплатно',
      period: 'навсегда',
      description: 'Идеально для малых объектов и знакомства с системой',
      features: [
        'До 3 пользователей',
        'Мобильное приложение',
        'Базовый учет материалов',
        'Простые отчеты',
        'Техподдержка по email'
      ],
      limitations: [
        'Без веб-платформы',
        'Ограниченная аналитика',
        'Базовый функционал'
      ],
      buttonText: 'Начать бесплатно',
      buttonStyle: 'border-2 border-construction-400 text-construction-600 hover:bg-construction-50',
      popular: false,
      color: 'concrete',
      icon: WrenchScrewdriverIcon,
      keywords: 'бесплатный тариф строительство малый бизнес'
    },
    {
      name: 'Профессиональный',
      price: '₽3,990',
      period: 'в месяц',
      description: 'Для средних строительных компаний с несколькими объектами',
      features: [
        'До 15 пользователей',
        'Полная веб-платформа',
        'Управление проектами',
        'Детальная аналитика',
        'Управление подрядчиками',
        'Финансовый контроль',
        'Приоритетная поддержка',
        'Интеграции с 1С'
      ],
      limitations: [],
      buttonText: 'Выбрать план',
      buttonStyle: 'bg-gradient-to-r from-construction-600 to-construction-500 text-white hover:shadow-construction',
      popular: true,
      color: 'construction',
      icon: BuildingOfficeIcon,
      keywords: 'профессиональный тариф CRM строительство средний бизнес'
    },
    {
      name: 'Корпоративный',
      price: '₽9,990',
      period: 'в месяц',
      description: 'Для крупных строительных холдингов с множеством проектов',
      features: [
        'Неограниченное количество пользователей',
        'Все функции системы',
        'Персональный менеджер',
        'Кастомизация под потребности',
        'API для интеграций',
        'Обучение команды',
        'SLA 99.9%',
        'Круглосуточная поддержка'
      ],
      limitations: [],
      buttonText: 'Связаться с нами',
      buttonStyle: 'border-2 border-safety-400 text-safety-600 hover:bg-safety-50',
      popular: false,
      color: 'safety',
      icon: TruckIcon,
      keywords: 'корпоративный тариф enterprise строительство крупный бизнес'
    }
  ];

  const faqItems = [
    {
      question: 'Как быстро можно начать работать с системой?',
      answer: 'Регистрация и базовая настройка занимают 15 минут. Полное обучение команды - 1-2 дня. Мы предоставляем персонального менеджера для помощи в настройке.',
      keywords: 'быстрый старт настройка система'
    },
    {
      question: 'Работает ли система без интернета?',
      answer: 'Мобильное приложение работает офлайн. Все данные синхронизируются при появлении интернета. Веб-платформа требует стабильное подключение.',
      keywords: 'офлайн работа мобильное приложение'
    },
    {
      question: 'Можно ли интегрировать с 1С и другими системами?',
      answer: 'Да, мы предоставляем готовые интеграции с 1С, а также API для подключения других систем. Настройка интеграций входит в план "Профессиональный".',
      keywords: 'интеграция 1С API системы'
    },
    {
      question: 'Какие гарантии безопасности данных?',
      answer: 'Данные хранятся на серверах в России с шифрованием. Ежедневное резервное копирование, двухфакторная аутентификация, регулярные аудиты безопасности.',
      keywords: 'безопасность данных шифрование'
    },
    {
      question: 'Можно ли изменить тарифный план?',
      answer: 'Вы можете повысить тариф в любой момент. При понижении тарифа изменения вступят в силу со следующего периода оплаты.',
      keywords: 'смена тарифа гибкость оплаты'
    }
  ];

  return (
    <section 
      className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-steel-50 to-concrete-100 relative overflow-hidden"
      data-seo-track="pricing_section_view"
    >
      <div className="absolute inset-0 bg-blueprint opacity-10"></div>
      
      <div className="container-custom relative z-10">
        <motion.div
          className="text-center mb-12 sm:mb-16 lg:mb-20 px-4 sm:px-0"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-construction-100 to-safety-100 border border-construction-300 rounded-full mb-4 sm:mb-6">
            <CurrencyDollarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-construction-600" />
            <span 
              className="text-construction-800 text-xs sm:text-sm font-semibold"
              data-seo-keyword="тарифные планы"
            >
              Тарифные планы
            </span>
          </div>
          
          <h2 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-steel-900 mb-4 sm:mb-6 font-construction"
            data-seo-keyword="стоимость CRM строительство"
          >
            Выберите подходящий <br />
            <span className="bg-gradient-to-r from-construction-600 to-safety-600 bg-clip-text text-transparent">
              тарифный план
            </span>
          </h2>
          
          <p 
            className="text-base sm:text-lg md:text-xl text-steel-600 max-w-3xl mx-auto"
            data-seo-keyword="тарифы строительные компании"
          >
            Гибкие тарифы для компаний любого размера - от стартапов до крупных холдингов
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16 lg:mb-20 px-4 sm:px-0">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`
                relative group
                ${plan.popular ? 'md:col-span-2 lg:col-span-1 lg:scale-105 lg:-mt-4' : ''}
              `}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              data-seo-track="pricing_plan_view"
              data-seo-keyword={plan.keywords}
            >
              {plan.popular && (
                <div className="absolute -top-2 sm:-top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="bg-gradient-to-r from-construction-600 to-safety-600 text-white px-4 py-1 sm:px-6 sm:py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-2">
                    <StarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span data-seo-keyword="популярный план">Популярный выбор</span>
                  </div>
                </div>
              )}
              
              <div className={`
                bg-white/90 border-2 rounded-2xl p-6 sm:p-8 backdrop-blur-sm transition-all duration-300 hover:scale-105 h-full
                ${plan.popular ? 'border-construction-400 shadow-construction' : 'border-steel-200 hover:border-construction-300'}
                ${plan.color === 'construction' ? 'hover:shadow-construction' : ''}
                ${plan.color === 'safety' ? 'hover:shadow-safety' : ''}
                ${plan.color === 'concrete' ? 'hover:shadow-concrete' : ''}
              `}>
                <div className="text-center mb-6 sm:mb-8">
                  <div className={`
                    w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 mx-auto
                    ${plan.color === 'construction' ? 'bg-gradient-to-br from-construction-500 to-construction-600' : ''}
                    ${plan.color === 'safety' ? 'bg-gradient-to-br from-safety-500 to-safety-600' : ''}
                    ${plan.color === 'concrete' ? 'bg-gradient-to-br from-concrete-500 to-concrete-600' : ''}
                  `}>
                    <plan.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  
                  <h3 
                    className="text-xl sm:text-2xl font-bold text-steel-900 mb-2"
                    data-seo-keyword={plan.keywords}
                  >
                    {plan.name}
                  </h3>
                  <p className="text-steel-600 mb-4 sm:mb-6 text-sm sm:text-base">{plan.description}</p>
                  
                  <div className="mb-4 sm:mb-6">
                    <span 
                      className="text-3xl sm:text-4xl font-bold text-steel-900"
                      data-seo-keyword="цена план"
                    >
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-steel-600 ml-2 text-sm sm:text-base">/ {plan.period}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckIcon className={`
                        w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5
                        ${plan.color === 'construction' ? 'text-construction-600' : ''}
                        ${plan.color === 'safety' ? 'text-safety-600' : ''}
                        ${plan.color === 'concrete' ? 'text-concrete-600' : ''}
                      `} />
                      <span className="text-steel-700 text-sm sm:text-base">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.limitations.map((limitation, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5 text-steel-400 flex-shrink-0 mt-0.5" />
                      <span className="text-steel-500 text-sm sm:text-base">{limitation}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handlePlanClick(plan.name)}
                  className={`
                    w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold transition-all duration-300 hover:scale-105 text-sm sm:text-base
                    ${plan.buttonStyle}
                  `}
                  data-seo-track="pricing_plan_button_click"
                  data-seo-keyword={plan.keywords}
                >
                  {plan.buttonText}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="bg-gradient-to-r from-construction-600 to-safety-600 rounded-2xl p-6 sm:p-8 lg:p-12 text-center relative overflow-hidden mb-12 sm:mb-16 lg:mb-20 mx-4 sm:mx-0"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          data-seo-track="pricing_cta_view"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-construction-600/90 to-safety-600/90"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-construction-grid opacity-20"></div>
          
          <div className="relative z-10">
            <h3 
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6 font-construction"
              data-seo-keyword="демо версия ProHelper"
            >
              Не уверены? Попробуйте демо-версию
            </h3>
            <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 max-w-3xl mx-auto">
              Получите полный доступ к системе на 14 дней бесплатно и убедитесь в эффективности
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                to="/demo"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-construction-600 font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                data-seo-track="demo_button_click"
                data-seo-keyword="демо версия бесплатно"
              >
                Запросить демо
              </Link>
              <a
                href="tel:+79991234567"
                className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 hover:scale-105 flex items-center gap-2 justify-center text-sm sm:text-base"
                data-seo-track="call_button_click"
                data-seo-keyword="консультация телефон"
              >
                <PhoneIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                Получить консультацию
              </a>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="max-w-4xl mx-auto px-4 sm:px-0"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          data-seo-track="faq_section_view"
        >
          <h3 
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-steel-900 text-center mb-8 sm:mb-12 font-construction"
            data-seo-keyword="часто задаваемые вопросы"
          >
            Часто задаваемые вопросы
          </h3>
          
          <div className="space-y-4 sm:space-y-6">
            {faqItems.map((faq, index) => (
              <motion.div
                key={index}
                className="bg-white/80 border border-steel-200 rounded-xl p-4 sm:p-6 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                data-seo-track="faq_item_view"
                data-seo-keyword={faq.keywords}
              >
                <h4 
                  className="text-base sm:text-lg font-semibold text-steel-900 mb-2 sm:mb-3"
                  data-seo-keyword={faq.keywords}
                >
                  {faq.question}
                </h4>
                <p className="text-steel-600 leading-relaxed text-sm sm:text-base">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing; 