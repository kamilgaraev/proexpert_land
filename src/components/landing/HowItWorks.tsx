import { motion } from 'framer-motion';
import { 
  DocumentCheckIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowRightIcon,
  ClipboardDocumentListIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const HowItWorks = () => {
  const steps = [
    {
      step: '01',
      title: 'Планирование и настройка',
      description: 'Создание проекта, настройка справочников материалов, добавление участников команды и определение ролевой модели доступа.',
      icon: DocumentCheckIcon,
      features: [
        'Создание структуры проекта!',
        'Загрузка справочников',
        'Настройка ролей пользователей',
        'Интеграция с существующими системами'
      ],
      color: 'construction',
      keywords: 'регистрация настройка быстрый старт'
    },
    {
      step: '02',
      title: 'Обучение и внедрение',
      description: 'Обучение команды работе с системой, настройка мобильных приложений для прорабов и веб-интерфейса для администраторов.',
      icon: UserGroupIcon,
      features: [
        'Онлайн-обучение команды',
        'Установка мобильных приложений',
        'Настройка уведомлений',
        'Тестирование всех функций'
      ],
      color: 'safety',
      keywords: 'обучение команда менеджер поддержка'
    },
    {
      step: '03',
      title: 'Учет и контроль',
      description: 'Ведение учета материалов на объектах, контроль выполнения работ, фиксация всех операций в реальном времени.',
      icon: ClipboardDocumentListIcon,
      features: [
        'Мобильный учет материалов',
        'Фотофиксация работ',
        'QR-коды для быстрого учета',
        'Геолокация операций'
      ],
      color: 'steel',
      keywords: 'запуск проекты учет материалов задачи'
    },
    {
      step: '04',
      title: 'Анализ и оптимизация',
      description: 'Получение детальной аналитики, формирование отчетов, оптимизация процессов на основе данных о производительности.',
      icon: ChartBarIcon,
      features: [
        'Автоматические отчеты',
        'Аналитические дашборды',
        'Прогнозирование затрат',
        'Оптимизация процессов'
      ],
      color: 'earth',
      keywords: 'результаты аналитика эффективность оптимизация'
    }
  ];

  const benefits = [
    {
      number: '3 часа',
      title: 'экономии времени в день',
      description: 'за счет автоматизации рутинных процессов',
      keywords: 'экономия времени автоматизация'
    },
    {
      number: '40%',
      title: 'снижение затрат',
      description: 'благодаря точному учету материалов',
      keywords: 'снижение затрат учет материалов'
    },
    {
      number: '85%',
      title: 'рост производительности',
      description: 'команды за счет четкой координации',
      keywords: 'рост производительности координация команды'
    },
    {
      number: '24/7',
      title: 'доступность данных',
      description: 'с любого устройства в любое время',
      keywords: 'доступность данные облако'
    }
  ];

  return (
    <section 
      className="py-12 sm:py-16 lg:py-24 bg-gradient-to-b from-white to-steel-50 relative overflow-hidden"
      data-seo-track="how_it_works_section_view"
    >
      <div className="absolute inset-0 bg-construction-grid opacity-5"></div>
      
      <div className="container-custom relative z-10 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12 sm:mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-construction-100 to-safety-100 border border-construction-300 rounded-full mb-4 sm:mb-6">
            <CogIcon className="w-3 h-3 sm:w-4 sm:h-4 text-construction-600" />
            <span 
              className="text-construction-800 text-xs sm:text-sm font-semibold"
              data-seo-keyword="как это работает"
            >
              Как это работает
            </span>
          </div>
          
          <h2 
            className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-steel-900 mb-4 sm:mb-6 font-construction"
            data-seo-keyword="внедрение системы управления строительством"
          >
            Простое внедрение <br />
            <span className="bg-gradient-to-r from-construction-600 to-safety-600 bg-clip-text text-transparent">
              за 4 шага
            </span>
          </h2>
          
          <p 
            className="text-sm sm:text-base md:text-lg lg:text-xl text-steel-600 max-w-3xl mx-auto"
            data-seo-keyword="быстрое внедрение CRM строительство"
          >
            От регистрации до получения первых результатов всего за несколько дней
          </p>
        </motion.div>

        <div className="space-y-12 sm:space-y-16 lg:space-y-20 mb-12 sm:mb-16 lg:mb-24">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className={`flex flex-col lg:flex-row items-center gap-8 sm:gap-10 lg:gap-12 ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              data-seo-track="step_card_view"
              data-seo-keyword={step.keywords}
            >
              <div className="flex-1 text-center lg:text-left">
                <div className={`
                  inline-flex items-center gap-2 sm:gap-3 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-4 sm:mb-6
                  ${step.color === 'construction' ? 'bg-construction-100 text-construction-700' : ''}
                  ${step.color === 'safety' ? 'bg-safety-100 text-safety-700' : ''}
                  ${step.color === 'steel' ? 'bg-steel-100 text-steel-700' : ''}
                  ${step.color === 'earth' ? 'bg-earth-100 text-earth-700' : ''}
                `}>
                  <span className="text-sm sm:text-base lg:text-lg font-bold">{step.step}</span>
                  <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-steel-900 mb-4 sm:mb-6">{step.title}</h3>
                <p className="text-sm sm:text-base lg:text-lg text-steel-600 mb-6 sm:mb-8 leading-relaxed">{step.description}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {step.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 sm:gap-3">
                      <div className={`
                        w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full
                        ${step.color === 'construction' ? 'bg-construction-500' : ''}
                        ${step.color === 'safety' ? 'bg-safety-500' : ''}
                        ${step.color === 'steel' ? 'bg-steel-500' : ''}
                        ${step.color === 'earth' ? 'bg-earth-500' : ''}
                      `}></div>
                      <span className="text-steel-700 font-medium text-sm sm:text-base">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 relative">
                <div className={`
                  relative bg-white/90 border-2 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-lg hover:scale-105 transition-all duration-300
                  ${step.color === 'construction' ? 'border-construction-300 hover:shadow-construction' : ''}
                  ${step.color === 'safety' ? 'border-safety-300 hover:shadow-safety' : ''}
                  ${step.color === 'steel' ? 'border-steel-300 hover:shadow-steel' : ''}
                  ${step.color === 'earth' ? 'border-earth-300 hover:shadow-concrete' : ''}
                `}>
                  <div className={`
                    w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 mx-auto
                    ${step.color === 'construction' ? 'bg-gradient-to-br from-construction-500 to-construction-600' : ''}
                    ${step.color === 'safety' ? 'bg-gradient-to-br from-safety-500 to-safety-600' : ''}
                    ${step.color === 'steel' ? 'bg-gradient-to-br from-steel-500 to-steel-600' : ''}
                    ${step.color === 'earth' ? 'bg-gradient-to-br from-earth-500 to-earth-600' : ''}
                  `}>
                    <step.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  
                  <div className="text-center">
                    <div className={`
                      text-3xl sm:text-4xl font-bold mb-2
                      ${step.color === 'construction' ? 'text-construction-600' : ''}
                      ${step.color === 'safety' ? 'text-safety-600' : ''}
                      ${step.color === 'steel' ? 'text-steel-600' : ''}
                      ${step.color === 'earth' ? 'text-earth-600' : ''}
                    `}>
                      {step.step}
                    </div>
                    <div className="text-steel-600 font-medium text-sm sm:text-base">Этап</div>
                  </div>
                </div>

                <div className={`
                  absolute -top-3 -right-3 sm:-top-6 sm:-right-6 w-8 h-8 sm:w-12 sm:h-12 rounded-full blur-xl animate-pulse-construction
                  ${step.color === 'construction' ? 'bg-construction-400/50' : ''}
                  ${step.color === 'safety' ? 'bg-safety-400/50' : ''}
                  ${step.color === 'steel' ? 'bg-steel-400/50' : ''}
                  ${step.color === 'earth' ? 'bg-earth-400/50' : ''}
                `}></div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="bg-gradient-to-r from-construction-600 to-safety-600 rounded-2xl p-6 sm:p-8 lg:p-12 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          data-seo-track="benefits_section_view"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-construction-600/90 to-safety-600/90"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-construction-grid opacity-20"></div>
          
          <div className="relative z-10 text-center mb-8 sm:mb-10 lg:mb-12">
            <h3 
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 font-construction"
              data-seo-keyword="преимущества ProHelper цифры"
            >
              Преимущества в цифрах
            </h3>
            <p className="text-sm sm:text-base lg:text-xl text-white/90 max-w-3xl mx-auto">
              Реальные показатели от наших клиентов, которые уже используют ProHelper
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 relative z-10">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                data-seo-track="benefit_card_view"
                data-seo-keyword={benefit.keywords}
              >
                <div 
                  className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2"
                  data-seo-keyword={benefit.keywords}
                >
                  {benefit.number}
                </div>
                <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-white mb-2">{benefit.title}</h4>
                <p className="text-white/80 text-xs sm:text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks; 