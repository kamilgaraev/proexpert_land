import { Link } from 'react-router-dom';

const navigation = {
  product: [
    { name: 'Возможности', href: '#features' },
    { name: 'Как это работает', href: '#how-it-works' },
    { name: 'Тарифы', href: '#pricing' },
  ],
  company: [
    { name: 'О нас', href: '/about' },
    { name: 'Контакты', href: '/contacts' },
    { name: 'Блог', href: '/blog' },
  ],
  legal: [
    { name: 'Политика конфиденциальности', href: '/privacy-policy' },
    { name: 'Пользовательское соглашение', href: '/terms' },
  ],
  social: [
    {
      name: 'Telegram',
      href: 'https://t.me/prorabmost',
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.357 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
    },
    {
      name: 'VK',
      href: 'https://vk.com/prorabmost',
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path d="M21.547 7h-3.29a.743.743 0 0 0-.655.392s-1.312 2.416-1.734 3.23C14.734 12.813 14 12.126 14 11.11V7.603A1.104 1.104 0 0 0 12.896 6.5h-2.474a1.982 1.982 0 0 0-1.75.813s1.255-.204 1.255 1.49c0 .42.022 1.626.04 2.64a.73.73 0 0 1-1.272.503 21.54 21.54 0 0 1-2.498-4.543.693.693 0 0 0-.63-.403h-2.99a.508.508 0 0 0-.48.685C3.005 10.175 6.918 18 11.38 18h1.878a.742.742 0 0 0 .742-.742v-1.135a.73.73 0 0 1 1.23-.53l2.247 2.112a1.09 1.09 0 0 0 .746.295h2.953c1.424 0 1.424-.988.647-1.753-.546-.538-2.518-2.617-2.518-2.617a1.02 1.02 0 0 1-.078-1.323c.637-.84 1.68-2.212 2.122-2.8.603-.804 1.697-2.507.197-2.507z" />
        </svg>
      ),
    },
  ],
};

const Footer = () => {
  return (
    <footer className="bg-secondary-900" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Подвал сайта
      </h2>
      <div className="container-custom py-12 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <Link to="/" className="flex items-center">
              <img
                className="h-10 w-auto"
                src="/logo-white.svg"
                alt="ProExpert"
              />
              <span className="ml-3 font-bold text-xl text-white">ProExpert</span>
            </Link>
            <p className="text-secondary-300 text-base">
              Удобная и простая система учета для строительных компаний.
              Связываем стройплощадку и бухгалтерию в единое целое.
            </p>
            <div className="flex space-x-6">
              {navigation.social.map((item) => (
                <a key={item.name} href={item.href} className="text-secondary-400 hover:text-secondary-300">
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-secondary-200 tracking-wider uppercase">
                  Продукт
                </h3>
                <ul className="mt-4 space-y-4">
                  {navigation.product.map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="text-base text-secondary-300 hover:text-white">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-secondary-200 tracking-wider uppercase">
                  Компания
                </h3>
                <ul className="mt-4 space-y-4">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <Link to={item.href} className="text-base text-secondary-300 hover:text-white">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-secondary-200 tracking-wider uppercase">
                  Правовая информация
                </h3>
                <ul className="mt-4 space-y-4">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link to={item.href} className="text-base text-secondary-300 hover:text-white">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-secondary-200 tracking-wider uppercase">
                  Техническая поддержка
                </h3>
                <div className="mt-4 space-y-4">
                  <p className="text-base text-secondary-300">
                    Email: <a href="mailto:support@prorabmost.ru" className="hover:text-white">support@prorabmost.ru</a>
                  </p>
                  <p className="text-base text-secondary-300">
                    Телефон: <a href="tel:+78001234567" className="hover:text-white">8 (800) 123-45-67</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-secondary-700 pt-8">
          <p className="text-base text-secondary-400 text-center">
            &copy; {new Date().getFullYear()} ProExpert. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;