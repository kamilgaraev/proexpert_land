import {
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  DocumentChartBarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CloudArrowUpIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const features = [
  {
    name: 'Мобильное приложение для прорабов',
    description: 'Учет материалов и работ прямо на объекте. Приемка, списание, фиксация выполненных работ с фото. Работает офлайн.',
    icon: DevicePhoneMobileIcon,
    color: 'neon-green',
    gradient: 'from-green-400 to-emerald-500',
  },
  {
    name: 'Веб-платформа для администраторов',
    description: 'Полное управление проектами, контрактами, подрядчиками, материалами. Центральная система контроля всех процессов.',
    icon: ComputerDesktopIcon,
    color: 'neon-blue',
    gradient: 'from-blue-400 to-cyan-500',
  },
  {
    name: 'Управление контрактами',
    description: 'Ведение реестра договоров с заказчиками. Контроль сроков, условий, платежей. Формирование актов выполненных работ.',
    icon: DocumentChartBarIcon,
    color: 'neon-purple',
    gradient: 'from-purple-400 to-violet-500',
  },
  {
    name: 'Управление подрядчиками',
    description: 'Реестр подрядных организаций с оценкой качества. Контроль договоров, выполненных работ и расчетов.',
    icon: UserGroupIcon,
    color: 'neon-pink',
    gradient: 'from-pink-400 to-rose-500',
  },
  {
    name: 'Управление материалами',
    description: 'Справочники материалов с ценами. Контроль поставок, качества, оптимизация закупок и остатков.',
    icon: BuildingOfficeIcon,
    color: 'neon-orange',
    gradient: 'from-orange-400 to-amber-500',
  },
  {
    name: 'Финансовое управление',
    description: 'Учет подотчетных средств, контроль бюджетов проектов, анализ прибыльности, планирование денежных потоков.',
    icon: CurrencyDollarIcon,
    color: 'neon-yellow',
    gradient: 'from-yellow-400 to-amber-500',
  },
  {
    name: 'Аналитика и отчеты',
    description: 'Комплексные отчеты по проектам, материалам, финансам. Аналитические дашборды с ключевыми показателями.',
    icon: ChartBarIcon,
    color: 'neon-blue',
    gradient: 'from-indigo-400 to-blue-500',
  },
  {
    name: 'Облачная синхронизация',
    description: 'Все данные надежно хранятся в облаке. Доступ с любого устройства, автоматическая синхронизация между приложениями.',
    icon: CloudArrowUpIcon,
    color: 'neon-purple',
    gradient: 'from-violet-400 to-purple-500',
  },
  {
    name: 'Безопасность данных',
    description: 'Многоуровневая система безопасности, шифрование данных, резервное копирование, контроль доступа по ролям.',
    icon: ShieldCheckIcon,
    color: 'neon-green',
    gradient: 'from-teal-400 to-green-500',
  }
];

const benefits = [
  {
    title: 'Экономия времени',
    description: 'До 95% сокращение времени на отчеты',
    icon: ClockIcon,
    value: '95%'
  },
  {
    title: 'Снижение затрат',
    description: 'До 40% экономия на материалах',
    icon: CurrencyDollarIcon,
    value: '40%'
  },
  {
    title: 'Контроль качества',
    description: 'Полная прозрачность процессов',
    icon: CheckCircleIcon,
    value: '100%'
  },
  {
    title: 'Автоматизация',
    description: 'Автоматические уведомления и алерты',
    icon: LightBulbIcon,
    value: '24/7'
  }
];

const Features = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-cyber-bg to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-cyber-grid opacity-10"></div>
      
      <div className="absolute top-20 left-10 w-64 h-64 bg-neon-blue/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-neon-purple/10 rounded-full blur-3xl"></div>
      
      <div className="container-custom relative z-10">
        <div className="text-center mb-20">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 border border-neon-purple/30 backdrop-blur-sm mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
            <span className="text-gray-300 text-sm font-medium">ВОЗМОЖНОСТИ ПЛАТФОРМЫ</span>
          </motion.div>
          
          <motion.h2 
            className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Все для управления
            <span className="block bg-gradient-to-r from-neon-pink via-neon-purple to-neon-blue bg-clip-text text-transparent">
              строительными проектами
            </span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Единая экосистема объединяет все аспекты управления: от учета материалов на объекте 
            до финансовой аналитики и контроля подрядчиков
          </motion.p>
        </div>

        <motion.div 
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-20"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.name}
              className="group relative"
              variants={item}
            >
              <div className="relative bg-gradient-to-br from-cyber-card/80 to-cyber-accent/80 border border-cyber-border rounded-2xl p-8 backdrop-blur-sm hover:shadow-cyber transition-all duration-500 hover:scale-105 h-full">
                <div className={`absolute -top-4 -left-4 p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-neon-blue transition-colors">
                    {feature.name}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-neon-purple/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>

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
                Результаты использования ProHelper
              </h3>
              <p className="text-gray-300 text-lg">
                Реальные показатели эффективности наших клиентов
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  className="text-center group"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-pink mb-4 group-hover:shadow-neon-purple transition-all duration-300">
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-neon-green mb-2">
                    {benefit.value}
                  </div>
                  <div className="text-white font-semibold mb-1">
                    {benefit.title}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {benefit.description}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-purple via-neon-blue to-neon-green rounded-3xl blur opacity-20 animate-pulse-slow"></div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features; 