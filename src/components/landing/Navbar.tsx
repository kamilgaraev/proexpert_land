/// <reference types="vite/client" />
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRightIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { marketingCompany, marketingPaths } from '@/data/marketingRegistry';

const navigationItems = [
  { label: 'Решения', href: marketingPaths.solutions },
  { label: 'Продукт', href: marketingPaths.features },
  { label: 'Интеграции', href: marketingPaths.integrations },
  { label: 'Пакеты', href: marketingPaths.pricing },
  { label: 'Безопасность', href: marketingPaths.security },
  { label: 'Контакты', href: marketingPaths.contact },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const isActiveLink = (href: string) =>
    location.pathname === href || location.pathname.startsWith(`${href}/`);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 overflow-x-clip px-3 py-3 md:px-4">
      <div className="container-custom">
        <div className="overflow-hidden rounded-[1.75rem] border border-steel-200/80 bg-white/95 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.45)] backdrop-blur-xl">
          <div className="hidden items-center justify-between border-b border-steel-100 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-steel-500 xl:flex">
            <div className="flex items-center gap-3">
              <span>Платформа для подрядчика, генподрядчика и девелопера</span>
              <span className="h-1 w-1 rounded-full bg-steel-300" />
              <span>{marketingCompany.hours}</span>
            </div>
            <a
              href={marketingCompany.emailHref}
              className="transition hover:text-construction-700"
            >
              {marketingCompany.email}
            </a>
          </div>

          <div className="flex min-h-[72px] min-w-0 items-center justify-between gap-4 px-4 sm:min-h-[80px] sm:px-6">
            <Link to={marketingPaths.home} className="flex min-w-0 flex-1 items-center gap-3">
              <img
                src="/logo.svg"
                alt=""
                className="h-12 w-12 shrink-0 object-contain"
              />
              <div className="min-w-0">
                <div className="truncate text-lg font-bold text-steel-950">
                  {marketingCompany.brand}
                </div>
                <div className="hidden truncate text-[11px] uppercase tracking-[0.2em] text-steel-500 sm:block">
                  {marketingCompany.tagline}
                </div>
              </div>
            </Link>

            <div className="hidden flex-1 justify-center lg:flex">
              <div className="flex items-center gap-6">
                {navigationItems.map((item) => {
                  const active = isActiveLink(item.href);

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`relative pb-1 text-sm font-semibold transition ${
                        active
                          ? 'text-steel-950'
                          : 'text-steel-600 hover:text-construction-700'
                      }`}
                    >
                      {item.label}
                      <span
                        className={`absolute inset-x-0 -bottom-1 h-0.5 origin-left rounded-full bg-construction-500 transition ${
                          active ? 'scale-x-100' : 'scale-x-0'
                        }`}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <Link
                to="/login"
                className="rounded-full px-4 py-3 text-sm font-semibold text-steel-700 transition hover:bg-steel-100 hover:text-steel-950"
              >
                Войти
              </Link>
              <Link
                to={`${marketingPaths.home}#contact`}
                className="inline-flex items-center gap-2 rounded-full bg-steel-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-steel-900"
              >
                Запросить демо
                <ArrowUpRightIcon className="h-4 w-4" />
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen((value) => !value)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.25rem] border border-steel-200 bg-white text-steel-950 lg:hidden"
              aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
            >
              {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>

          <AnimatePresence>
            {isOpen ? (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="mx-4 mb-4 max-h-[calc(100svh-6.75rem)] overflow-y-auto rounded-[1.5rem] border border-steel-200 bg-white p-5 shadow-xl lg:hidden"
              >
                <div className="grid gap-2">
                  {navigationItems.map((item) => {
                    const active = isActiveLink(item.href);

                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={`rounded-[1.1rem] px-4 py-3 text-sm font-semibold transition ${
                          active
                            ? 'bg-construction-50 text-construction-700'
                            : 'text-steel-700 hover:bg-steel-50 hover:text-steel-950'
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-5 grid gap-3 border-t border-steel-100 pt-5">
                  <Link
                    to={`${marketingPaths.home}#contact`}
                    className="inline-flex items-center justify-center rounded-[1.1rem] bg-steel-950 px-4 py-3 text-sm font-semibold text-white"
                  >
                    Запросить демо
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded-[1.1rem] border border-steel-200 px-4 py-3 text-sm font-semibold text-steel-700"
                  >
                    Войти
                  </Link>
                </div>

                <div className="mt-5 rounded-[1.25rem] bg-concrete-50 px-4 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-steel-500">
                    Связь
                  </div>
                  <a
                    href={marketingCompany.emailHref}
                    className="mt-3 block text-sm font-semibold text-steel-950"
                  >
                    {marketingCompany.email}
                  </a>
                  <div className="mt-2 text-sm text-steel-600">{marketingCompany.hours}</div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
