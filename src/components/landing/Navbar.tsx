import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    { href: '#features', label: 'Возможности' },
    { href: '#how-it-works', label: 'Как работает' },
    { href: '#pricing', label: 'Тарифы' },
    { href: '#about', label: 'О нас' },
  ];

  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 bg-cyber-bg/80 backdrop-blur-xl border-b border-cyber-border/50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link to="/" className="flex items-center group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-neon-purple to-neon-pink rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-neon-purple to-neon-pink rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
              </div>
              <span className="ml-3 font-bold text-2xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                ProHelper
              </span>
            </Link>
          </motion.div>

          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item, index) => (
              <motion.a
                key={item.href}
                href={item.href}
                className="text-gray-300 hover:text-neon-blue font-medium transition-colors duration-300 relative group"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-neon-purple to-neon-blue group-hover:w-full transition-all duration-300"></span>
              </motion.a>
            ))}
            
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link 
                to="/login" 
                className="text-gray-300 hover:text-white font-medium transition-colors duration-300"
              >
                Войти
              </Link>
              <Link 
                to="/register" 
                className="relative group px-6 py-2 bg-gradient-to-r from-neon-purple to-neon-pink rounded-lg text-white font-semibold transition-all duration-300 hover:shadow-neon-purple transform hover:scale-105"
              >
                <span className="relative z-10">Начать бесплатно</span>
                <div className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-pink rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
              </Link>
            </motion.div>
          </div>

          <div className="md:hidden">
            <motion.button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-neon-blue hover:bg-cyber-card/50 focus:outline-none focus:ring-2 focus:ring-neon-purple backdrop-blur-sm"
              onClick={toggleMenu}
              whileTap={{ scale: 0.95 }}
            >
              <span className="sr-only">Открыть меню</span>
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <XMarkIcon className="block h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Bars3Icon className="block h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 pt-2 pb-6 space-y-1 bg-cyber-card/90 backdrop-blur-xl border-t border-cyber-border/50">
              {menuItems.map((item, index) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-neon-blue hover:bg-cyber-accent/30 transition-all duration-300"
                  onClick={toggleMenu}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  {item.label}
                </motion.a>
              ))}
              
              <div className="pt-4 space-y-2">
                <Link
                  to="/login"
                  className="block px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-cyber-accent/30 transition-all duration-300"
                  onClick={toggleMenu}
                >
                  Войти
                </Link>
                <Link
                  to="/register"
                  className="block w-full text-center px-3 py-3 rounded-md text-base font-medium bg-gradient-to-r from-neon-purple to-neon-pink text-white hover:shadow-neon-purple transition-all duration-300"
                  onClick={toggleMenu}
                >
                  Начать бесплатно
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar; 