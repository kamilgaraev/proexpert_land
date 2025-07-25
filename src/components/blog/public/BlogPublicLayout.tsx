import React from 'react';
import { Link } from 'react-router-dom';
import { BuildingOfficeIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

interface BlogPublicLayoutProps {
  children: React.ReactNode;
}

const BlogPublicLayout: React.FC<BlogPublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-concrete-50 via-concrete-100 to-steel-100 relative overflow-x-hidden">
      <div className="absolute inset-0 bg-construction-grid opacity-20"></div>
      
      {/* Header */}
      <header className="relative z-10 bg-white/95 backdrop-blur-sm shadow-lg border-b border-steel-200">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-construction-500 to-construction-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <BuildingOfficeIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-steel-900">ProHelper</span>
            </Link>
            
            <nav className="hidden md:flex space-x-8">
              <Link to="/features" className="text-steel-700 hover:text-construction-600 font-medium transition-colors">Возможности</Link>
              <Link to="/pricing" className="text-steel-700 hover:text-construction-600 font-medium transition-colors">Тарифы</Link>
              <Link to="/blog" className="text-construction-600 font-semibold">Блог</Link>
              <Link to="/docs" className="text-steel-700 hover:text-construction-600 font-medium transition-colors">Документация</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-steel-700 hover:text-construction-600 font-medium transition-colors">Войти</Link>
              <Link 
                to="/register" 
                className="px-6 py-3 bg-gradient-to-r from-construction-600 to-construction-500 text-white font-semibold rounded-lg hover:shadow-construction transition-all duration-300 hover:scale-105"
              >
                Попробовать бесплатно
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Blog Hero */}
      <div className="relative z-10 bg-gradient-to-r from-construction-600 via-safety-600 to-steel-600 overflow-hidden">
        <div className="absolute inset-0 bg-construction-grid opacity-20"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-construction-500/20 rounded-full blur-3xl animate-pulse-construction"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-safety-500/20 rounded-full blur-3xl animate-pulse-construction delay-1000"></div>
        
        <div className="container-custom relative z-10 py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full mb-6">
              <WrenchScrewdriverIcon className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-semibold">Экспертные знания в строительстве</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 font-construction">
              Блог <span className="text-yellow-300">ProHelper</span>
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Лучшие практики, инновации и экспертные советы для эффективного управления строительными проектами
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container-custom relative z-10 py-12 lg:py-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-steel-800 to-steel-900 text-white relative overflow-hidden mt-16">
        <div className="absolute inset-0 bg-construction-grid opacity-5"></div>
        
        <div className="container-custom relative z-10 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-construction-500 to-construction-600 rounded-lg flex items-center justify-center">
                  <BuildingOfficeIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">ProHelper</span>
              </div>
              <p className="text-steel-200 text-lg leading-relaxed mb-6">
                Цифровая экосистема для управления строительными проектами. Объединяем прорабов, администраторов и владельцев в единой платформе.
              </p>
              <div className="space-y-2 text-steel-200">
                <p>📧 info@prohelper.ru</p>
                <p>📞 +7 (999) 123-45-67</p>
                <p>📍 Москва, ул. Строителей, 25</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-6 text-construction-400">Продукт</h3>
              <ul className="space-y-3 text-steel-200">
                <li><Link to="/features" className="hover:text-construction-400 transition-colors">Возможности</Link></li>
                <li><Link to="/pricing" className="hover:text-construction-400 transition-colors">Тарифы</Link></li>
                <li><Link to="/integrations" className="hover:text-construction-400 transition-colors">Интеграции</Link></li>
                <li><Link to="/api" className="hover:text-construction-400 transition-colors">API</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-6 text-safety-400">Решения</h3>
              <ul className="space-y-3 text-steel-200">
                <li><Link to="/small-business" className="hover:text-safety-400 transition-colors">Для малого бизнеса</Link></li>
                <li><Link to="/enterprise" className="hover:text-safety-400 transition-colors">Для крупных компаний</Link></li>
                <li><Link to="/contractors" className="hover:text-safety-400 transition-colors">Для подрядчиков</Link></li>
                <li><Link to="/developers" className="hover:text-safety-400 transition-colors">Для девелоперов</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-6 text-steel-400">Ресурсы</h3>
              <ul className="space-y-3 text-steel-200">
                <li><Link to="/docs" className="hover:text-steel-400 transition-colors">Документация</Link></li>
                <li><Link to="/help" className="hover:text-steel-400 transition-colors">База знаний</Link></li>
                <li><Link to="/blog" className="hover:text-steel-400 transition-colors">Блог</Link></li>
                <li><Link to="/webinars" className="hover:text-steel-400 transition-colors">Вебинары</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-steel-600 pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-steel-400">© 2025 ProHelper. Все права защищены.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link to="/privacy" className="text-steel-400 hover:text-construction-400 transition-colors">Политика конфиденциальности</Link>
                <Link to="/terms" className="text-steel-400 hover:text-construction-400 transition-colors">Условия использования</Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-construction-500 via-safety-500 to-steel-500"></div>
      </footer>
    </div>
  );
};

export default BlogPublicLayout; 