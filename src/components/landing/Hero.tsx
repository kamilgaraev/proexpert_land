import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  DevicePhoneMobileIcon, 
  ComputerDesktopIcon, 
  CloudIcon,
  ArrowRightIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

const Hero = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-bg via-slate-900 to-cyber-card relative overflow-hidden">
      <div className="absolute inset-0 bg-cyber-grid opacity-20"></div>
      
      <div className="absolute top-10 left-10 w-72 h-72 bg-neon-purple/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-neon-blue/20 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-pink/10 rounded-full blur-3xl animate-pulse-slow delay-2000"></div>

      <div className="relative z-10 pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div className="container-custom">
          <div className="text-center max-w-6xl mx-auto">
            
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 border border-neon-purple/30 backdrop-blur-sm mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
              <span className="text-gray-300 text-sm font-medium">SaaS-решение для строительства</span>
            </motion.div>

            <motion.h1 
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <span className="block">Управление</span>
              <span className="block bg-gradient-to-r from-neon-pink via-neon-purple to-neon-blue bg-clip-text text-transparent animate-glow">
                строительными
              </span>
              <span className="block">проектами</span>
            </motion.h1>

            <motion.p 
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Единая экосистема для строительных компаний: от учета материалов на объекте 
              до финансовой отчетности. Объединяем прорабов, администраторов и владельцев в одной платформе.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Link
                to="/register"
                className="group relative px-8 py-4 bg-gradient-to-r from-neon-purple to-neon-pink rounded-lg text-white font-semibold text-lg hover:shadow-neon-purple transition-all duration-300 transform hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Начать бесплатно
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-pink rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
              </Link>
              
              <button className="flex items-center gap-3 px-8 py-4 border border-gray-600 rounded-lg text-gray-300 font-semibold text-lg hover:border-neon-blue hover:text-neon-blue transition-all duration-300 backdrop-blur-sm">
                <PlayIcon className="w-5 h-5" />
                Смотреть демо
              </button>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <div className="group relative">
                <div className="bg-gradient-to-br from-cyber-card to-cyber-accent border border-cyber-border rounded-xl p-6 backdrop-blur-sm hover:shadow-cyber transition-all duration-300 hover:scale-105">
                  <DevicePhoneMobileIcon className="w-12 h-12 text-neon-green mb-4 group-hover:animate-bounce" />
                  <h3 className="text-xl font-semibold text-white mb-2">Мобильное приложение</h3>
                  <p className="text-gray-400">Для прорабов - учет материалов и работ прямо на объекте</p>
                </div>
              </div>

              <div className="group relative">
                <div className="bg-gradient-to-br from-cyber-card to-cyber-accent border border-cyber-border rounded-xl p-6 backdrop-blur-sm hover:shadow-cyber transition-all duration-300 hover:scale-105">
                  <ComputerDesktopIcon className="w-12 h-12 text-neon-blue mb-4 group-hover:animate-bounce" />
                  <h3 className="text-xl font-semibold text-white mb-2">Веб-платформа</h3>
                  <p className="text-gray-400">Для администраторов - полное управление проектами</p>
                </div>
              </div>

              <div className="group relative">
                <div className="bg-gradient-to-br from-cyber-card to-cyber-accent border border-cyber-border rounded-xl p-6 backdrop-blur-sm hover:shadow-cyber transition-all duration-300 hover:scale-105">
                  <CloudIcon className="w-12 h-12 text-neon-purple mb-4 group-hover:animate-bounce" />
                  <h3 className="text-xl font-semibold text-white mb-2">Облачная синхронизация</h3>
                  <p className="text-gray-400">Все данные в реальном времени доступны всем участникам</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.9 }}
            >
              <div className="relative bg-gradient-to-br from-cyber-card/50 to-cyber-accent/50 border border-cyber-border rounded-2xl p-8 backdrop-blur-sm">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-neon-green mb-2">95%</div>
                    <div className="text-gray-400 text-sm">Экономия времени на отчеты</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-neon-blue mb-2">40%</div>
                    <div className="text-gray-400 text-sm">Снижение затрат на материалы</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-neon-purple mb-2">24/7</div>
                    <div className="text-gray-400 text-sm">Мониторинг проектов</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-neon-pink mb-2">100+</div>
                    <div className="text-gray-400 text-sm">Довольных клиентов</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-purple via-neon-blue to-neon-green rounded-2xl blur opacity-30 animate-pulse-slow"></div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-purple to-transparent"></div>
    </div>
  );
};

export default Hero; 