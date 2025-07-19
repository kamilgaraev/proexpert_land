import React from 'react';
import { Link } from 'react-router-dom';

interface BlogPublicLayoutProps {
  children: React.ReactNode;
}

const BlogPublicLayout: React.FC<BlogPublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-xl font-bold text-gray-900">ProHelper</span>
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <Link to="/features" className="text-gray-700 hover:text-blue-600">Возможности</Link>
              <Link to="/pricing" className="text-gray-700 hover:text-blue-600">Тарифы</Link>
              <Link to="/blog" className="text-blue-600 font-medium">Блог</Link>
              <Link to="/docs" className="text-gray-700 hover:text-blue-600">Документация</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-blue-600">Войти</Link>
              <Link 
                to="/register" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Попробовать бесплатно
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Blog Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Блог ProHelper</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Экспертные статьи о строительстве и управлении проектами
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-xl font-bold">ProHelper</span>
              </div>
              <p className="text-gray-400 mb-4">
                Цифровая экосистема для управления строительными проектами. Объединяем прорабов, администраторов и владельцев в единой платформе.
              </p>
              <div className="space-y-2 text-gray-400">
                <p>info@prohelper.ru</p>
                <p>+7 (999) 123-45-67</p>
                <p>Москва, ул. Строителей, 25</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Продукт</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/features" className="hover:text-white">Возможности</Link></li>
                <li><Link to="/pricing" className="hover:text-white">Тарифы</Link></li>
                <li><Link to="/integrations" className="hover:text-white">Интеграции</Link></li>
                <li><Link to="/api" className="hover:text-white">API</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Решения</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/small-business" className="hover:text-white">Для малого бизнеса</Link></li>
                <li><Link to="/enterprise" className="hover:text-white">Для крупных компаний</Link></li>
                <li><Link to="/contractors" className="hover:text-white">Для подрядчиков</Link></li>
                <li><Link to="/developers" className="hover:text-white">Для девелоперов</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Ресурсы</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/docs" className="hover:text-white">Документация</Link></li>
                <li><Link to="/help" className="hover:text-white">База знаний</Link></li>
                <li><Link to="/blog" className="hover:text-white">Блог</Link></li>
                <li><Link to="/webinars" className="hover:text-white">Вебинары</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400">© 2025 ProHelper. Все права защищены.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link to="/privacy" className="text-gray-400 hover:text-white">Политика конфиденциальности</Link>
                <Link to="/terms" className="text-gray-400 hover:text-white">Условия использования</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogPublicLayout; 