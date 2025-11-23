/// <reference types="vite/client" />
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bars3Icon, 
  XMarkIcon,
  BuildingOfficeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { NAV_LINKS } from '../../constants/landing-content';

const LK_URL = (import.meta.env.VITE_LK_URL as string | undefined) ?? 'https://lk.prohelper.pro';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (path: string) => {
    if (path.startsWith('#')) {
      const element = document.querySelector(path);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsOpen(false);
  };

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled || location.pathname !== '/' 
          ? 'bg-white/95 backdrop-blur-sm shadow-lg border-b border-steel-200' 
          : 'bg-white/20 backdrop-blur-md'
      }`}
      data-seo-track="navbar_view"
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-18 lg:h-20">
          <Link 
            to="/" 
            className="flex items-center gap-2 sm:gap-3 group"
            data-seo-track="logo_click"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-construction-500 to-construction-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <BuildingOfficeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-bold transition-colors duration-300 text-steel-900">
              ProHelper
            </span>
          </Link>

          <div className="hidden xl:flex items-center space-x-6 2xl:space-x-8">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-2 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-construction-50 text-steel-700 hover:text-construction-600 ${
                  location.pathname === item.path ? 'text-construction-600 bg-construction-50' : ''
                }`}
                onClick={() => handleLinkClick(item.path)}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2 xl:gap-4">
            <a
              href="tel:+79991234567"
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 text-steel-700 hover:text-construction-600 hover:bg-construction-50"
            >
              <PhoneIcon className="w-4 h-4" />
              <span className="hidden lg:inline xl:inline text-sm xl:text-base">+7 (999) 123-45-67</span>
            </a>
            
            <Link
              to="/login"
              className="px-3 xl:px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm xl:text-base text-steel-700 hover:text-construction-600 hover:bg-construction-50"
            >
              Войти
            </Link>
            
            <Link
              to="/register"
              className="px-4 xl:px-6 py-2 xl:py-3 bg-gradient-to-r from-construction-600 to-construction-500 text-white font-semibold rounded-lg hover:shadow-construction transition-all duration-300 hover:scale-105 text-sm xl:text-base"
            >
              <span className="hidden lg:inline xl:hidden">Попробовать</span>
              <span className="hidden xl:inline">Попробовать бесплатно</span>
            </Link>
          </div>

          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg transition-colors duration-300 text-steel-700 hover:bg-steel-100"
            >
              {isOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-white border-t border-steel-200 shadow-lg"
            >
              <div className="px-4 py-6 space-y-4">
                {NAV_LINKS.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`block px-3 py-3 rounded-lg font-medium text-base transition-colors ${
                      location.pathname === item.path ? 'text-construction-600 bg-construction-50' : 'text-steel-700 hover:text-construction-600'
                    }`}
                    onClick={() => handleLinkClick(item.path)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                <div className="pt-4 border-t border-steel-200 space-y-4">
                  <a
                    href="tel:+79991234567"
                    className="flex items-center gap-3 px-3 py-3 text-steel-700 hover:text-construction-600 text-base"
                  >
                    <PhoneIcon className="w-5 h-5" />
                    +7 (999) 123-45-67
                  </a>
                  
                  <Link
                    to="/login"
                    className="block px-3 py-3 text-steel-700 hover:text-construction-600 font-medium text-base"
                    onClick={() => setIsOpen(false)}
                  >
                    Войти
                  </Link>
                  
                  <Link
                    to="/register"
                    className="block w-full px-6 py-4 bg-gradient-to-r from-construction-600 to-construction-500 text-white font-semibold rounded-lg text-center hover:shadow-construction transition-all duration-300 text-base"
                    onClick={() => setIsOpen(false)}
                  >
                    Попробовать бесплатно
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
