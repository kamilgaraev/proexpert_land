import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bars3Icon, 
  XMarkIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  CurrencyDollarIcon,
  QuestionMarkCircleIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Возможности', href: '#features', icon: WrenchScrewdriverIcon },
    { name: 'Как работает', href: '#how-it-works', icon: BuildingOfficeIcon },
    { name: 'Тарифы', href: '#pricing', icon: CurrencyDollarIcon },
    { name: 'Поддержка', href: '/support', icon: QuestionMarkCircleIcon },
    { name: 'Контакты', href: '/contact', icon: PhoneIcon },
  ];

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-construction-200/50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-construction-500 to-construction-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <BuildingOfficeIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-steel-900 group-hover:text-construction-600 transition-colors">
              ProHelper
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className="flex items-center gap-2 text-steel-700 hover:text-construction-600 font-medium transition-colors duration-200 group"
              >
                <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                {item.name}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="px-4 py-2 text-steel-700 hover:text-construction-600 font-medium transition-colors"
            >
              Войти
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-gradient-to-r from-construction-600 to-construction-500 text-white font-semibold rounded-lg hover:shadow-construction transition-all duration-300 hover:scale-105"
            >
              Попробовать бесплатно
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-steel-700 hover:text-construction-600 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
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
            className="md:hidden bg-white/95 backdrop-blur-md border-b border-construction-200/50"
          >
            <div className="container-custom py-4">
              <div className="space-y-4">
                {navItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => scrollToSection(item.href)}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 text-steel-700 hover:text-construction-600 hover:bg-construction-50 rounded-lg transition-all duration-200"
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </button>
                ))}
                
                <div className="border-t border-construction-200 pt-4 space-y-3">
                  <Link
                    to="/login"
                    className="block px-4 py-3 text-steel-700 hover:text-construction-600 hover:bg-construction-50 rounded-lg transition-all duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Войти
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-3 bg-gradient-to-r from-construction-600 to-construction-500 text-white font-semibold rounded-lg text-center hover:shadow-construction transition-all duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    Попробовать бесплатно
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar; 