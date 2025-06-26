import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bars3Icon, 
  XMarkIcon,
  BuildingOfficeIcon,
  ChevronDownIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { 
      name: 'Возможности', 
      href: '#features',
      keywords: 'возможности функции система'
    },
    { 
      name: 'Тарифы', 
      href: '#pricing',
      keywords: 'тарифы цены стоимость планы'
    },
    {
      name: 'Решения',
      href: '#',
      keywords: 'решения для бизнеса',
      dropdown: [
        { name: 'Для малого бизнеса', href: '/small-business', keywords: 'малый бизнес стартап' },
        { name: 'Для предприятий', href: '/enterprise', keywords: 'enterprise корпоративный' },
        { name: 'Для подрядчиков', href: '/contractors', keywords: 'подрядчики субподряд' },
      ]
    },
    {
      name: 'Ресурсы',
      href: '#',
      keywords: 'ресурсы помощь документация',
      dropdown: [
        { name: 'Документация', href: '/docs', keywords: 'документация API' },
        { name: 'База знаний', href: '/help', keywords: 'помощь поддержка FAQ' },
        { name: 'Блог', href: '/blog', keywords: 'блог статьи новости' },
      ]
    },
    { 
      name: 'О компании', 
      href: '/about',
      keywords: 'о компании история команда'
    }
  ];

  const handleLinkClick = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsOpen(false);
    setActiveDropdown(null);
  };

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled || location.pathname !== '/' 
          ? 'bg-white/95 backdrop-blur-sm shadow-lg border-b border-steel-200' 
          : 'bg-transparent'
      }`}
      data-seo-track="navbar_view"
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link 
            to="/" 
            className="flex items-center gap-3 group"
            data-seo-track="logo_click"
            data-seo-keyword="ProHelper главная страница"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-construction-500 to-construction-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <BuildingOfficeIcon className="w-6 h-6 text-white" />
            </div>
            <span 
              className={`text-2xl font-bold transition-colors duration-300 ${
                isScrolled || location.pathname !== '/' ? 'text-steel-900' : 'text-white'
              }`}
              data-seo-keyword="ProHelper строительство CRM"
            >
              ProHelper
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <div key={item.name} className="relative group">
                {item.dropdown ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(item.name)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-construction-50 ${
                        isScrolled || location.pathname !== '/' 
                          ? 'text-steel-700 hover:text-construction-600' 
                          : 'text-white hover:text-construction-200'
                      }`}
                      data-seo-track="dropdown_toggle"
                      data-seo-keyword={item.keywords}
                    >
                      {item.name}
                      <ChevronDownIcon className="w-4 h-4" />
                    </button>

                    <AnimatePresence>
                      {activeDropdown === item.name && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-steel-200 py-2 z-50"
                          data-seo-track="dropdown_menu_view"
                        >
                          {item.dropdown.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.name}
                              to={dropdownItem.href}
                              className="block px-4 py-3 text-steel-700 hover:bg-construction-50 hover:text-construction-600 transition-colors duration-200"
                              onClick={() => handleLinkClick(dropdownItem.href)}
                              data-seo-track="dropdown_item_click"
                              data-seo-keyword={dropdownItem.keywords}
                            >
                              {dropdownItem.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    to={item.href}
                    className={`px-3 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-construction-50 ${
                      isScrolled || location.pathname !== '/' 
                        ? 'text-steel-700 hover:text-construction-600' 
                        : 'text-white hover:text-construction-200'
                    }`}
                    onClick={() => handleLinkClick(item.href)}
                    data-seo-track="nav_link_click"
                    data-seo-keyword={item.keywords}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:+79991234567"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
                isScrolled || location.pathname !== '/' 
                  ? 'text-steel-700 hover:text-construction-600 hover:bg-construction-50' 
                  : 'text-white hover:text-construction-200 hover:bg-white/10'
              }`}
              data-seo-track="phone_navbar_click"
              data-seo-keyword="телефон консультация звонок"
            >
              <PhoneIcon className="w-4 h-4" />
              <span className="hidden xl:inline">+7 (999) 123-45-67</span>
            </a>
            
            <Link
              to="/login"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                isScrolled || location.pathname !== '/' 
                  ? 'text-steel-700 hover:text-construction-600 hover:bg-construction-50' 
                  : 'text-white hover:text-construction-200 hover:bg-white/10'
              }`}
              data-seo-track="login_navbar_click"
              data-seo-keyword="вход личный кабинет"
            >
              Войти
            </Link>
            
            <Link
              to="/register"
              className="px-6 py-3 bg-gradient-to-r from-construction-600 to-construction-500 text-white font-semibold rounded-lg hover:shadow-construction transition-all duration-300 hover:scale-105"
              data-seo-track="register_navbar_click"
              data-seo-keyword="регистрация попробовать бесплатно"
            >
              Попробовать бесплатно
            </Link>
          </div>

          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-lg transition-colors duration-300 ${
                isScrolled || location.pathname !== '/' 
                  ? 'text-steel-700 hover:bg-steel-100' 
                  : 'text-white hover:bg-white/10'
              }`}
              data-seo-track="mobile_menu_toggle"
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
              data-seo-track="mobile_menu_view"
            >
              <div className="px-4 py-6 space-y-4">
                {navigation.map((item) => (
                  <div key={item.name}>
                    {item.dropdown ? (
                      <div>
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === item.name ? null : item.name)}
                          className="flex items-center justify-between w-full px-3 py-2 text-steel-700 hover:text-construction-600 font-medium"
                          data-seo-track="mobile_dropdown_toggle"
                          data-seo-keyword={item.keywords}
                        >
                          {item.name}
                          <ChevronDownIcon className={`w-4 h-4 transition-transform ${activeDropdown === item.name ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <AnimatePresence>
                          {activeDropdown === item.name && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="ml-4 mt-2 space-y-2"
                            >
                              {item.dropdown.map((dropdownItem) => (
                                <Link
                                  key={dropdownItem.name}
                                  to={dropdownItem.href}
                                  className="block px-3 py-2 text-steel-600 hover:text-construction-600"
                                  onClick={() => handleLinkClick(dropdownItem.href)}
                                  data-seo-track="mobile_dropdown_item_click"
                                  data-seo-keyword={dropdownItem.keywords}
                                >
                                  {dropdownItem.name}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        to={item.href}
                        className="block px-3 py-2 text-steel-700 hover:text-construction-600 font-medium"
                        onClick={() => handleLinkClick(item.href)}
                        data-seo-track="mobile_nav_link_click"
                        data-seo-keyword={item.keywords}
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}
                
                <div className="pt-4 border-t border-steel-200 space-y-3">
                  <a
                    href="tel:+79991234567"
                    className="flex items-center gap-3 px-3 py-2 text-steel-700 hover:text-construction-600"
                    data-seo-track="mobile_phone_click"
                    data-seo-keyword="телефон мобильный"
                  >
                    <PhoneIcon className="w-5 h-5" />
                    +7 (999) 123-45-67
                  </a>
                  
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-steel-700 hover:text-construction-600 font-medium"
                    onClick={() => setIsOpen(false)}
                    data-seo-track="mobile_login_click"
                    data-seo-keyword="вход мобильный"
                  >
                    Войти
                  </Link>
                  
                  <Link
                    to="/register"
                    className="block w-full px-6 py-3 bg-gradient-to-r from-construction-600 to-construction-500 text-white font-semibold rounded-lg text-center hover:shadow-construction transition-all duration-300"
                    onClick={() => setIsOpen(false)}
                    data-seo-track="mobile_register_click"
                    data-seo-keyword="регистрация мобильный бесплатно"
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