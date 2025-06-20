import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  DevicePhoneMobileIcon, 
  ComputerDesktopIcon, 
  CloudIcon,
  ArrowRightIcon,
  PlayIcon,
  WrenchScrewdriverIcon,
  BuildingOfficeIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import useAnalytics from '../../hooks/useAnalytics';

const Hero = () => {
  const { trackButtonClick } = useAnalytics();

  const handleStartFreeClick = () => {
    trackButtonClick('start_free', 'hero_section');
  };

  const handleWatchDemoClick = () => {
    trackButtonClick('watch_demo', 'hero_section');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-concrete-50 via-concrete-100 to-steel-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-construction-grid opacity-30"></div>
      
      <div className="absolute top-10 left-10 w-72 h-72 bg-construction-500/20 rounded-full blur-3xl animate-pulse-construction"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-safety-500/20 rounded-full blur-3xl animate-pulse-construction delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-steel-500/10 rounded-full blur-3xl animate-pulse-construction delay-2000"></div>

      <div className="relative z-10 pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div className="container-custom">
          <div className="text-center max-w-6xl mx-auto">
            
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-construction-100 to-safety-100 border border-construction-300 backdrop-blur-sm mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <WrenchScrewdriverIcon className="w-4 h-4 text-construction-600" />
              <span className="text-construction-800 text-sm font-semibold">Цифровые решения для строительства</span>
            </motion.div>

            <motion.h1 
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-steel-900 mb-8 leading-tight font-construction"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <span className="block">Управление</span>
              <span className="block bg-gradient-to-r from-construction-600 via-construction-500 to-safety-600 bg-clip-text text-transparent">
                строительными
              </span>
              <span className="block">проектами</span>
            </motion.h1>

            <motion.p 
              className="text-xl md:text-2xl text-steel-700 mb-12 max-w-4xl mx-auto leading-relaxed"
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
                onClick={handleStartFreeClick}
                className="group relative px-8 py-4 bg-gradient-to-r from-construction-600 to-construction-500 rounded-lg text-white font-semibold text-lg hover:shadow-construction transition-all duration-300 transform hover:scale-105 border border-construction-600"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Начать бесплатно
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              
              <button 
                onClick={handleWatchDemoClick}
                className="flex items-center gap-3 px-8 py-4 border-2 border-steel-400 rounded-lg text-steel-700 font-semibold text-lg hover:border-construction-500 hover:text-construction-600 transition-all duration-300 backdrop-blur-sm bg-white/50"
              >
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
                <div className="bg-white/80 border-2 border-construction-200 rounded-xl p-6 backdrop-blur-sm hover:shadow-construction transition-all duration-300 hover:scale-105 hover:border-construction-400">
                  <div className="w-12 h-12 bg-gradient-to-br from-construction-500 to-construction-600 rounded-lg flex items-center justify-center mb-4 group-hover:animate-build">
                    <DevicePhoneMobileIcon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-steel-900 mb-2">Мобильное приложение</h3>
                  <p className="text-steel-600">Для прорабов - учет материалов и работ прямо на объекте</p>
                </div>
              </div>

              <div className="group relative">
                <div className="bg-white/80 border-2 border-safety-200 rounded-xl p-6 backdrop-blur-sm hover:shadow-safety transition-all duration-300 hover:scale-105 hover:border-safety-400">
                  <div className="w-12 h-12 bg-gradient-to-br from-safety-500 to-safety-600 rounded-lg flex items-center justify-center mb-4 group-hover:animate-build">
                    <ComputerDesktopIcon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-steel-900 mb-2">Веб-платформа</h3>
                  <p className="text-steel-600">Для администраторов - полное управление проектами</p>
                </div>
              </div>

              <div className="group relative">
                <div className="bg-white/80 border-2 border-steel-200 rounded-xl p-6 backdrop-blur-sm hover:shadow-steel transition-all duration-300 hover:scale-105 hover:border-steel-400">
                  <div className="w-12 h-12 bg-gradient-to-br from-steel-500 to-steel-600 rounded-lg flex items-center justify-center mb-4 group-hover:animate-build">
                    <CloudIcon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-steel-900 mb-2">Облачная синхронизация</h3>
                  <p className="text-steel-600">Все данные в реальном времени доступны всем участникам</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.9 }}
            >
              <div className="relative bg-white/90 border-2 border-construction-300 rounded-2xl p-8 backdrop-blur-sm shadow-construction">
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-construction-500 rounded-full"></div>
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-safety-500 rounded-full"></div>
                <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-steel-500 rounded-full"></div>
                <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-construction-500 rounded-full"></div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-construction-600 mb-2">95%</div>
                    <div className="text-steel-600 text-sm">Экономия времени на отчеты</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-safety-600 mb-2">40%</div>
                    <div className="text-steel-600 text-sm">Снижение затрат на материалы</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-steel-600 mb-2">24/7</div>
                    <div className="text-steel-600 text-sm">Мониторинг проектов</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-construction-600 mb-2">100+</div>
                    <div className="text-steel-600 text-sm">Довольных клиентов</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="mt-16 flex justify-center items-center gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
            >
              <div className="flex items-center gap-4 text-steel-600">
                <BuildingOfficeIcon className="w-8 h-8 text-construction-500 animate-crane" />
                <span className="font-medium">Стройте будущее с ProHelper</span>
                <TruckIcon className="w-8 h-8 text-safety-500 animate-float" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-construction-500 via-safety-500 to-steel-500"></div>
    </div>
  );
};

export default Hero; 