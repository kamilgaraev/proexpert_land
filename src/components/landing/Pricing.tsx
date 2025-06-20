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

  const handlePlanClick = (planName: string, planPrice: string) => {
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
      icon: WrenchScrewdriverIcon
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
      icon: BuildingOfficeIcon
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
      icon: TruckIcon
    }
  ];

  const faqItems = [
    {
      question: 'Как быстро можно начать работать с системой?',
      answer: 'Регистрация и базовая настройка занимают 15 минут. Полное обучение команды - 1-2 дня. Мы предоставляем персонального менеджера для помощи в настройке.'
    },
    {
      question: 'Работает ли система без интернета?',
      answer: 'Мобильное приложение работает офлайн. Все данные синхронизируются при появлении интернета. Веб-платформа требует стабильное подключение.'
    },
    {
      question: 'Можно ли интегрировать с 1С и другими системами?',
      answer: 'Да, мы предоставляем готовые интеграции с 1С, а также API для подключения других систем. Настройка интеграций входит в план "Профессиональный".'
    },
    {
      question: 'Какие гарантии безопасности данных?',
      answer: 'Данные хранятся на серверах в России с шифрованием. Ежедневное резервное копирование, двухфакторная аутентификация, регулярные аудиты безопасности.'
    },
    {
      question: 'Можно ли изменить тарифный план?',
      answer: 'Вы можете повысить тариф в любой момент. При понижении тарифа изменения вступят в силу со следующего периода оплаты.'
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-steel-50 to-concrete-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-blueprint opacity-10"></div>
      
      <div className="container-custom relative z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-construction-100 to-safety-100 border border-construction-300 rounded-full mb-6">
            <CurrencyDollarIcon className="w-4 h-4 text-construction-600" />
            <span className="text-construction-800 text-sm font-semibold">Тарифные планы</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-steel-900 mb-6 font-construction">
            Выберите подходящий <br />
            <span className="bg-gradient-to-r from-construction-600 to-safety-600 bg-clip-text text-transparent">
              тарифный план
            </span>
          </h2>
          
          <p className="text-xl text-steel-600 max-w-3xl mx-auto">
            Гибкие тарифы для компаний любого размера - от стартапов до крупных холдингов
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
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
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="bg-gradient-to-r from-construction-600 to-safety-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                    <StarIcon className="w-4 h-4" />
                    Популярный выбор
                  </div>
                </div>
              )}
              
              <div className={`
                bg-white/90 border-2 rounded-2xl p-8 backdrop-blur-sm transition-all duration-300 hover:scale-105 h-full
                ${plan.popular ? 'border-construction-400 shadow-construction' : 'border-steel-200 hover:border-construction-300'}
                ${plan.color === 'construction' ? 'hover:shadow-construction' : ''}
                ${plan.color === 'safety' ? 'hover:shadow-safety' : ''}
                ${plan.color === 'concrete' ? 'hover:shadow-concrete' : ''}
              `}>
                <div className="text-center mb-8">
                  <div className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto
                    ${plan.color === 'construction' ? 'bg-gradient-to-br from-construction-500 to-construction-600' : ''}
                    ${plan.color === 'safety' ? 'bg-gradient-to-br from-safety-500 to-safety-600' : ''}
                    ${plan.color === 'concrete' ? 'bg-gradient-to-br from-concrete-500 to-concrete-600' : ''}
                  `}>
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-steel-900 mb-2">{plan.name}</h3>
                  <p className="text-steel-600 mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-steel-900">{plan.price}</span>
                    {plan.period && (
                      <span className="text-steel-600 ml-2">/ {plan.period}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckIcon className={`
                        w-5 h-5 flex-shrink-0
                        ${plan.color === 'construction' ? 'text-construction-600' : ''}
                        ${plan.color === 'safety' ? 'text-safety-600' : ''}
                        ${plan.color === 'concrete' ? 'text-concrete-600' : ''}
                      `} />
                      <span className="text-steel-700">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.limitations.map((limitation, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <XMarkIcon className="w-5 h-5 text-steel-400 flex-shrink-0" />
                      <span className="text-steel-500">{limitation}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to={plan.name === 'Корпоративный' ? '/contact' : '/register'}
                  className={`
                    w-full py-4 px-6 rounded-lg font-semibold text-center transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105
                    ${plan.buttonStyle}
                  `}
                >
                  {plan.name === 'Корпоративный' && <PhoneIcon className="w-5 h-5" />}
                  {plan.buttonText}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="bg-gradient-to-r from-construction-600 to-safety-600 rounded-2xl p-12 text-center relative overflow-hidden mb-20"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 bg-construction-grid opacity-20"></div>
          
          <div className="relative z-10">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 font-construction">
              Попробуйте бесплатно 14 дней
            </h3>
            <p className="text-construction-100 text-lg mb-8 max-w-2xl mx-auto">
              Полный доступ ко всем функциям без ограничений. Кредитная карта не требуется.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="px-8 py-4 bg-white text-construction-600 font-semibold rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Начать бесплатный период
              </Link>
              <Link 
                to="/contact"
                className="flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                <PhoneIcon className="w-5 h-5" />
                Связаться с нами
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-steel-900 mb-4 font-construction">
              Часто задаваемые вопросы
            </h3>
            <p className="text-steel-600 text-lg">
              Ответы на популярные вопросы о ProHelper
            </p>
          </div>
          
          <div className="space-y-6">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                className="bg-white/90 border-2 border-steel-200 rounded-xl p-6 backdrop-blur-sm hover:border-construction-300 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h4 className="text-lg font-semibold text-steel-900 mb-3">
                  {item.question}
                </h4>
                <p className="text-steel-600 leading-relaxed">
                  {item.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing; 