import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckIcon, 
  XMarkIcon,
  StarIcon,
  ArrowRightIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const plans = [
  {
    name: 'Стартовый',
    price: 'Бесплатно',
    period: 'навсегда',
    description: 'Для малых компаний и тестирования',
    features: [
      { name: '2 активных проекта', included: true },
      { name: '3 пользователя (1 админ + 2 прораба)', included: true },
      { name: 'Базовый учет материалов', included: true },
      { name: 'Простые отчеты', included: true },
      { name: 'Мобильное приложение', included: true },
      { name: 'Облачное хранение 1 ГБ', included: true },
      { name: 'Email поддержка', included: true },
      { name: 'Управление подрядчиками', included: false },
      { name: 'Финансовая аналитика', included: false },
      { name: 'API доступ', included: false },
      { name: 'Интеграции с 1С', included: false },
      { name: 'Приоритетная поддержка', included: false }
    ],
    color: 'neon-blue',
    gradient: 'from-blue-400 to-cyan-500',
    icon: BuildingOfficeIcon,
    popular: false
  },
  {
    name: 'Профессиональный',
    price: '3 990',
    period: 'в месяц',
    description: 'Для растущих строительных компаний',
    features: [
      { name: '10 активных проектов', included: true },
      { name: 'До 15 пользователей', included: true },
      { name: 'Полный учет материалов и работ', included: true },
      { name: 'Управление подрядчиками', included: true },
      { name: 'Управление контрактами', included: true },
      { name: 'Финансовая аналитика', included: true },
      { name: 'Расширенные отчеты', included: true },
      { name: 'Облачное хранение 10 ГБ', included: true },
      { name: 'Приоритетная поддержка', included: true },
      { name: 'Обучение персонала', included: true },
      { name: 'API доступ', included: false },
      { name: 'Интеграции с 1С', included: false }
    ],
    color: 'neon-purple',
    gradient: 'from-purple-400 to-violet-500',
    icon: UserGroupIcon,
    popular: true
  },
  {
    name: 'Корпоративный',
    price: '9 990',
    period: 'в месяц',
    description: 'Для крупных строительных организаций',
    features: [
      { name: 'Неограниченные проекты', included: true },
      { name: 'Неограниченные пользователи', included: true },
      { name: 'Все функции платформы', included: true },
      { name: 'Интеграции с 1С, СБИС', included: true },
      { name: 'API для интеграций', included: true },
      { name: 'Персональный менеджер', included: true },
      { name: 'Кастомизация под бизнес', included: true },
      { name: 'Облачное хранение 100 ГБ', included: true },
      { name: '24/7 техподдержка', included: true },
      { name: 'Консультации по внедрению', included: true },
      { name: 'Обучение команды', included: true },
      { name: 'SLA гарантии', included: true }
    ],
    color: 'neon-pink',
    gradient: 'from-pink-400 to-rose-500',
    icon: ChartBarIcon,
    popular: false
  }
];

const faqs = [
  {
    question: 'Можно ли изменить тариф в процессе использования?',
    answer: 'Да, вы можете повысить или понизить тариф в любое время. При повышении тарифа доплата рассчитывается пропорционально оставшемуся периоду.'
  },
  {
    question: 'Есть ли скидки при годовой оплате?',
    answer: 'Да, при оплате на год предоставляется скидка 20% от стоимости месячной подписки.'
  },
  {
    question: 'Что происходит с данными при отмене подписки?',
    answer: 'Ваши данные сохраняются в течение 90 дней после отмены подписки. Вы можете экспортировать все данные в любое время.'
  }
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-cyber-bg to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-cyber-grid opacity-10"></div>
      
      <div className="absolute top-20 left-20 w-64 h-64 bg-neon-purple/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-neon-blue/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
      
      <div className="container-custom relative z-10">
        <div className="text-center mb-20">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-neon-pink/20 to-neon-purple/20 border border-neon-pink/30 backdrop-blur-sm mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-2 h-2 bg-neon-yellow rounded-full animate-pulse"></div>
            <span className="text-gray-300 text-sm font-medium">ТАРИФНЫЕ ПЛАНЫ</span>
          </motion.div>
          
          <motion.h2 
            className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Выберите план
            <span className="block bg-gradient-to-r from-neon-pink via-neon-purple to-neon-blue bg-clip-text text-transparent">
              для вашего бизнеса
            </span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Прозрачные цены без скрытых комиссий. Начните бесплатно и масштабируйтесь по мере роста
          </motion.p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 mb-20">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`relative group ${plan.popular ? 'lg:scale-110 lg:-mt-8' : ''}`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              {plan.popular && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-neon-purple to-neon-pink px-6 py-2 rounded-full text-white font-semibold text-sm flex items-center gap-2">
                    <StarIcon className="w-4 h-4" />
                    Популярный
                  </div>
                </div>
              )}

              <div className={`relative bg-gradient-to-br from-cyber-card/80 to-cyber-accent/80 border ${plan.popular ? 'border-neon-purple shadow-neon-purple' : 'border-cyber-border'} rounded-3xl p-8 backdrop-blur-sm transition-all duration-500 hover:scale-105 h-full`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${plan.gradient} shadow-lg`}>
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    <p className="text-gray-400">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-bold ${plan.price === 'Бесплатно' ? 'text-neon-green' : 'text-white'}`}>
                      {plan.price}
                    </span>
                    {plan.price !== 'Бесплатно' && (
                      <span className="text-gray-400">₽</span>
                    )}
                  </div>
                  <p className="text-gray-400 mt-1">{plan.period}</p>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      {feature.included ? (
                        <CheckIcon className="w-5 h-5 text-neon-green flex-shrink-0" />
                      ) : (
                        <XMarkIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      )}
                      <span className={`${feature.included ? 'text-gray-300' : 'text-gray-500'}`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  to="/register"
                  className={`block w-full text-center px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-neon-purple to-neon-pink text-white hover:shadow-neon-purple transform hover:scale-105' 
                      : 'border border-gray-600 text-gray-300 hover:border-neon-blue hover:text-neon-blue'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {plan.price === 'Бесплатно' ? 'Начать бесплатно' : 'Выбрать план'}
                    <ArrowRightIcon className="w-4 h-4" />
                  </span>
                </Link>

                {plan.popular && (
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-neon-purple via-neon-pink to-neon-blue rounded-3xl blur opacity-30 animate-pulse-slow -z-10"></div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="bg-gradient-to-r from-cyber-card/50 to-cyber-accent/50 border border-cyber-border rounded-3xl p-12 backdrop-blur-sm">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-white mb-4">
                Часто задаваемые вопросы
              </h3>
              <p className="text-gray-300 text-lg">
                Ответы на популярные вопросы о тарифах и подписке
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  className="bg-cyber-card/50 border border-cyber-border rounded-2xl p-6 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <h4 className="text-white font-semibold mb-3">
                    {faq.question}
                  </h4>
                  <p className="text-gray-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-gray-300 mb-6">
                Остались вопросы? Мы поможем выбрать подходящий тариф
              </p>
              <Link
                to="/support"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg text-white font-semibold hover:shadow-neon-blue transition-all duration-300 transform hover:scale-105"
              >
                Связаться с нами
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>
          
          <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink rounded-3xl blur opacity-20 animate-pulse-slow"></div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing; 