import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const navigation = {
    product: [
      { name: 'Возможности', href: '#features' },
      { name: 'Как работает', href: '#how-it-works' },
      { name: 'Тарифы', href: '#pricing' },
      { name: 'API документация', href: '/api-docs' },
    ],
    company: [
      { name: 'О нас', href: '/about' },
      { name: 'Блог', href: '/blog' },
      { name: 'Карьера', href: '/careers' },
      { name: 'Пресс-центр', href: '/press' },
    ],
    support: [
      { name: 'Центр помощи', href: '/help' },
      { name: 'Поддержка', href: '/support' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Статус системы', href: '/status' },
    ],
    legal: [
      { name: 'Политика конфиденциальности', href: '/privacy' },
      { name: 'Условия использования', href: '/terms' },
      { name: 'Обработка данных', href: '/data-processing' },
      { name: 'Cookie', href: '/cookies' },
    ],
    social: [
      {
        name: 'Telegram',
        href: '#',
        icon: (props: React.SVGProps<SVGSVGElement>) => (
          <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
        ),
      },
      {
        name: 'WhatsApp',
        href: '#',
        icon: (props: React.SVGProps<SVGSVGElement>) => (
          <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
        ),
      },
      {
        name: 'VK',
        href: '#',
        icon: (props: React.SVGProps<SVGSVGElement>) => (
          <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
            <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.049-1.714-1.033-1.01-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.441 0 .61.203.78.678.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.204.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.271.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .763.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>
          </svg>
        ),
      },
    ],
  };

  return (
    <footer className="bg-gradient-to-t from-cyber-bg to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-cyber-grid opacity-5"></div>
      
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-purple to-transparent"></div>
      
      <div className="container-custom relative z-10">
        <div className="py-16">
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16">
            <motion.div 
              className="lg:col-span-1"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center mb-6">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-neon-purple to-neon-pink rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">P</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-neon-purple to-neon-pink rounded-xl blur opacity-50"></div>
                </div>
                <span className="ml-3 font-bold text-2xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  ProHelper
                </span>
              </div>
              
              <p className="text-gray-400 leading-relaxed mb-6">
                Революционная система управления строительными проектами. 
                Объединяем прорабов, администраторов и владельцев в единой экосистеме.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <EnvelopeIcon className="w-5 h-5 text-neon-blue" />
                  <a href="mailto:info@prohelper.ru" className="text-gray-400 hover:text-neon-blue transition-colors">
                    info@prohelper.ru
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <PhoneIcon className="w-5 h-5 text-neon-green" />
                  <a href="tel:+78001234567" className="text-gray-400 hover:text-neon-green transition-colors">
                    +7 (800) 123-45-67
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <MapPinIcon className="w-5 h-5 text-neon-purple" />
                  <span className="text-gray-400">
                    Москва, Россия
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="text-lg font-semibold text-white mb-6">Продукт</h3>
              <ul className="space-y-3">
                {navigation.product.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-gray-400 hover:text-neon-blue transition-colors duration-300 flex items-center group"
                    >
                      <span>{item.name}</span>
                      <ArrowRightIcon className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-white mb-6">Компания</h3>
              <ul className="space-y-3">
                {navigation.company.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-gray-400 hover:text-neon-purple transition-colors duration-300 flex items-center group"
                    >
                      <span>{item.name}</span>
                      <ArrowRightIcon className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-white mb-6">Поддержка</h3>
              <ul className="space-y-3 mb-8">
                {navigation.support.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-gray-400 hover:text-neon-green transition-colors duration-300 flex items-center group"
                    >
                      <span>{item.name}</span>
                      <ArrowRightIcon className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                    </Link>
                  </li>
                ))}
              </ul>
              
              <div>
                <h4 className="text-sm font-semibold text-white mb-4">Мы в соцсетях</h4>
                <div className="flex space-x-4">
                  {navigation.social.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="w-10 h-10 bg-gradient-to-br from-cyber-card to-cyber-accent border border-cyber-border rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:shadow-cyber transition-all duration-300 hover:scale-110 backdrop-blur-sm"
                    >
                      <span className="sr-only">{item.name}</span>
                      <item.icon className="h-5 w-5" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="relative bg-gradient-to-r from-cyber-card/30 to-cyber-accent/30 border border-cyber-border rounded-2xl p-8 mb-12 backdrop-blur-sm"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">
                Готовы начать?
              </h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Присоединяйтесь к сотням строительных компаний, которые уже оптимизировали свои процессы с ProHelper
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-neon-purple to-neon-pink rounded-lg text-white font-semibold hover:shadow-neon-purple transition-all duration-300 transform hover:scale-105"
              >
                Начать бесплатно
                <ArrowRightIcon className="w-5 h-5" />
              </Link>  
            </div>
            
            <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-purple via-neon-blue to-neon-green rounded-2xl blur opacity-20 animate-pulse-slow -z-10"></div>
          </motion.div>

          <motion.div 
            className="border-t border-cyber-border pt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                © {currentYear} ProHelper. Все права защищены.
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm">
                {navigation.legal.map((item, index) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    {item.name}
                    {index < navigation.legal.length - 1 && (
                      <span className="ml-4 text-gray-600">•</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;