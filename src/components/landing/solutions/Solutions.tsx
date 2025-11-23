import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SOLUTIONS } from '../../../constants/landing-content';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const Solutions = () => {
  const [activeTab, setActiveTab] = useState(SOLUTIONS[0].id);

  return (
    <section className="py-24 bg-slate-50">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Решения под ваши задачи</h2>
          <p className="text-lg text-slate-600">
            ProHelper адаптируется под специфику вашего бизнеса, будь то генподряд или поставка материалов.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Navigation Tabs */}
          <div className="lg:col-span-4 flex flex-col gap-2">
            {SOLUTIONS.map((solution) => {
              const Icon = solution.icon;
              const isActive = activeTab === solution.id;
              
              return (
                <button
                  key={solution.id}
                  onClick={() => setActiveTab(solution.id)}
                  className={`group flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200 border-2 ${
                    isActive 
                      ? 'bg-white border-construction-500 shadow-md' 
                      : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                    isActive ? 'bg-construction-50 text-construction-600' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-50 group-hover:text-slate-600'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className={`font-semibold transition-colors ${isActive ? 'text-construction-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
                      {solution.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {SOLUTIONS.map((solution) => {
                if (solution.id !== activeTab) return null;
                
                return (
                  <motion.div
                    key={solution.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8"
                  >
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                      {/* Problem */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-red-600 font-medium mb-2">
                          <ExclamationTriangleIcon className="w-5 h-5" />
                          Проблема
                        </div>
                        <p className="text-lg text-slate-800 leading-relaxed">
                          "{solution.problem}"
                        </p>
                      </div>

                      {/* Solution */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-green-600 font-medium mb-2">
                          <CheckCircleIcon className="w-5 h-5" />
                          Решение
                        </div>
                        <p className="text-lg text-slate-800 leading-relaxed">
                          {solution.solution}
                        </p>
                      </div>
                    </div>

                    {/* Recommended Stack */}
                    <div className="pt-8 border-t border-slate-100">
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                        Рекомендуемый стек модулей
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {solution.recommendedModules.map((module) => (
                          <span 
                            key={module}
                            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700"
                          >
                            {module}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Solutions;

