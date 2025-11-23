import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon, PlayIcon } from '@heroicons/react/24/outline';
import { HERO_CONTENT } from '../../constants/landing-content';

const Hero = () => {
  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-construction-200/20 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-safety-200/20 rounded-full blur-3xl translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-steel-100/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
      </div>

      <div className="container-custom relative z-10 px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-steel-200 shadow-sm mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-safety-500 animate-pulse" />
            <span className="text-sm font-medium text-steel-600 tracking-wide uppercase">
              ProHelper ERP
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-tight mb-8"
          >
            {HERO_CONTENT.title.main}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-construction-600 to-safety-600 relative">
              {HERO_CONTENT.title.highlight}
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-safety-400/30 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="text-lg sm:text-xl md:text-2xl text-slate-600 max-w-3xl mb-12 leading-relaxed"
          >
            <span className="font-semibold text-slate-900">{HERO_CONTENT.title.sub}.</span>{' '}
            {HERO_CONTENT.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all duration-300 bg-construction-600 rounded-xl hover:bg-construction-700 hover:shadow-lg hover:shadow-construction-600/25 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-construction-600"
            >
              {HERO_CONTENT.cta.primary}
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
            
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-slate-700 transition-all duration-300 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200"
            >
              <PlayIcon className="w-5 h-5 mr-2 text-safety-600" />
              {HERO_CONTENT.cta.secondary}
            </Link>
          </motion.div>

          {/* Realistic Dashboard UI Preview */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.8, type: "spring" }}
            className="mt-20 relative w-full max-w-6xl aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl border border-slate-200/60 bg-white/50 backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-50 to-white" />
            
            {/* Dashboard Container */}
            <div className="absolute inset-2 sm:inset-3 rounded-xl bg-slate-50/50 border border-slate-200/60 shadow-inner overflow-hidden flex">
              
              {/* Sidebar */}
              <div className="hidden sm:flex w-16 lg:w-64 flex-col border-r border-slate-200 bg-white p-4 gap-6 z-10">
                <div className="h-8 w-8 rounded-lg bg-construction-600/10 flex items-center justify-center mb-2">
                  <div className="h-4 w-4 rounded bg-construction-600" />
                </div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3 opacity-60">
                      <div className="h-6 w-6 rounded-md bg-slate-200" />
                      <div className="hidden lg:block h-3 w-24 rounded-full bg-slate-100" />
                    </div>
                  ))}
                </div>
                <div className="mt-auto pt-4 border-t border-slate-100">
                   <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-200" />
                      <div className="hidden lg:block space-y-1">
                         <div className="h-2 w-20 bg-slate-200 rounded-full" />
                         <div className="h-2 w-12 bg-slate-100 rounded-full" />
                      </div>
                   </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col bg-white/50 overflow-hidden relative">
                
                {/* Top Navigation */}
                <div className="h-16 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm flex items-center justify-between px-6 sm:px-8 sticky top-0 z-20">
                  <div className="h-4 w-32 bg-slate-200 rounded-full" />
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-100" />
                    <div className="h-8 w-8 rounded-full bg-slate-100" />
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 sm:p-8 space-y-6 overflow-y-auto no-scrollbar">
                  
                  {/* Stats Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    {[
                      { color: 'bg-construction-500', value: '12', label: 'Проектов' },
                      { color: 'bg-safety-500', value: '₽ 4.2M', label: 'Бюджет' },
                      { color: 'bg-blue-500', value: '85%', label: 'План' },
                    ].map((stat, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 + i * 0.1 }}
                        className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="h-2 w-20 bg-slate-100 rounded-full" />
                          <div className={`w-2 h-2 rounded-full ${stat.color}`} />
                        </div>
                        <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chart Section */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.5 }}
                      className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-6 h-64 flex flex-col"
                    >
                      <div className="flex justify-between items-center mb-auto">
                         <div className="h-4 w-32 bg-slate-100 rounded-full" />
                         <div className="flex gap-2">
                            <div className="h-6 w-16 bg-slate-50 rounded-lg" />
                         </div>
                      </div>
                      {/* Bar Chart Visualization */}
                      <div className="flex items-end justify-between gap-2 h-32 sm:h-40 px-2 mt-4">
                         {[35, 55, 45, 70, 50, 65, 85, 60, 75, 90, 65, 80].map((h, i) => (
                            <motion.div 
                              key={i}
                              initial={{ height: 0 }}
                              animate={{ height: `${h}%` }}
                              transition={{ duration: 1, delay: 1.6 + i * 0.05, type: "spring" }}
                              className="w-full bg-construction-100 rounded-t-sm relative group"
                            >
                               <div className="absolute bottom-0 left-0 right-0 h-full bg-construction-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-sm" />
                            </motion.div>
                         ))}
                      </div>
                    </motion.div>

                    {/* Recent Activity List */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.7 }}
                      className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 h-64 flex flex-col"
                    >
                       <div className="h-4 w-24 bg-slate-100 rounded-full mb-6 shrink-0" />
                       <div className="space-y-4 overflow-hidden">
                         {[1, 2, 3, 4].map((i) => (
                           <div key={i} className="flex items-center gap-3">
                             <div className={`w-8 h-8 rounded-lg shrink-0 ${i % 2 === 0 ? 'bg-safety-50' : 'bg-blue-50'}`} />
                             <div className="space-y-2 flex-1">
                               <div className="h-2 w-3/4 bg-slate-100 rounded-full" />
                               <div className="h-1.5 w-1/2 bg-slate-50 rounded-full" />
                             </div>
                           </div>
                         ))}
                       </div>
                    </motion.div>
                  </div>

                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Hero;
