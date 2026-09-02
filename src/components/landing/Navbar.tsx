import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { marketingPaths } from "@/data/marketingRegistry";

const navigationItems = [
  { label: "Продукт", href: marketingPaths.features },
  { label: "Решения", href: marketingPaths.solutions },
  { label: "Стоимость", href: marketingPaths.pricing },
  { label: "Блог", href: marketingPaths.blog },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        toggleRef.current?.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 1080px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setIsOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [isOpen]);

  const isActiveLink = (href: string) =>
    location.pathname === href || location.pathname.startsWith(`${href}/`);

  return (
    <header className="most-header">
      <div className="most-container most-header-row">
        <Link to="/" className="most-brand" aria-label="МОСТ — главная">
          <img src="/logo.svg" alt="" width={38} height={38} />
          <span>МОСТ</span>
        </Link>
        <nav className="most-desktop-nav" aria-label="Основная навигация">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              aria-current={isActiveLink(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="most-header-actions">
          <Link to="/login" className="most-login">
            Войти
          </Link>
          <Link
            to="/#contact"
            className="most-button most-button-dark most-header-demo"
          >
            Посмотреть демо
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="most-menu-toggle"
            aria-expanded={isOpen}
            aria-controls="most-mobile-navigation"
            aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
            onClick={() => setIsOpen((value) => !value)}
          >
            <span>{isOpen ? "Закрыть" : "Меню"}</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              {isOpen ? (
                <path
                  d="m5 5 10 10M15 5 5 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              ) : (
                <path
                  d="M3 6h14M3 13h14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              )}
            </svg>
          </button>
        </div>
      </div>
      <nav
        id="most-mobile-navigation"
        className="most-mobile-nav"
        aria-label="Мобильная навигация"
        hidden={!isOpen}
      >
        <div className="most-container">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              aria-current={isActiveLink(item.href) ? "page" : undefined}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
          <Link to={marketingPaths.contact} onClick={() => setIsOpen(false)}>
            Контакты<span aria-hidden="true">↗</span>
          </Link>
          <Link
            to="/register"
            className="most-button most-button-orange"
            onClick={() => setIsOpen(false)}
          >
            Начать бесплатно
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
