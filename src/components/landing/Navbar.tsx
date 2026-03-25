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
      setIsScrolled(window.scrollY > 24);
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

  const navSurfaceClass =
    isScrolled || location.pathname !== '/'
      ? 'border-b border-steel-200 bg-white/92 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.55)] backdrop-blur-xl'
      : 'bg-white/65 backdrop-blur-xl';

  return (
    <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${navSurfaceClass}`}>
      <div className="container-custom">
        <div className="flex h-20 items-center justify-between">
          <Link to={marketingPaths.home} className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-steel-950 text-construction-300">
              <BuildingOfficeIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xl font-bold text-steel-950">{marketingCompany.brand}</div>
              <div className="text-xs uppercase tracking-[0.22em] text-steel-500">
                {marketingCompany.tagline}
              </div>
            </div>
          </Link>

          <div className="hidden xl:flex items-center gap-2 rounded-full border border-steel-200 bg-white px-3 py-2 shadow-sm">
            {marketingNavigation.map((item) => {
              const active = isActiveLink(item.href, item.exact);
              const className = active
                ? 'bg-construction-50 text-construction-700'
                : 'text-steel-700 hover:bg-steel-50 hover:text-steel-950';

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
            <a
              href={marketingCompany.emailHref}
              className="inline-flex items-center gap-2 rounded-full border border-steel-200 bg-white px-4 py-3 text-sm font-semibold text-steel-700 transition hover:border-construction-300 hover:text-construction-700"
            >
              {marketingCompany.email}
            </a>
            <Link
              to={marketingPaths.contact}
              className="rounded-full px-5 py-3 text-sm font-semibold text-steel-700 transition hover:bg-steel-100 hover:text-steel-950"
            >
              Контакты
            </Link>
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
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-steel-200 bg-white text-steel-900 lg:hidden"
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
                  const className = active
                    ? 'bg-construction-50 text-construction-700'
                    : 'text-steel-700 hover:bg-steel-50 hover:text-steel-950';

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`block rounded-2xl px-4 py-3 text-sm font-semibold transition ${className}`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-5 border-t border-steel-100 pt-5">
                <a
                  href={marketingCompany.emailHref}
                  className="flex items-center gap-3 rounded-2xl bg-concrete-50 px-4 py-3 text-sm font-semibold text-steel-700"
                >
                  {marketingCompany.email}
                </a>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Link
                    to={marketingPaths.contact}
                    className="inline-flex items-center justify-center rounded-2xl border border-steel-200 px-4 py-3 text-sm font-semibold text-steel-700"
                  >
                    Контакты
                  </Link>
                  <Link
                    to={`${marketingPaths.home}#contact`}
                    className="inline-flex items-center justify-center rounded-2xl bg-steel-950 px-4 py-3 text-sm font-semibold text-white"
                  >
                    Запросить демо
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
