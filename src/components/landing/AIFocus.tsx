import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, ChatBubbleLeftRightIcon, BoltIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { AI_BLOCK } from '../../constants/landing-content';

const AIFocus = () => {
  const [typingIndex, setTypingIndex] = useState(0);
  const [showResponse, setShowResponse] = useState(false);
  
  const queryText = "Сколько бетона залили на прошлой неделе?";
  const responseText = "По проекту ЖК 'Северный' залито 450 м³ бетона марки М300. Это на 12% больше плана. Рисков по срокам нет.";

  useEffect(() => {
    if (typingIndex < queryText.length) {
      const timeout = setTimeout(() => {
        setTypingIndex(prev => prev + 1);
      }, 50);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setShowResponse(true);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [typingIndex]);

  const icons = [
    ChatBubbleLeftRightIcon,
    BoltIcon,
    DocumentDuplicateIcon,
    SparklesIcon
  ];

  return (
    <section className="py-24 bg-slate-900 overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[100px]" />
      </div>

      <div className="container-custom relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-6">
              <SparklesIcon className="w-4 h-4" />
              {AI_BLOCK.status}
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              ProHelper <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">AI</span>
              <br />
              <span className="text-slate-400 text-2xl sm:text-3xl font-medium">Ваш цифровой инженер ПТО</span>
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-8 mb-8">
              {AI_BLOCK.features.map((feature, idx) => {
                const Icon = icons[idx] || SparklesIcon;
                return (
                  <div key={idx} className="space-y-2">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-violet-400">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-white font-semibold">{feature.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-2xl font-bold text-white">{AI_BLOCK.price}</span>
              <button className="px-6 py-3 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-colors">
                Попробовать Demo
              </button>
            </div>
          </motion.div>

          {/* Chat Interface Simulation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl blur opacity-30" />
            <div className="relative bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl">
              {/* Header */}
              <div className="flex items-center gap-4 border-b border-slate-800 pb-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold">
                  AI
                </div>
                <div>
                  <div className="text-white font-medium">ProHelper Assistant</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Online
                  </div>
                </div>
              </div>

              {/* Chat Area */}
              <div className="space-y-6 h-[300px] overflow-hidden font-mono text-sm">
                {/* User Message */}
                <div className="flex gap-4 flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                    U
                  </div>
                  <div className="bg-slate-800 rounded-2xl rounded-tr-sm p-4 max-w-[80%] text-slate-200">
                    {queryText.slice(0, typingIndex)}
                    <span className="animate-pulse">|</span>
                  </div>
                </div>

                {/* AI Response */}
                <AnimatePresence>
                  {showResponse && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-violet-500/20">
                        AI
                      </div>
                      <div className="bg-violet-900/20 border border-violet-500/20 rounded-2xl rounded-tl-sm p-4 max-w-[80%] text-slate-200">
                        <p className="mb-2">{responseText}</p>
                        <div className="flex gap-2 mt-3">
                          <span className="px-2 py-1 rounded bg-violet-500/20 text-violet-300 text-xs border border-violet-500/20">
                            Отчет.pdf
                          </span>
                          <span className="px-2 py-1 rounded bg-violet-500/20 text-violet-300 text-xs border border-violet-500/20">
                            График.xls
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Input Area */}
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="h-10 bg-slate-900 rounded-lg border border-slate-800 w-full opacity-50" />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default AIFocus;

