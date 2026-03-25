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
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 18);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const shellClass =
    isScrolled || location.pathname !== '/'
      ? 'border-steel-200 bg-white/92 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)]'
      : 'border-white/15 bg-white/10 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]';
  const textClass =
    isScrolled || location.pathname !== '/' ? 'text-steel-950' : 'text-white';
  const mutedClass =
    isScrolled || location.pathname !== '/' ? 'text-steel-500' : 'text-white/58';

  return (
    <nav className="fixed inset-x-0 top-0 z-50 px-3 py-3 md:px-4">
      <div className="container-custom">
        <div
          className={`rounded-[1.75rem] border px-4 backdrop-blur-xl transition-all duration-300 ${shellClass}`}
        >
          <div className="flex min-h-[78px] items-center justify-between gap-4">
            <Link to={marketingPaths.home} className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-steel-950 text-construction-200">
                <BuildingOfficeIcon className="h-6 w-6" />
              </div>
              <div>
                <div className={`text-lg font-bold ${textClass}`}>{marketingCompany.brand}</div>
                <div className={`text-[11px] uppercase tracking-[0.22em] ${mutedClass}`}>
                  {marketingCompany.tagline}
                </div>
              </div>
            </Link>

            <div className="hidden xl:flex items-center gap-1 rounded-full border border-black/5 bg-black/[0.03] px-2 py-2">
              {marketingNavigation.map((item) => {
                const active = isActiveLink(item.href, item.exact);
                const className = active
                  ? 'bg-white text-steel-950 shadow-sm'
                  : `${textClass} hover:bg-white/60 hover:text-steel-950`;

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${className}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <Link
                to="/login"
                className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                  isScrolled || location.pathname !== '/'
                    ? 'text-steel-700 hover:bg-steel-100 hover:text-steel-950'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Войти
              </Link>
              <a
                href={marketingCompany.emailHref}
                className={`rounded-full border px-4 py-3 text-sm font-semibold transition ${
                  isScrolled || location.pathname !== '/'
                    ? 'border-steel-200 text-steel-700 hover:border-construction-300 hover:text-construction-700'
                    : 'border-white/15 text-white hover:bg-white/10'
                }`}
              >
                {marketingCompany.email}
              </a>
              <Link
                to={`${marketingPaths.home}#contact`}
                className="inline-flex items-center gap-2 rounded-full bg-steel-950 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-steel-900"
              >
                Запросить демо
                <ArrowUpRightIcon className="h-4 w-4" />
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen((value) => !value)}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border lg:hidden ${
                isScrolled || location.pathname !== '/'
                  ? 'border-steel-200 bg-white text-steel-950'
                  : 'border-white/15 bg-white/10 text-white'
              }`}
            >
              {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="mb-4 rounded-[1.75rem] border border-steel-200 bg-white p-5 shadow-xl lg:hidden"
              >
                <div className="space-y-2">
                  {marketingNavigation.map((item) => {
                    const active = isActiveLink(item.href, item.exact);

                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={`block rounded-2xl px-4 py-3 text-sm font-semibold transition ${
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
                    to="/login"
                    className="inline-flex items-center justify-center rounded-2xl border border-steel-200 px-4 py-3 text-sm font-semibold text-steel-700"
                  >
                    Войти
                  </Link>
                  <a
                    href={marketingCompany.emailHref}
                    className="inline-flex items-center justify-center rounded-2xl border border-steel-200 px-4 py-3 text-sm font-semibold text-steel-700"
                  >
                    {marketingCompany.email}
                  </a>
                  <Link
                    to={`${marketingPaths.home}#contact`}
                    className="inline-flex items-center justify-center rounded-2xl bg-steel-950 px-4 py-3 text-sm font-semibold text-white"
                  >
                    Запросить демо
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
