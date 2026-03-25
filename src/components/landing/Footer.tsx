import { Link } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  EnvelopeIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import {
  marketingCompany,
  marketingNavigation,
  marketingPackages,
  marketingPaths,
} from '@/data/marketingRegistry';
import { formatPackageTierPrice } from '@/components/marketing/MarketingPrimitives';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const packagePreview = marketingPackages.slice(0, 4);

  return (
    <footer className="border-t border-steel-800 bg-steel-950 text-white">
      <div className="container-custom py-14">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-construction-300">
                <BuildingOfficeIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xl font-bold">{marketingCompany.brand}</div>
                <div className="text-xs uppercase tracking-[0.22em] text-white/45">
                  {marketingCompany.tagline}
                </div>
              </div>
            </div>

            <p className="mt-6 max-w-xl text-sm leading-7 text-white/70">
              Корпоративный сайт ProHelper описывает только подтвержденные контуры продукта:
              проекты, снабжение, финансы, документы, mobile, AI и multi-org сценарии.
            </p>

            <div className="mt-6 space-y-3 text-sm text-white/75">
              <a href={marketingCompany.emailHref} className="flex items-center gap-3 transition hover:text-construction-200">
                <EnvelopeIcon className="h-5 w-5" />
                {marketingCompany.email}
              </a>
              <div className="flex items-center gap-3">
                <MapPinIcon className="h-5 w-5" />
                {marketingCompany.location}
              </div>
              <div>{marketingCompany.responseTime}</div>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-construction-200">Навигация</div>
            <div className="mt-5 space-y-3">
              {marketingNavigation.map((item) => (
                <Link key={item.href} to={item.href} className="block text-sm text-white/70 transition hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-construction-200">Пакеты</div>
            <div className="mt-5 space-y-3">
              {packagePreview.map((item) => (
                <div key={item.slug} className="text-sm text-white/70">
                  <div className="font-semibold text-white">{item.name}</div>
                  <div className="mt-1 text-white/55">
                    {formatPackageTierPrice(item.tiers[0])}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-construction-200">Legal</div>
            <div className="mt-5 space-y-3">
              <Link to={marketingPaths.security} className="block text-sm text-white/70 transition hover:text-white">
                Безопасность
              </Link>
              <Link to={marketingPaths.privacy} className="block text-sm text-white/70 transition hover:text-white">
                Конфиденциальность
              </Link>
              <Link to={marketingPaths.offer} className="block text-sm text-white/70 transition hover:text-white">
                Оферта
              </Link>
              <Link to={marketingPaths.cookies} className="block text-sm text-white/70 transition hover:text-white">
                Cookies
              </Link>
            </div>
            <Link
              to={marketingPaths.contact}
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-steel-950 transition hover:-translate-y-0.5 hover:bg-construction-100"
            >
              Обсудить внедрение
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/45 md:flex-row md:items-center md:justify-between">
          <div>© {currentYear} ProHelper. Все права защищены.</div>
          <div className="flex flex-wrap gap-5">
            <Link to={marketingPaths.privacy} className="transition hover:text-white">
              Конфиденциальность
            </Link>
            <Link to={marketingPaths.offer} className="transition hover:text-white">
              Оферта
            </Link>
            <Link to={marketingPaths.cookies} className="transition hover:text-white">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
