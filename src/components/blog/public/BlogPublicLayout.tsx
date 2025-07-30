import React from 'react';
import { motion } from 'framer-motion';
import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import Navbar from '../../landing/Navbar';
import Footer from '../../landing/Footer';

interface BlogPublicLayoutProps {
  children: React.ReactNode;
}

const BlogPublicLayout: React.FC<BlogPublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-concrete-50 via-concrete-100 to-steel-100 relative overflow-x-hidden">
      <div className="absolute inset-0 bg-construction-grid opacity-20"></div>
      
      {/* Header - используем Navbar с лендинга */}
      <Navbar />

      {/* Blog Hero */}
      <div className="relative z-10 bg-gradient-to-r from-construction-600 via-safety-600 to-steel-600 overflow-hidden mt-14 sm:mt-16 md:mt-18 lg:mt-20">
        <div className="absolute inset-0 bg-construction-grid opacity-20"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-construction-500/20 rounded-full blur-3xl animate-pulse-construction"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-safety-500/20 rounded-full blur-3xl animate-pulse-construction delay-1000"></div>
        
        <div className="container-custom relative z-10 py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full mb-6"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <WrenchScrewdriverIcon className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-semibold">Экспертные знания в строительстве</span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl lg:text-6xl font-bold text-white mb-6 font-construction"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Блог <span className="text-yellow-300">ProHelper</span>
            </motion.h1>
            <motion.p 
              className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Лучшие практики, инновации и экспертные советы для эффективного управления строительными проектами
            </motion.p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container-custom relative z-10 py-12 lg:py-16">
        {children}
      </main>

      {/* Footer - используем Footer с лендинга */}
      <Footer />
    </div>
  );
};

export default BlogPublicLayout; 