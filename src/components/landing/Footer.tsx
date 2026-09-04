import { Link } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/24/outline";
import {
  marketingCommercialLandingLinks,
  marketingCompany,
  marketingPaths,
} from "@/data/marketingRegistry";

const groups = [
  {
    title: "Продукт",
    links: [
      { label: "Возможности", href: marketingPaths.features },
      { label: "Стоимость", href: marketingPaths.pricing },
      { label: "Интеграции", href: marketingPaths.integrations },
      { label: "Безопасность", href: marketingPaths.security },
    ],
  },
  {
    title: "Для команды",
    links: [
      { label: "Решения для компаний", href: marketingPaths.solutions },
      { label: "Прорабу", href: marketingPaths.foremanSoftware },
      { label: "Инженеру ПТО", href: marketingPaths.ptoSoftware },
      { label: "Снабжению", href: marketingPaths.constructionProcurement },
    ],
  },
  {
    title: "О МОСТ",
    links: [
      { label: "О компании", href: marketingPaths.about },
      { label: "Блог", href: marketingPaths.blog },
      { label: "Контакты", href: marketingPaths.contact },
    ],
  },
];

const Footer = () => (
  <footer className="most-footer">
    <div className="most-container">
      <div className="most-footer-main">
        <div className="most-footer-brand">
          <Link to="/" className="most-brand" aria-label="МОСТ — главная">
            <img src="/logo.svg" alt="" width={38} height={38} />
            <span>МОСТ</span>
          </Link>
          <p>Между офисом и стройкой.</p>
          <a href={marketingCompany.emailHref}>{marketingCompany.email}</a>
        </div>
        {groups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2>{group.title}</h2>
            {group.links.map((link) => (
              <Link key={link.href} to={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <details className="most-footer-directions">
        <summary>
          Все направления работы{" "}
          <span aria-hidden="true">
            <PlusIcon className="most-icon" />
          </span>
        </summary>
        <nav aria-label="Направления работы">
          {marketingCommercialLandingLinks.map((link) => (
            <Link key={link.href} to={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </details>
      <div className="most-footer-bottom">
        <span>© {new Date().getFullYear()} МОСТ</span>
        <Link to="/privacy">Конфиденциальность</Link>
        <Link to={marketingPaths.offer}>Оферта</Link>
      </div>
    </div>
  </footer>
);

export default Footer;
