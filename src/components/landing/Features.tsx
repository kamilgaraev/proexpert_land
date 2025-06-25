import { motion } from 'framer-motion';
import { 
  DevicePhoneMobileIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  UserGroupIcon,
  CloudIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ClockIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  TruckIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const Features = () => {
  const features = [
    {
      icon: DevicePhoneMobileIcon,
      title: 'Мобильный учёт материалов',
      description: 'Прорабы ведут учёт материалов и работ прямо с телефона на объекте. Сканирование QR-кодов, фотофиксация, геолокация.',
      color: 'construction',
      stats: 'Экономия 3 часа в день',
      keywords: 'мобильный учет материалов строительство'
    },
    {
      icon: ClipboardDocumentListIcon,
      title: 'Управление задачами',
      description: 'Создание, назначение и контроль выполнения задач. Уведомления и дедлайны для всех участников проекта.',
      color: 'safety',
      stats: '+85% производительность',
      keywords: 'управление задачами строительство CRM'
    },
    {
      icon: ChartBarIcon,
      title: 'Аналитика и отчеты',
      description: 'Детальная аналитика по проектам, затратам, срокам. Автоматическое формирование отчетов для руководства.',
      color: 'steel',
      stats: '95% точность прогнозов',
      keywords: 'аналитика строительство отчеты проекты'
    },
    {
      icon: UserGroupIcon,
      title: 'Управление командой',
      description: 'Ролевая модель доступа, управление правами пользователей, координация работы всех участников.',
      color: 'earth',
      stats: 'До 50 пользователей',
      keywords: 'управление командой строители прораб'
    },
    {
      icon: CloudIcon,
      title: 'Облачное хранение',
      description: 'Все данные в облаке с резервным копированием. Доступ к информации 24/7 с любого устройства.',
      color: 'primary',
      stats: '99.9% надежность',
      keywords: 'облачное хранение данные строительство'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Безопасность данных',
      description: 'Шифрование данных, двухфакторная аутентификация, регулярные аудиты безопасности.',
      color: 'concrete',
      stats: 'SSL + 2FA защита',
      keywords: 'безопасность данных строительство защита'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Финансовый контроль',
      description: 'Контроль бюджета проектов, отслеживание затрат, планирование расходов на материалы и работы.',
      color: 'construction',
      stats: '40% экономия бюджета',
      keywords: 'финансовый контроль строительство бюджет'
    },
    {
      icon: ClockIcon,
      title: 'Контроль сроков',
      description: 'Планирование этапов строительства, контроль дедлайнов, оптимизация рабочих процессов.',
      color: 'safety',
      stats: 'Сроки соблюдаются',
      keywords: 'контроль сроков строительство планирование'
    },
    {
      icon: DocumentTextIcon,
      title: 'Документооборот',
      description: 'Цифровой документооборот, электронные подписи, автоматическое формирование актов и справок.',
      color: 'steel',
      stats: 'Без бумажной работы',
      keywords: 'документооборот строительство электронные документы'
    }
  ];

  const results = [
    {
      icon: WrenchScrewdriverIcon,
      title: 'Повышение эффективности',
      description: 'Автоматизация рутинных процессов позволяет сосредоточиться на ключевых задачах',
      percentage: '85%',
      color: 'construction',
      keywords: 'автоматизация строительство эффективность'
    },
    {
      icon: TruckIcon,
      title: 'Экономия ресурсов',
      description: 'Точный учет материалов и оптимизация поставок снижают избыточные затраты',
      percentage: '40%',
      color: 'safety',
      keywords: 'экономия ресурсов учет материалов'
    },
    {
      icon: BuildingOfficeIcon,
      title: 'Ускорение проектов',
      description: 'Координация всех участников в одной системе ускоряет реализацию проектов',
      percentage: '60%',
      color: 'steel',
      keywords: 'ускорение проектов координация строительство'
    }
  ];

  return (
    <section 
      className="py-24 bg-gradient-to-b from-steel-50 to-concrete-100 relative overflow-hidden"
      data-seo-track="features_section_view"
    >
      <div className="absolute inset-0 bg-blueprint opacity-20"></div>
      
      <div className="container-custom relative z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-construction-100 to-safety-100 border border-construction-300 rounded-full mb-6">
            <WrenchScrewdriverIcon className="w-4 h-4 text-construction-600" />
            <span 
              className="text-construction-800 text-sm font-semibold"
              data-seo-keyword="возможности платформы"
            >
              Возможности платформы
            </span>
          </div>
          
          <h2 
            className="text-4xl md:text-6xl font-bold text-steel-900 mb-6 font-construction"
            data-seo-keyword="управление строительством"
          >
            Всё для управления <br />
            <span className="bg-gradient-to-r from-construction-600 to-safety-600 bg-clip-text text-transparent">
              строительством
            </span>
          </h2>
          
          <p 
            className="text-xl text-steel-600 max-w-3xl mx-auto"
            data-seo-keyword="система управления строительными проектами"
          >
            Комплексная система управления строительными проектами от планирования до сдачи объекта
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              data-seo-track="feature_card_view"
              data-seo-keyword={feature.keywords}
            >
              <div className={`
                bg-white/90 border-2 rounded-xl p-8 backdrop-blur-sm transition-all duration-300 
                hover:scale-105 hover:shadow-${feature.color} group-hover:border-${feature.color}-400
                ${feature.color === 'construction' ? 'border-construction-200' : ''}
                ${feature.color === 'safety' ? 'border-safety-200' : ''}
                ${feature.color === 'steel' ? 'border-steel-200' : ''}
                ${feature.color === 'earth' ? 'border-earth-200' : ''}
                ${feature.color === 'primary' ? 'border-primary-200' : ''}
                ${feature.color === 'concrete' ? 'border-concrete-200' : ''}
              `}>
                <div className={`
                  w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:animate-build
                  ${feature.color === 'construction' ? 'bg-gradient-to-br from-construction-500 to-construction-600' : ''}
                  ${feature.color === 'safety' ? 'bg-gradient-to-br from-safety-500 to-safety-600' : ''}
                  ${feature.color === 'steel' ? 'bg-gradient-to-br from-steel-500 to-steel-600' : ''}
                  ${feature.color === 'earth' ? 'bg-gradient-to-br from-earth-500 to-earth-600' : ''}
                  ${feature.color === 'primary' ? 'bg-gradient-to-br from-primary-500 to-primary-600' : ''}
                  ${feature.color === 'concrete' ? 'bg-gradient-to-br from-concrete-500 to-concrete-600' : ''}
                `}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 
                  className="text-xl font-semibold text-steel-900 mb-4"
                  data-seo-keyword={feature.keywords}
                >
                  {feature.title}
                </h3>
                <p className="text-steel-600 mb-4 leading-relaxed">{feature.description}</p>
                
                <div className={`
                  inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium
                  ${feature.color === 'construction' ? 'bg-construction-100 text-construction-700' : ''}
                  ${feature.color === 'safety' ? 'bg-safety-100 text-safety-700' : ''}
                  ${feature.color === 'steel' ? 'bg-steel-100 text-steel-700' : ''}
                  ${feature.color === 'earth' ? 'bg-earth-100 text-earth-700' : ''}
                  ${feature.color === 'primary' ? 'bg-primary-100 text-primary-700' : ''}
                  ${feature.color === 'concrete' ? 'bg-concrete-100 text-concrete-700' : ''}
                `}>
                  {feature.stats}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="bg-gradient-to-r from-construction-600 to-safety-600 rounded-2xl p-12 text-center relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          data-seo-track="results_section_view"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-construction-600/90 to-safety-600/90"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-construction-grid opacity-20"></div>
          
          <div className="relative z-10">
            <h3 
              className="text-3xl md:text-4xl font-bold text-white mb-6 font-construction"
              data-seo-keyword="результаты внедрения ProHelper"
            >
              Результаты внедрения ProHelper
            </h3>
            
            <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto">
              Реальные показатели эффективности от наших клиентов
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {results.map((result, index) => (
                <motion.div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  data-seo-track="result_card_view"
                  data-seo-keyword={result.keywords}
                >
                  <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto
                    ${result.color === 'construction' ? 'bg-construction-500/20' : ''}
                    ${result.color === 'safety' ? 'bg-safety-500/20' : ''}
                    ${result.color === 'steel' ? 'bg-steel-500/20' : ''}
                  `}>
                    <result.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="text-3xl font-bold text-white mb-2">{result.percentage}</div>
                  <h4 className="text-lg font-semibold text-white mb-2">{result.title}</h4>
                  <p className="text-white/80 text-sm">{result.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features; 