import { Link } from 'react-router-dom';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
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
        { name: 'Возможности', href: '#features', keywords: 'возможности функции' },
        { name: 'Тарифы', href: '#pricing', keywords: 'цены тарифы стоимость' },
        { name: 'Интеграции', href: '/integrations', keywords: 'интеграция 1С API' },
        { name: 'API', href: '/api', keywords: 'API разработчики' },
      ]
    },
    {
      title: 'Решения',
      links: [
        { name: 'Для малого бизнеса', href: '/small-business', keywords: 'малый бизнес стартап' },
        { name: 'Для крупных компаний', href: '/enterprise', keywords: 'enterprise корпоративный' },
        { name: 'Для подрядчиков', href: '/contractors', keywords: 'подрядчики субподряд' },
        { name: 'Для девелоперов', href: '/developers', keywords: 'девелоперы застройщики' },
      ]
    },
    {
      title: 'Ресурсы',
      links: [
        { name: 'Документация', href: '/docs', keywords: 'документация помощь' },
        { name: 'База знаний', href: '/help', keywords: 'помощь поддержка' },
        { name: 'Блог', href: '/blog', keywords: 'блог статьи новости' },
        { name: 'Вебинары', href: '/webinars', keywords: 'вебинары обучение' },
      ]
    },
    {
      title: 'Компания',
      links: [
        { name: 'О нас', href: '/about', keywords: 'о компании история' },
        { name: 'Карьера', href: '/careers', keywords: 'работа вакансии карьера' },
        { name: 'Пресс-центр', href: '/press', keywords: 'пресса новости СМИ' },
        { name: 'Партнеры', href: '/partners', keywords: 'партнеры сотрудничество' },
      ]
    }
  ];

  const socialLinks = [
    { name: 'Telegram', href: 'https://t.me/prohelper', icon: '📱', keywords: 'telegram чат поддержка' },
    { name: 'WhatsApp', href: 'https://wa.me/79991234567', icon: '💬', keywords: 'whatsapp консультация' },
    { name: 'YouTube', href: 'https://youtube.com/prohelper', icon: '📺', keywords: 'youtube видео обучение' },
    { name: 'VK', href: 'https://vk.com/prohelper', icon: '👥', keywords: 'вконтакте сообщество' },
  ];

  const solutions = [
    { icon: TruckIcon, name: 'Учет материалов', keywords: 'учет материалов склад' },
    { icon: UserGroupIcon, name: 'Управление командой', keywords: 'управление командой персонал' },
    { icon: DocumentTextIcon, name: 'Документооборот', keywords: 'документооборот отчеты' },
    { icon: ShieldCheckIcon, name: 'Безопасность', keywords: 'безопасность данных защита' }
  ];

  const certificates = [
    { name: 'ISO 27001 - Безопасность информации', keywords: 'ISO сертификат безопасность' },
    { name: 'ГОСТ Р ИСО 9001 - Менеджмент качества', keywords: 'ГОСТ качество стандарт' },
    { name: 'ФЗ-152 - Защита персональных данных', keywords: 'ФЗ-152 персональные данные' },
    { name: 'Реестр отечественного ПО', keywords: 'отечественное ПО реестр' }
  ];

  return (
    <footer 
      className="bg-gradient-to-b from-steel-800 to-steel-900 text-white relative overflow-hidden"
      data-seo-track="footer_view"
    >
      <div className="absolute inset-0 bg-construction-grid opacity-5"></div>
      
      <div className="container-custom relative z-10">
        <div className="pt-16 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-construction-500 to-construction-600 rounded-lg flex items-center justify-center">
                  <BuildingOfficeIcon className="w-6 h-6 text-white" />
                </div>
                <span 
                  className="text-2xl font-bold text-white"
                  data-seo-keyword="ProHelper строительство"
                >
                  ProHelper
                </span>
              </div>
              
              <p 
                className="text-steel-200 text-lg leading-relaxed mb-6"
                data-seo-keyword="цифровая экосистема строительство"
              >
                Цифровая экосистема для управления строительными проектами. 
                Объединяем прорабов, администраторов и владельцев в единой платформе.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-steel-200">
                  <EnvelopeIcon className="w-5 h-5 text-construction-400" />
                  <a 
                    href="mailto:info@prohelper.ru" 
                    className="hover:text-construction-400 transition-colors"
                    data-seo-track="email_contact_click"
                    data-seo-keyword="email контакт"
                  >
                    info@prohelper.ru
                  </a>
                </div>
                <div className="flex items-center gap-3 text-steel-200">
                  <PhoneIcon className="w-5 h-5 text-construction-400" />
                  <a 
                    href="tel:+79991234567" 
                    className="hover:text-construction-400 transition-colors"
                    data-seo-track="phone_contact_click"
                    data-seo-keyword="телефон консультация"
                  >
                    +7 (999) 123-45-67
                  </a>
                </div>
                <div className="flex items-center gap-3 text-steel-200">
                  <MapPinIcon className="w-5 h-5 text-construction-400" />
                  <span data-seo-keyword="адрес офис Москва">Москва, ул. Строителей, 25</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {footerSections.map((section, index) => (
                  <div key={index}>
                    <h3 
                      className="text-lg font-semibold text-white mb-6"
                      data-seo-keyword={`${section.title.toLowerCase()} меню`}
                    >
                      {section.title}
                    </h3>
                    <ul className="space-y-3">
                      {section.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <Link 
                            to={link.href}
                            className="text-steel-200 hover:text-construction-400 transition-colors duration-200 text-base"
                            data-seo-track="footer_link_click"
                            data-seo-keyword={link.keywords}
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
                <h4 
                  className="text-lg font-semibold text-white mb-4 flex items-center gap-2"
                  data-seo-keyword="решения функции"
                >
                  <WrenchScrewdriverIcon className="w-5 h-5 text-construction-400" />
                  Наши решения
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {solutions.map((solution, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 text-steel-200"
                      data-seo-keyword={solution.keywords}
                    >
                      <solution.icon className="w-4 h-4 text-safety-400" />
                      <span>{solution.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 
                  className="text-lg font-semibold text-white mb-4"
                  data-seo-keyword="сертификаты стандарты"
                >
                  Сертификаты
                </h4>
                <div className="space-y-2 text-sm text-steel-200">
                  {certificates.map((cert, index) => (
                    <div 
                      key={index}
                      data-seo-keyword={cert.keywords}
                    >
                      ✓ {cert.name}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 
                  className="text-lg font-semibold text-white mb-4"
                  data-seo-keyword="социальные сети"
                >
                  Мы в соцсетях
                </h4>
                <div className="flex gap-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-steel-700 hover:bg-construction-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                      title={social.name}
                      data-seo-track="social_link_click"
                      data-seo-keyword={social.keywords}
                    >
                      <span className="text-lg">{social.icon}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-steel-600 pt-8 mt-8">
            <div 
              className="bg-gradient-to-r from-construction-600 to-safety-600 rounded-xl p-6 mb-8"
              data-seo-track="footer_cta_view"
            >
              <div className="text-center">
                <h4 
                  className="text-xl font-bold text-white mb-2"
                  data-seo-keyword="оптимизация строительные проекты"
                >
                  Готовы оптимизировать свои строительные проекты?
                </h4>
                <p className="text-white/90 mb-4">
                  Начните использовать ProHelper уже сегодня и увидите результат завтра
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/register"
                    className="px-6 py-3 bg-white text-construction-600 font-semibold rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
                    data-seo-track="footer_register_click"
                    data-seo-keyword="попробовать бесплатно регистрация"
                  >
                    Попробовать бесплатно
                  </Link>
                  <Link
                    to="/demo"
                    className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-105"
                    data-seo-track="footer_demo_click"
                    data-seo-keyword="демо заказать презентация"
                  >
                    Заказать демо
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center text-steel-400 text-sm">
              <div>
                <p>&copy; {currentYear} ProHelper. Все права защищены.</p>
              </div>
              <div className="flex gap-6 mt-4 md:mt-0">
                <Link 
                  to="/privacy" 
                  className="hover:text-construction-400 transition-colors"
                  data-seo-track="privacy_link_click"
                  data-seo-keyword="политика конфиденциальности"
                >
                  Политика конфиденциальности
                </Link>
                <Link 
                  to="/terms" 
                  className="hover:text-construction-400 transition-colors"
                  data-seo-track="terms_link_click"
                  data-seo-keyword="пользовательское соглашение"
                >
                  Условия использования
                </Link>
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