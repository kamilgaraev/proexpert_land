import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ArrowRightIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  TruckIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Продукт',
      links: [
        { name: 'Возможности', href: '#features' },
        { name: 'Тарифы', href: '#pricing' },
        { name: 'Интеграции', href: '/integrations' },
        { name: 'API', href: '/api' },
      ]
    },
    {
      title: 'Решения',
      links: [
        { name: 'Для малого бизнеса', href: '/small-business' },
        { name: 'Для крупных компаний', href: '/enterprise' },
        { name: 'Для подрядчиков', href: '/contractors' },
        { name: 'Для девелоперов', href: '/developers' },
      ]
    },
    {
      title: 'Ресурсы',
      links: [
        { name: 'Документация', href: '/docs' },
        { name: 'База знаний', href: '/help' },
        { name: 'Блог', href: '/blog' },
        { name: 'Вебинары', href: '/webinars' },
      ]
    },
    {
      title: 'Компания',
      links: [
        { name: 'О нас', href: '/about' },
        { name: 'Карьера', href: '/careers' },
        { name: 'Пресс-центр', href: '/press' },
        { name: 'Партнеры', href: '/partners' },
      ]
    }
  ];

  const socialLinks = [
    { name: 'Telegram', href: 'https://t.me/prohelper', icon: '📱' },
    { name: 'WhatsApp', href: 'https://wa.me/79991234567', icon: '💬' },
    { name: 'YouTube', href: 'https://youtube.com/prohelper', icon: '📺' },
    { name: 'VK', href: 'https://vk.com/prohelper', icon: '👥' },
  ];

  return (
    <footer className="bg-gradient-to-b from-steel-800 to-steel-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-construction-grid opacity-5"></div>
      
      <div className="container-custom relative z-10">
        <div className="pt-16 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-construction-500 to-construction-600 rounded-lg flex items-center justify-center">
                  <BuildingOfficeIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">ProHelper</span>
              </div>
              
              <p className="text-steel-200 text-lg leading-relaxed mb-6">
                Цифровая экосистема для управления строительными проектами. 
                Объединяем прорабов, администраторов и владельцев в единой платформе.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-steel-200">
                  <EnvelopeIcon className="w-5 h-5 text-construction-400" />
                  <a href="mailto:info@prohelper.ru" className="hover:text-construction-400 transition-colors">
                    info@prohelper.ru
                  </a>
                </div>
                <div className="flex items-center gap-3 text-steel-200">
                  <PhoneIcon className="w-5 h-5 text-construction-400" />
                  <a href="tel:+79991234567" className="hover:text-construction-400 transition-colors">
                    +7 (999) 123-45-67
                  </a>
                </div>
                <div className="flex items-center gap-3 text-steel-200">
                  <MapPinIcon className="w-5 h-5 text-construction-400" />
                  <span>Москва, ул. Строителей, 25</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {footerSections.map((section, index) => (
                  <div key={index}>
                    <h3 className="text-lg font-semibold text-white mb-6">{section.title}</h3>
                    <ul className="space-y-3">
                      {section.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <Link 
                            to={link.href}
                            className="text-steel-200 hover:text-construction-400 transition-colors duration-200 text-base"
                          >
                            {link.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-steel-600 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <WrenchScrewdriverIcon className="w-5 h-5 text-construction-400" />
                  Наши решения
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-steel-200">
                    <TruckIcon className="w-4 h-4 text-safety-400" />
                    <span>Учет материалов</span>
                  </div>
                  <div className="flex items-center gap-2 text-steel-200">
                    <UserGroupIcon className="w-4 h-4 text-safety-400" />
                    <span>Управление командой</span>
                  </div>
                  <div className="flex items-center gap-2 text-steel-200">
                    <DocumentTextIcon className="w-4 h-4 text-safety-400" />
                    <span>Документооборот</span>
                  </div>
                  <div className="flex items-center gap-2 text-steel-200">
                    <ShieldCheckIcon className="w-4 h-4 text-safety-400" />
                    <span>Безопасность</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Сертификаты</h4>
                <div className="space-y-2 text-sm text-steel-200">
                  <div>✓ ISO 27001 - Безопасность информации</div>
                  <div>✓ ГОСТ Р ИСО 9001 - Менеджмент качества</div>
                  <div>✓ ФЗ-152 - Защита персональных данных</div>
                  <div>✓ Реестр отечественного ПО</div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Мы в соцсетях</h4>
                <div className="flex gap-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-steel-700 hover:bg-construction-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                      title={social.name}
                    >
                      <span className="text-lg">{social.icon}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-steel-600 pt-8 mt-8">
            <div className="bg-gradient-to-r from-construction-600 to-safety-600 rounded-xl p-6 mb-8">
              <div className="text-center">
                <h4 className="text-xl font-bold text-white mb-2">
                  Готовы оптимизировать свои строительные проекты?
                </h4>
                <p className="text-white/90 mb-4">
                  Начните использовать ProHelper уже сегодня и увидите результат завтра
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/register"
                    className="px-6 py-3 bg-white text-construction-600 font-semibold rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    Попробовать бесплатно
                  </Link>
                  <Link
                    to="/demo"
                    className="px-6 py-3 border-2 border-white/50 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300"
                  >
                    Заказать демо
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-steel-300">
              <div className="flex flex-wrap gap-6">
                <Link to="/privacy" className="hover:text-construction-400 transition-colors">
                  Политика конфиденциальности
                </Link>
                <Link to="/terms" className="hover:text-construction-400 transition-colors">
                  Пользовательское соглашение
                </Link>
                <Link to="/cookies" className="hover:text-construction-400 transition-colors">
                  Политика cookies
                </Link>
              </div>
              <div className="text-steel-300">
                © {currentYear} ProHelper. Все права защищены.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-construction-500 via-safety-500 to-steel-500"></div>
    </footer>
  );
};

export default Footer;