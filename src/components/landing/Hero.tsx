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
import { seoTracker } from '../../utils/seoTracking';

const Hero = () => {
  const { trackButtonClick } = useAnalytics();

  const handleStartFreeClick = () => {
    trackButtonClick('start_free', 'hero_section');
    seoTracker.trackCTAClick('Начать бесплатно', 'hero_main');
    seoTracker.trackBusinessGoal('REGISTRATION_INTENT');
  };

  const handleWatchDemoClick = () => {
    trackButtonClick('watch_demo', 'hero_section');
    seoTracker.trackCTAClick('Смотреть демо', 'hero_secondary');
  };

  const handleKeywordClick = (keyword: string) => {
    seoTracker.trackKeywordClick(keyword, 'hero_text');
  };

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-concrete-50 via-concrete-100 to-steel-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-construction-grid opacity-30"></div>
      
      <div className="absolute top-4 left-4 sm:top-10 sm:left-10 w-32 h-32 sm:w-72 sm:h-72 bg-construction-500/20 rounded-full blur-3xl animate-pulse-construction"></div>
      <div className="absolute bottom-4 right-4 sm:bottom-10 sm:right-10 w-48 h-48 sm:w-96 sm:h-96 bg-safety-500/20 rounded-full blur-3xl animate-pulse-construction delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 sm:w-[600px] sm:h-[600px] bg-steel-500/10 rounded-full blur-3xl animate-pulse-construction delay-2000"></div>

      <div className="relative z-10 pt-20 pb-8 sm:pt-24 sm:pb-12 lg:pt-32 lg:pb-16">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-6xl mx-auto">
            
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-construction-100 to-safety-100 border border-construction-300 backdrop-blur-sm mb-4 sm:mb-6 lg:mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              data-seo-track="hero_badge"
            >
              <WrenchScrewdriverIcon className="w-3 h-3 sm:w-4 sm:h-4 text-construction-600" />
              <span className="text-construction-800 text-xs sm:text-sm font-semibold">
                Умная платформа для <span 
                  className="cursor-pointer hover:text-construction-600" 
                  onClick={() => handleKeywordClick('автоматизация строительства')}
                  data-seo-track="keyword_automation"
                >автоматизации строительства</span>
              </span>
            </motion.div>

            <motion.h1 
              className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-steel-900 mb-4 sm:mb-6 lg:mb-8 leading-tight font-construction"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              data-seo-track="main_headline"
            >
              <span className="block">
                <span 
                  className="cursor-pointer hover:text-construction-600"
                  onClick={() => handleKeywordClick('учет материалов')}
                  data-seo-track="keyword_materials"
                >Учет материалов</span> и
              </span>
              <span className="block bg-gradient-to-r from-construction-600 via-construction-500 to-safety-600 bg-clip-text text-transparent">
                <span 
                  className="cursor-pointer"
                  onClick={() => handleKeywordClick('управление проектами')}
                  data-seo-track="keyword_management"
                >управление проектами</span>
              </span>
              <span className="block">для строителей</span>
            </motion.h1>

            <motion.p 
              className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-steel-700 mb-6 sm:mb-8 lg:mb-12 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              data-seo-track="hero_description"
            >
              ProHelper объединяет <span 
                className="font-semibold text-construction-600 cursor-pointer hover:text-construction-700" 
                onClick={() => handleKeywordClick('учет материалов на стройке')}
                data-seo-track="keyword_site_materials"
              >учет материалов на стройке</span>, <span 
                className="font-semibold text-safety-600 cursor-pointer hover:text-safety-700"
                onClick={() => handleKeywordClick('контроль работ')}
                data-seo-track="keyword_work_control"
              >контроль работ</span>, координацию команд и финансовую отчетность в одной платформе.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 justify-center items-stretch sm:items-center mb-8 sm:mb-12 lg:mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              data-seo-track="hero_cta_section"
            >
              <Link
                to="/register"
                onClick={handleStartFreeClick}
                className="group relative px-6 py-3 sm:px-7 sm:py-3.5 lg:px-8 lg:py-4 bg-gradient-to-r from-construction-600 to-construction-500 rounded-lg text-white font-semibold text-sm sm:text-base lg:text-lg hover:shadow-construction transition-all duration-300 transform hover:scale-105 border border-construction-600"
                data-seo-track="cta_register"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Начать бесплатно
                  <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              
              <button 
                onClick={handleWatchDemoClick}
                className="flex items-center justify-center gap-2 sm:gap-3 px-6 py-3 sm:px-7 sm:py-3.5 lg:px-8 lg:py-4 border-2 border-steel-400 rounded-lg text-steel-700 font-semibold text-sm sm:text-base lg:text-lg hover:border-construction-500 hover:text-construction-600 transition-all duration-300 backdrop-blur-sm bg-white/50"
                data-seo-track="cta_demo"
              >
                <PlayIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                Смотреть демо
              </button>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              data-seo-track="hero_features"
            >
              <div className="group relative" data-seo-track="feature_mobile">
                <div className="bg-white/80 border-2 border-construction-200 rounded-xl p-4 sm:p-5 lg:p-6 backdrop-blur-sm hover:shadow-construction transition-all duration-300 hover:scale-105 hover:border-construction-400 h-full flex flex-col">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-construction-500 to-construction-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:animate-build">
                    <DevicePhoneMobileIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-steel-900 mb-2">
                    <span 
                      className="cursor-pointer hover:text-construction-600"
                      onClick={() => handleKeywordClick('мобильное приложение для прораба')}
                    >Мобильное приложение</span>
                  </h3>
                  <p className="text-steel-600 text-sm sm:text-base flex-grow">Для прорабов - учет материалов и работ прямо на объекте с QR-сканером</p>
                </div>
              </div>

              <div className="group relative" data-seo-track="feature_web">
                <div className="bg-white/80 border-2 border-safety-200 rounded-xl p-4 sm:p-5 lg:p-6 backdrop-blur-sm hover:shadow-safety transition-all duration-300 hover:scale-105 hover:border-safety-400 h-full flex flex-col">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-safety-500 to-safety-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:animate-build">
                    <ComputerDesktopIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-steel-900 mb-2">
                    <span 
                      className="cursor-pointer hover:text-safety-600"
                      onClick={() => handleKeywordClick('CRM для строителей')}
                    >CRM для строителей</span>
                  </h3>
                  <p className="text-steel-600 text-sm sm:text-base flex-grow">Для администраторов - полное управление проектами и контроль бюджета</p>
                </div>
              </div>

              <div className="group relative sm:col-span-2 lg:col-span-1" data-seo-track="feature_sync">
                <div className="bg-white/80 border-2 border-steel-200 rounded-xl p-4 sm:p-5 lg:p-6 backdrop-blur-sm hover:shadow-steel transition-all duration-300 hover:scale-105 hover:border-steel-400 h-full flex flex-col">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-steel-500 to-steel-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:animate-build">
                    <CloudIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-steel-900 mb-2">
                    <span 
                      className="cursor-pointer hover:text-steel-600"
                      onClick={() => handleKeywordClick('синхронизация данных стройка')}
                    >Облачная синхронизация</span>
                  </h3>
                  <p className="text-steel-600 text-sm sm:text-base flex-grow">Все данные в реальном времени доступны всем участникам проекта</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.9 }}
              data-seo-track="hero_stats"
            >
              <div className="relative bg-white/90 border-2 border-construction-300 rounded-2xl p-4 sm:p-6 lg:p-8 backdrop-blur-sm shadow-construction">
                <div className="absolute -top-1 -left-1 sm:-top-2 sm:-left-2 lg:-top-4 lg:-left-4 w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-construction-500 rounded-full"></div>
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 lg:-top-4 lg:-right-4 w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-safety-500 rounded-full"></div>
                <div className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 lg:-bottom-4 lg:-left-4 w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-steel-500 rounded-full"></div>
                <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 lg:-bottom-4 lg:-right-4 w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-construction-500 rounded-full"></div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 text-center">
                  <div data-seo-track="stat_efficiency">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-construction-600 mb-1 sm:mb-2">40%</div>
                    <div className="text-steel-600 text-xs sm:text-sm">Повышение эффективности проектов</div>
                  </div>
                  <div data-seo-track="stat_materials">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-safety-600 mb-1 sm:mb-2">30%</div>
                    <div className="text-steel-600 text-xs sm:text-sm">Экономия на материалах</div>
                  </div>
                  <div data-seo-track="stat_monitoring">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-steel-600 mb-1 sm:mb-2">24/7</div>
                    <div className="text-steel-600 text-xs sm:text-sm">Мониторинг проектов</div>
                  </div>
                  <div data-seo-track="stat_clients">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-construction-600 mb-1 sm:mb-2">200+</div>
                    <div className="text-steel-600 text-xs sm:text-sm">Довольных клиентов</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="mt-8 sm:mt-12 lg:mt-16 flex justify-center items-center gap-3 sm:gap-4 lg:gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              data-seo-track="hero_footer"
            >
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 text-steel-600">
                <BuildingOfficeIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-construction-500 animate-crane" />
                <span className="font-medium text-xs sm:text-sm lg:text-base">
                  <span 
                    className="cursor-pointer hover:text-construction-600"
                    onClick={() => handleKeywordClick('цифровизация строительства')}
                  >Цифровизируйте</span> строительство с ProHelper
                </span>
                <TruckIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-safety-500 animate-float" />
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