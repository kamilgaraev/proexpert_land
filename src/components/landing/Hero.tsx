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

          {/* Abstract UI Preview Animation */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.8, type: "spring" }}
            className="mt-20 relative w-full max-w-5xl aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl border border-slate-200/60 bg-white/50 backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-50 to-white" />
            
            {/* Mock UI Elements */}
            <div className="absolute inset-2 rounded-xl bg-white border border-slate-100 shadow-inner overflow-hidden p-4">
              {/* Header Mock */}
              <div className="h-12 border-b border-slate-100 flex items-center justify-between px-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                  <div className="w-3 h-3 rounded-full bg-green-400/60" />
                </div>
                <div className="w-32 h-4 bg-slate-100 rounded-full" />
              </div>

              {/* Content Grid Mock */}
              <div className="grid grid-cols-12 gap-4 h-[calc(100%-3rem)]">
                {/* Sidebar */}
                <div className="col-span-2 hidden sm:block h-full bg-slate-50/50 rounded-lg" />
                
                {/* Main Content */}
                <div className="col-span-12 sm:col-span-10 grid grid-cols-3 gap-4">
                  <motion.div 
                    className="col-span-2 h-40 bg-construction-50/50 rounded-lg border border-construction-100/50"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div 
                    className="col-span-1 h-40 bg-safety-50/50 rounded-lg border border-safety-100/50"
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  />
                  <div className="col-span-3 h-64 bg-white rounded-lg border border-slate-100 shadow-sm mt-2" />
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
