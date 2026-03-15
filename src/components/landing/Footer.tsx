import { Link } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { marketingContacts, marketingNavLinks, packageItems } from '../../data/marketingContent';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-steel-800 bg-steel-950 text-white">
      <div className="container-custom py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-construction-300">
                <BuildingOfficeIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xl font-bold">ProHelper</div>
                <div className="text-xs uppercase tracking-[0.22em] text-white/45">construction operating system</div>
              </div>
            </div>

            <p className="mt-6 max-w-xl text-sm leading-7 text-white/70">
              Продающий лендинг должен обещать только то, что продукт реально умеет. Поэтому в основе ProHelper
              лежит сильная backend- и admin-архитектура: проекты, документы, материалы, финансы, роли, аналитика и AI.
            </p>

            <div className="mt-6 space-y-3 text-sm text-white/75">
              <a href={marketingContacts.phoneHref} className="flex items-center gap-3 transition hover:text-construction-200">
                <PhoneIcon className="h-5 w-5" />
                {marketingContacts.phone}
              </a>
              <a href={marketingContacts.emailHref} className="flex items-center gap-3 transition hover:text-construction-200">
                <EnvelopeIcon className="h-5 w-5" />
                {marketingContacts.email}
              </a>
              <div className="flex items-center gap-3">
                <MapPinIcon className="h-5 w-5" />
                {marketingContacts.location}
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-construction-200">Навигация</div>
            <div className="mt-5 space-y-3">
              {marketingNavLinks.map((item) => {
                if (item.href.startsWith('/#')) {
                  return (
                    <a key={item.href} href={item.href} className="block text-sm text-white/70 transition hover:text-white">
                      {item.label}
                    </a>
                  );
                }

                return (
                  <Link key={item.href} to={item.href} className="block text-sm text-white/70 transition hover:text-white">
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-construction-200">Пакеты</div>
            <div className="mt-5 space-y-3">
              {packageItems.map((item) => (
                <a key={item.name} href="/pricing#pricing-contact" className="block text-sm text-white/70 transition hover:text-white">
                  {item.name}: {item.audience}
                </a>
              ))}
            </div>
            <a
              href="/#contact"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-steel-950 transition hover:-translate-y-0.5 hover:bg-construction-100"
            >
              Обсудить внедрение
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/45 md:flex-row md:items-center md:justify-between">
          <div>© {currentYear} ProHelper. Все права защищены.</div>
          <div className="flex flex-wrap gap-5">
            <Link to="/privacy" className="transition hover:text-white">
              Конфиденциальность
            </Link>
            <Link to="/terms" className="transition hover:text-white">
              Оферта
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
