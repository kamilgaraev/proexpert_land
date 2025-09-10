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
      name: 'Free',
      price: '₽0',
      period: 'в месяц',
      description: 'Бесплатный тариф для знакомства с системой',
      features: [
        '1 прораб',
        '1 объект', 
        '3 пользователя',
        '1 ГБ хранилища',
        '10 операций/мес',
        'Только базовые функции'
      ],
      limitations: [],
      buttonText: 'Выбрать',
      buttonStyle: 'border-2 border-construction-400 text-construction-600 hover:bg-construction-50',
      popular: false,
      color: 'concrete',
      icon: WrenchScrewdriverIcon,
      keywords: 'бесплатный тариф строительство малый бизнес'
    },
    {
      name: 'Start',
      price: '₽4,900',
      period: 'в месяц',
      description: '2 прораба, 3 объекта, 5 пользователей',
      features: [
        '2 прораба',
        '3 проекта',
        '5 пользователей',
        '1 ГБ хранилища',
        'Базовые отчёты'
      ],
      limitations: [],
      buttonText: 'Выбрать',
      buttonStyle: 'bg-gradient-to-r from-construction-600 to-construction-500 text-white hover:shadow-construction',
      popular: true,
      color: 'construction',
      icon: BuildingOfficeIcon,
      keywords: 'стартовый тариф CRM строительство малый бизнес'
    },
    {
      name: 'Business',
      price: '₽9,900',
      period: 'в месяц',
      description: '10 прорабов, 15 объектов, интеграции',
      features: [
        '10 прорабов',
        '15 проектов',
        '15 пользователей',
        '5 ГБ хранилища',
        'Интеграции'
      ],
      limitations: [],
      buttonText: 'Выбрать',
      buttonStyle: 'border-2 border-steel-400 text-steel-600 hover:bg-steel-50',
      popular: false,
      color: 'safety',
      icon: TruckIcon,
      keywords: 'бизнес тариф строительство средний бизнес'
    },
    {
      name: 'Profi',
      price: '₽19,900',
      period: 'в месяц',
      description: '30 прорабов, 50 объектов, API, BI, White Label',
      features: [
        '30 прорабов',
        '50 проектов', 
        '50 пользователей',
        '20 ГБ хранилища',
        'API, BI, White Label'
      ],
      limitations: [],
      buttonText: 'Выбрать',
      buttonStyle: 'border-2 border-steel-400 text-steel-600 hover:bg-steel-50',
      popular: false,
      color: 'steel',
      icon: StarIcon,
      keywords: 'профессиональный тариф CRM строительство'
    },
    {
      name: 'Enterprise',
      price: '₽49,900',
      period: 'в месяц',
      description: 'Индивидуальные условия для крупных компаний',
      features: [
        'Индивидуальные условия',
        'От 49,900 руб./мес',
        'Персональный менеджер',
        'Кастомизация',
        'Приоритетная поддержка 24/7'
      ],
      limitations: [],
      buttonText: 'Выбрать',
      buttonStyle: 'bg-gradient-to-r from-steel-600 to-steel-500 text-white hover:shadow-steel',
      popular: false,
      color: 'steel',
      icon: BuildingOfficeIcon,
      keywords: 'энтерпрайз тариф корпоративный строительство'
    }
  ];

  const faqs = [
    {
      question: 'Можно ли попробовать систему бесплатно?',
      answer: 'Да, у нас есть бесплатный тариф "Free" без ограничений по времени. Он включает базовый функционал для знакомства с системой.',
      keywords: 'бесплатная версия пробный период'
    },
    {
      question: 'Как происходит оплата?',
      answer: 'Оплата производится ежемесячно по выставленному счету. Принимаем оплату от юридических лиц, включая НДС.',
      keywords: 'оплата счет НДС юридические лица'
    },
    {
      question: 'Можно ли изменить тариф в процессе использования?',
      answer: 'Да, вы можете повысить или понизить тариф в любой момент. Изменения вступают в силу с следующего расчетного периода.',
      keywords: 'смена тарифа изменение плана'
    },
    {
      question: 'Включена ли техподдержка во все тарифы?',
      answer: 'Да, техподдержка включена во все тарифы. В стартовом тарифе - поддержка по email, в остальных - приоритетная поддержка.',
      keywords: 'техподдержка поддержка помощь'
    },
    {
      question: 'Есть ли скидки для крупных проектов?',
      answer: 'Да, для корпоративных клиентов и крупных проектов мы предоставляем индивидуальные условия и скидки. Свяжитесь с нами для обсуждения.',
      keywords: 'скидки корпоративные клиенты крупные проекты'
    }
  ];

  return (
    <section 
      className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-gradient-to-b from-white to-steel-50 relative overflow-hidden"
      data-seo-track="pricing_section_view"
    >
      <div className="absolute inset-0 bg-construction-grid opacity-5"></div>
      
      <div className="container-custom relative z-10 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-8 sm:mb-12 lg:mb-16 xl:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-construction-100 to-safety-100 border border-construction-300 rounded-full mb-4 sm:mb-6">
            <CurrencyDollarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-construction-600" />
            <span 
              className="text-construction-800 text-xs sm:text-sm font-semibold"
              data-seo-keyword="тарифные планы"
            >
              Тарифные планы
            </span>
          </div>
          
          <h2 
            className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-steel-900 mb-4 sm:mb-6 font-construction"
            data-seo-keyword="стоимость CRM строительство"
          >
            Выберите подходящий <br />
            <span className="bg-gradient-to-r from-construction-600 to-safety-600 bg-clip-text text-transparent">
              тарифный план
            </span>
          </h2>
          
          <p 
            className="text-sm sm:text-base md:text-lg lg:text-xl text-steel-600 max-w-3xl mx-auto"
            data-seo-keyword="тарифы строительные компании"
          >
            Гибкие тарифы для компаний любого размера - от стартапов до крупных холдингов
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12 sm:mb-16 lg:mb-20">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`
                relative group
                ${plan.popular ? 'lg:scale-105 lg:-mt-4' : ''}
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
                  <div className="bg-gradient-to-r from-construction-600 to-safety-600 text-white px-3 py-1 sm:px-6 sm:py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-2">
                    <StarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span data-seo-keyword="популярный план">Популярный выбор</span>
                  </div>
                </div>
              )}
              
              <div className={`
                bg-white/90 border-2 rounded-2xl p-6 lg:p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 h-full flex flex-col min-h-[500px] lg:min-h-[520px]
                ${plan.popular ? 'border-construction-400 shadow-construction' : 'border-steel-200 hover:border-construction-300'}
                ${plan.color === 'construction' ? 'hover:shadow-construction' : ''}
                ${plan.color === 'safety' ? 'hover:shadow-safety' : ''}
                ${plan.color === 'concrete' ? 'hover:shadow-concrete' : ''}
                ${plan.color === 'steel' ? 'hover:shadow-steel' : ''}
              `}>
                <div className="text-center mb-6">
                  <div className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center mb-4 mx-auto
                    ${plan.color === 'construction' ? 'bg-gradient-to-br from-construction-500 to-construction-600' : ''}
                    ${plan.color === 'safety' ? 'bg-gradient-to-br from-safety-500 to-safety-600' : ''}
                    ${plan.color === 'concrete' ? 'bg-gradient-to-br from-concrete-500 to-concrete-600' : ''}
                    ${plan.color === 'steel' ? 'bg-gradient-to-br from-steel-500 to-steel-600' : ''}
                  `}>
                    <plan.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 
                    className="text-xl font-bold text-steel-900 mb-2"
                    data-seo-keyword={plan.keywords}
                  >
                    {plan.name}
                  </h3>
                  <p className="text-steel-600 mb-4 text-sm">{plan.description}</p>
                  
                  <div className="mb-4">
                    <span 
                      className="text-3xl font-bold text-steel-900"
                      data-seo-keyword="цена план"
                    >
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-steel-600 ml-2 text-sm">/ {plan.period}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-6 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckIcon className="w-4 h-4 text-construction-600 mt-0.5 flex-shrink-0" />
                      <span className="text-steel-700 text-sm">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.map((limitation, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <XMarkIcon className="w-4 h-4 text-steel-400 mt-0.5 flex-shrink-0" />
                      <span className="text-steel-500 text-sm">{limitation}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to="/register"
                  onClick={() => handlePlanClick(plan.name)}
                  className={`
                    w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300 
                    hover:scale-105 text-center text-sm ${plan.buttonStyle}
                  `}
                  data-seo-track="pricing_plan_click"
                  data-seo-keyword={plan.keywords}
                >
                  {plan.buttonText}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="bg-gradient-to-r from-construction-600 to-safety-600 rounded-2xl p-6 sm:p-8 lg:p-12 relative overflow-hidden mb-12 sm:mb-16 lg:mb-20"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          data-seo-track="pricing_cta_view"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-construction-600/90 to-safety-600/90"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-construction-grid opacity-20"></div>
          
          <div className="relative z-10 text-center">
            <h3 
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 font-construction"
              data-seo-keyword="нужна консультация"
            >
              Нужна консультация?
            </h3>
            <p className="text-sm sm:text-base lg:text-xl text-white/90 mb-6 sm:mb-8 max-w-3xl mx-auto">
              Наши эксперты помогут выбрать оптимальный тариф и настроить систему под ваши потребности
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/contact"
                className="px-6 py-3 sm:px-8 sm:py-4 bg-white text-construction-600 font-semibold rounded-lg hover:bg-white/90 transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                data-seo-track="pricing_consultation_click"
              >
                Получить консультацию
              </Link>
              
              <a
                href="tel:+79991234567"
                className="flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 border-2 border-white/50 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 text-sm sm:text-base"
                data-seo-track="pricing_phone_click"
              >
                <PhoneIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                Позвонить сейчас
              </a>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="space-y-4 sm:space-y-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          data-seo-track="faq_section_view"
        >
          <div className="text-center mb-8 sm:mb-12">
            <h3 
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-steel-900 mb-4 font-construction"
              data-seo-keyword="часто задаваемые вопросы"
            >
              Часто задаваемые вопросы
            </h3>
            <p className="text-sm sm:text-base lg:text-xl text-steel-600 max-w-3xl mx-auto">
              Ответы на самые популярные вопросы о тарифах и условиях использования
            </p>
          </div>
          
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="bg-white/90 border-2 border-steel-200 rounded-2xl p-4 sm:p-6 lg:p-8 backdrop-blur-sm hover:border-construction-300 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              data-seo-track="faq_item_view"
              data-seo-keyword={faq.keywords}
            >
              <h4 
                className="text-base sm:text-lg lg:text-xl font-semibold text-steel-900 mb-3 sm:mb-4"
                data-seo-keyword={faq.keywords}
              >
                {faq.question}
              </h4>
              <p className="text-steel-600 text-sm sm:text-base leading-relaxed">{faq.answer}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing; 