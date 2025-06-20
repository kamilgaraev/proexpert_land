import { motion } from 'framer-motion';
import { 
  UserPlusIcon,
  DevicePhoneMobileIcon, 
  ComputerDesktopIcon,
  ChartBarIcon,
  ArrowRightIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const steps = [
  {
    id: 1,
    title: 'Регистрация и настройка',
    description: 'Владелец организации создает аккаунт, настраивает компанию и создает учетные записи для администраторов.',
    icon: UserPlusIcon,
    details: ['Быстрая регистрация за 2 минуты', 'Настройка профиля компании', 'Создание ролей и прав доступа'],
    color: 'neon-blue',
    gradient: 'from-blue-400 to-cyan-500'
  },
  {
    id: 2,
    title: 'Мобильное приложение',
    description: 'Прорабы получают мобильное приложение для учета материалов и фиксации работ прямо на объекте.',
    icon: DevicePhoneMobileIcon,
    details: ['Скачивание и вход в приложение', 'Учет материалов и работ', 'Работа офлайн с синхронизацией'],
    color: 'neon-green',
    gradient: 'from-green-400 to-emerald-500'
  },
  {
    id: 3,
    title: 'Веб-платформа',
    description: 'Администраторы управляют проектами, контрактами, подрядчиками через удобный веб-интерфейс.',
    icon: ComputerDesktopIcon,
    details: ['Управление всеми проектами', 'Контроль подрядчиков и материалов', 'Финансовое планирование'],
    color: 'neon-purple', 
    gradient: 'from-purple-400 to-violet-500'
  },
  {
    id: 4,
    title: 'Аналитика и отчеты',
    description: 'Получение комплексных отчетов, аналитики по проектам и автоматизация бизнес-процессов.',
    icon: ChartBarIcon,
    details: ['Автоматические отчеты', 'Аналитические дашборды', 'Экспорт в учетные системы'],
    color: 'neon-pink',
    gradient: 'from-pink-400 to-rose-500'
  }
];

const benefits = [
  'Единая система для всех участников проекта',
  'Полная прозрачность процессов',
  'Автоматизация рутинных операций',
  'Реальная экономия времени и денег',
  'Масштабируемость под любой размер компании'
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-slate-900 to-cyber-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-cyber-grid opacity-10"></div>
      
      <div className="absolute top-32 right-10 w-72 h-72 bg-neon-green/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-32 left-10 w-96 h-96 bg-neon-pink/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
      
      <div className="container-custom relative z-10">
        <div className="text-center mb-20">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-neon-green/20 to-neon-blue/20 border border-neon-green/30 backdrop-blur-sm mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-2 h-2 bg-neon-pink rounded-full animate-pulse"></div>
            <span className="text-gray-300 text-sm font-medium">КАК ЭТО РАБОТАЕТ</span>
          </motion.div>
          
          <motion.h2 
            className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Простой путь к
            <span className="block bg-gradient-to-r from-neon-green via-neon-blue to-neon-purple bg-clip-text text-transparent">
              эффективному управлению
            </span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Четыре простых шага от регистрации до полноценного управления всеми строительными процессами
          </motion.p>
        </div>

        <div className="space-y-12 mb-20">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              className="group"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <div className="flex flex-col lg:flex-row items-center gap-12">
                {index % 2 === 0 ? (
                  <>
                    <div className="flex-1">
                      <div className="relative bg-gradient-to-br from-cyber-card/80 to-cyber-accent/80 border border-cyber-border rounded-3xl p-8 backdrop-blur-sm group-hover:shadow-cyber transition-all duration-500">
                        <div className="flex items-center gap-4 mb-6">
                          <div className={`p-4 rounded-2xl bg-gradient-to-br ${step.gradient} shadow-lg`}>
                            <step.icon className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-3xl font-bold text-neon-blue">0{step.id}</span>
                            <div className="w-12 h-0.5 bg-gradient-to-r from-neon-blue to-transparent"></div>
                          </div>
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-neon-blue transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-gray-300 text-lg leading-relaxed mb-6">
                          {step.description}
                        </p>
                        
                        <div className="space-y-3">
                          {step.details.map((detail, detailIndex) => (
                            <div key={detailIndex} className="flex items-center gap-3">
                              <CheckIcon className="w-5 h-5 text-neon-green flex-shrink-0" />
                              <span className="text-gray-400">{detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex justify-center">
                      <div className="relative">
                        <div className="w-80 h-80 bg-gradient-to-br from-cyber-card to-cyber-accent border border-cyber-border rounded-3xl flex items-center justify-center backdrop-blur-sm group-hover:shadow-cyber transition-all duration-500">
                          <div className={`w-32 h-32 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center animate-float`}>
                            <step.icon className="w-16 h-16 text-white" />
                          </div>
                        </div>
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-neon-purple via-neon-blue to-neon-green rounded-3xl blur opacity-20 animate-pulse-slow"></div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1 flex justify-center order-2 lg:order-1">
                      <div className="relative">
                        <div className="w-80 h-80 bg-gradient-to-br from-cyber-card to-cyber-accent border border-cyber-border rounded-3xl flex items-center justify-center backdrop-blur-sm group-hover:shadow-cyber transition-all duration-500">
                          <div className={`w-32 h-32 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center animate-float`}>
                            <step.icon className="w-16 h-16 text-white" />
                          </div>
                        </div>
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-neon-green via-neon-pink to-neon-purple rounded-3xl blur opacity-20 animate-pulse-slow"></div>
                      </div>
                    </div>
                    
                    <div className="flex-1 order-1 lg:order-2">
                      <div className="relative bg-gradient-to-br from-cyber-card/80 to-cyber-accent/80 border border-cyber-border rounded-3xl p-8 backdrop-blur-sm group-hover:shadow-cyber transition-all duration-500">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl font-bold text-neon-green">0{step.id}</span>
                            <div className="w-12 h-0.5 bg-gradient-to-r from-neon-green to-transparent"></div>
                          </div>
                          <div className={`p-4 rounded-2xl bg-gradient-to-br ${step.gradient} shadow-lg`}>
                            <step.icon className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-neon-green transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-gray-300 text-lg leading-relaxed mb-6">
                          {step.description}
                        </p>
                        
                        <div className="space-y-3">
                          {step.details.map((detail, detailIndex) => (
                            <div key={detailIndex} className="flex items-center gap-3">
                              <CheckIcon className="w-5 h-5 text-neon-green flex-shrink-0" />
                              <span className="text-gray-400">{detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {index < steps.length - 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center gap-2">
                    <ArrowRightIcon className="w-6 h-6 text-neon-blue animate-bounce" />
                    <div className="w-24 h-0.5 bg-gradient-to-r from-neon-blue to-neon-purple"></div>
                    <ArrowRightIcon className="w-6 h-6 text-neon-purple animate-bounce" style={{ animationDelay: '0.5s' }} />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="bg-gradient-to-r from-cyber-card/50 to-cyber-accent/50 border border-cyber-border rounded-3xl p-12 backdrop-blur-sm text-center">
            <h3 className="text-3xl font-bold text-white mb-8">
              Почему выбирают ProHelper?
            </h3>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 text-left"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <CheckIcon className="w-6 h-6 text-neon-green flex-shrink-0" />
                  <span className="text-gray-300">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-green via-neon-blue to-neon-purple rounded-3xl blur opacity-20 animate-pulse-slow"></div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks; 