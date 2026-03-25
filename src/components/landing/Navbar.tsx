/// <reference types="vite/client" />
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRightIcon,
  Bars3Icon,
  BuildingOfficeIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  marketingCompany,
  marketingNavigation,
  marketingPaths,
} from '@/data/marketingRegistry';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.hash]);

  const isActiveLink = (href: string, exact = false) => {
    if (href.startsWith('/#')) {
      return location.pathname === '/';
    }

    if (exact) {
      return location.pathname === href;
    }

    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 px-3 py-3 md:px-4">
      <div className="container-custom">
        <div className="overflow-hidden rounded-[2rem] border border-steel-200/90 bg-white/92 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.55)] backdrop-blur-2xl">
          <div className="hidden xl:flex items-center justify-between border-b border-steel-100 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-steel-500">
            <div className="flex items-center gap-3">
              <span>Для подрядчика, генподрядчика и девелопера</span>
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

          <div className="flex min-h-[86px] items-center justify-between gap-4 px-4 sm:px-6">
            <Link to={marketingPaths.home} className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-steel-950 text-construction-200">
                <BuildingOfficeIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-lg font-bold text-steel-950">
                  {marketingCompany.brand}
                </div>
                <div className="truncate text-[11px] uppercase tracking-[0.22em] text-steel-500">
                  {marketingCompany.tagline}
                </div>
              </div>
            </Link>

            <div className="hidden flex-1 justify-center px-4 lg:flex xl:px-8">
              <div className="flex flex-wrap items-center gap-1 rounded-full border border-steel-200 bg-steel-50 p-1.5">
                {marketingNavigation.map((item) => {
                  const active = isActiveLink(item.href, item.exact);

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                        active
                          ? 'bg-white text-steel-950 shadow-sm'
                          : 'text-steel-600 hover:bg-white hover:text-steel-950'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <Link
                to="/login"
                className="hidden rounded-full px-4 py-3 text-sm font-semibold text-steel-700 transition hover:bg-steel-100 hover:text-steel-950 xl:inline-flex"
              >
                Войти
              </Link>
              <Link
                to={marketingPaths.contact}
                className="hidden rounded-full border border-steel-200 px-4 py-3 text-sm font-semibold text-steel-700 transition hover:border-construction-300 hover:text-construction-700 2xl:inline-flex"
              >
                Контакты
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
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-steel-200 bg-white text-steel-950 lg:hidden"
              aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
            >
              {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>

          <AnimatePresence>
            {isOpen ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="mx-4 mb-4 rounded-[1.75rem] border border-steel-200 bg-white p-5 shadow-xl lg:hidden"
              >
                <div className="grid gap-2">
                  {marketingNavigation.map((item) => {
                    const active = isActiveLink(item.href, item.exact);

                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
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
                    className="inline-flex items-center justify-center rounded-2xl bg-steel-950 px-4 py-3 text-sm font-semibold text-white"
                  >
                    Запросить демо
                  </Link>
                  <Link
                    to={marketingPaths.contact}
                    className="inline-flex items-center justify-center rounded-2xl border border-steel-200 px-4 py-3 text-sm font-semibold text-steel-700"
                  >
                    Контакты
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded-2xl border border-steel-200 px-4 py-3 text-sm font-semibold text-steel-700"
                  >
                    Войти
                  </Link>
                </div>

                <div className="mt-5 rounded-[1.5rem] bg-concrete-50 px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-steel-500">
                    Связаться
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
