import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Логотип */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img
                className="h-8 w-auto"
                src="/logo.svg"
                alt="Прораб-Финанс Мост"
              />
              <span className="ml-3 font-bold text-xl text-primary-700">ПрорабМост</span>
            </Link>
          </div>

          {/* Десктопная навигация */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-secondary-700 hover:text-primary-600 font-medium">
              Возможности
            </a>
            <a href="#how-it-works" className="text-secondary-700 hover:text-primary-600 font-medium">
              Как это работает
            </a>
            <a href="#pricing" className="text-secondary-700 hover:text-primary-600 font-medium">
              Тарифы
            </a>
            <Link to="/login" className="text-secondary-700 hover:text-primary-600 font-medium">
              Войти
            </Link>
            <Link to="/register" className="btn btn-primary">
              Начать бесплатно
            </Link>
          </div>

          {/* Мобильное меню (кнопка) */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-secondary-400 hover:text-secondary-500 hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={toggleMenu}
            >
              <span className="sr-only">Открыть меню</span>
              {isMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Мобильное меню (панель) */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a
              href="#features"
              className="block px-3 py-2 rounded-md text-base font-medium text-secondary-700 hover:text-primary-600 hover:bg-secondary-50"
              onClick={toggleMenu}
            >
              Возможности
            </a>
            <a
              href="#how-it-works"
              className="block px-3 py-2 rounded-md text-base font-medium text-secondary-700 hover:text-primary-600 hover:bg-secondary-50"
              onClick={toggleMenu}
            >
              Как это работает
            </a>
            <a
              href="#pricing"
              className="block px-3 py-2 rounded-md text-base font-medium text-secondary-700 hover:text-primary-600 hover:bg-secondary-50"
              onClick={toggleMenu}
            >
              Тарифы
            </a>
            <Link
              to="/login"
              className="block px-3 py-2 rounded-md text-base font-medium text-secondary-700 hover:text-primary-600 hover:bg-secondary-50"
              onClick={toggleMenu}
            >
              Войти
            </Link>
            <Link
              to="/register"
              className="block w-full text-center px-3 py-2 rounded-md text-base font-medium btn btn-primary"
              onClick={toggleMenu}
            >
              Начать бесплатно
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 