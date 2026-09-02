import type { ComponentType, ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  BanknotesIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  CpuChipIcon,
  CubeIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  RectangleGroupIcon,
  ShieldCheckIcon,
  TruckIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { useSEO } from "@/hooks/useSEO";
import {
  legalDocuments,
  marketingCompany,
  marketingMaturityMeta,
  marketingPaths,
  marketingSurfaceMeta,
} from "@/data/marketingRegistry";
import type { MarketingMaturity, MarketingSurface } from "@/types/marketing";

const packageIcons: Record<string, ComponentType<{ className?: string }>> = {
  projects: BuildingOfficeIcon,
  finance: BanknotesIcon,
  supply: TruckIcon,
  analytics: ChartBarIcon,
  ai: CpuChipIcon,
  integrations: RectangleGroupIcon,
  enterprise: ShieldCheckIcon,
  "objects-execution": BuildingOfficeIcon,
  "supply-warehouse": TruckIcon,
  "finance-acts": BanknotesIcon,
  crm: BriefcaseIcon,
  "estimates-pto": RectangleGroupIcon,
  "holding-analytics": ChartBarIcon,
  "ai-contour": CpuChipIcon,
  "site-quality-handover": ClipboardDocumentCheckIcon,
  "construction-safety": ShieldCheckIcon,
  "machinery-and-labor": WrenchScrewdriverIcon,
  "workforce-management": UserGroupIcon,
  "change-control": ExclamationTriangleIcon,
  "pir-project-documentation": DocumentCheckIcon,
};

const isExternalHref = (href: string) =>
  href.startsWith("mailto:") || href.startsWith("http");

export const MarketingLink = ({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) => {
  if (isExternalHref(href)) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  if (href.startsWith("#")) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  );
};

export const SectionHeader = ({
  title,
  description,
  align = "left",
  tone = "light",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
}) => (
  <div className={`most-section-intro is-${align} tone-${tone}`}>
    <h2>{title}</h2>
    {description ? <p>{description}</p> : null}
  </div>
);

export const PageSectionNav = ({
  items,
  className = "",
}: {
  items: { label: string; href: string }[];
  className?: string;
}) => (
  <nav
    className={`most-section-nav ${className}`}
    aria-label="Разделы страницы"
  >
    {items.map((item) => (
      <MarketingLink
        key={`${item.href}-${item.label}`}
        href={item.href}
        className="most-section-nav-link"
      >
        {item.label}
        <span aria-hidden="true">↗</span>
      </MarketingLink>
    ))}
  </nav>
);

export const PageHero = ({
  eyebrow,
  title,
  description,
  actions = [],
  nav = [],
  aside,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: { label: string; href: string; primary?: boolean }[];
  nav?: { label: string; href: string }[];
  aside?: ReactNode;
}) => (
  <section className="most-page-hero">
    <div className="most-container">
      <div className={`most-page-hero-layout ${aside ? "has-aside" : ""}`}>
        <div>
          {eyebrow ? <p className="most-page-label">{eyebrow}</p> : null}
          <h1>{title}</h1>
          <p className="most-page-description">{description}</p>
          {actions.length > 0 ? (
            <div className="most-page-actions">
              {actions.map((action) => (
                <MarketingLink
                  key={`${action.href}-${action.label}`}
                  href={action.href}
                  className={
                    action.primary
                      ? "most-button most-button-orange"
                      : "most-text-link"
                  }
                >
                  {action.label}
                  <span aria-hidden="true">↗</span>
                </MarketingLink>
              ))}
            </div>
          ) : null}
        </div>
        {aside ? <div className="most-page-aside">{aside}</div> : null}
      </div>
      {nav.length > 0 ? <PageSectionNav items={nav} /> : null}
    </div>
  </section>
);

export const MaturityBadge = ({
  maturity,
}: {
  maturity: MarketingMaturity;
}) => {
  const meta = marketingMaturityMeta[maturity];

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${meta.tone}`}
      title={meta.description}
    >
      {meta.label}
    </span>
  );
};

export const SurfaceBadges = ({
  surfaces,
}: {
  surfaces: MarketingSurface[];
}) => (
  <div className="flex flex-wrap gap-2">
    {surfaces.map((surface) => {
      const meta = marketingSurfaceMeta[surface];

      return (
        <span
          key={surface}
          className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${meta.tone}`}
        >
          {meta.label}
        </span>
      );
    })}
  </div>
);

export const PackageIcon = ({
  slug,
  className = "h-6 w-6",
}: {
  slug: string;
  className?: string;
}) => {
  const Icon = packageIcons[slug] ?? CubeIcon;

  return <Icon className={className} />;
};

export const formatPackagePrice = ({
  price,
  priceLabel,
  billingModel,
  durationDays,
}: {
  price: number;
  priceLabel?: string;
  billingModel: "free" | "subscription";
  durationDays?: number;
}) => {
  if (priceLabel) {
    return priceLabel;
  }

  if (billingModel === "free" && durationDays) {
    return `${durationDays} дней`;
  }

  if (billingModel === "free") {
    return "Бесплатно";
  }

  if (price <= 0) {
    return "По запросу";
  }

  return `от ${price.toLocaleString("ru-RU")} ₽/мес`;
};

export const LegalDocumentView = ({
  documentKey,
}: {
  documentKey: keyof typeof legalDocuments;
}) => {
  const document = legalDocuments[documentKey];

  useSEO({
    title: document.seo.title,
    description: document.seo.description,
    keywords: document.seo.keywords,
    noIndex: document.seo.noIndex,
    type: "website",
  });

  return (
    <div className="marketing-page-shell">
      <PageHero
        eyebrow={document.shortTitle}
        title={document.title}
        description={document.intro}
        aside={
          <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-steel-500">
              Версия документа
            </div>
            <div className="mt-3 text-lg font-bold text-steel-950">
              {document.version}
            </div>
            <div className="mt-2 text-sm text-steel-600">
              Обновлено: {document.updatedAt}
            </div>
            <div className="mt-6 border-t border-steel-100 pt-6">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-steel-500">
                Контакт по вопросам
              </div>
              <a
                href={marketingCompany.emailHref}
                className="mt-3 block text-base font-semibold text-construction-700"
              >
                {marketingCompany.email}
              </a>
              <p className="mt-3 text-sm leading-7 text-steel-600">
                {marketingCompany.legalStatusNote}
              </p>
            </div>
          </div>
        }
      />

      <section className="py-16 lg:py-20">
        <div className="container-custom grid gap-10 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="rounded-[1.75rem] border border-steel-200 bg-concrete-50 p-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-steel-500">
              Ключевые положения
            </div>
            <div className="mt-5 space-y-3">
              {document.highlights.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.25rem] border border-white bg-white px-4 py-4 text-sm leading-7 text-steel-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </aside>

          <div className="space-y-5">
            {document.sections.map((section) => (
              <article
                key={section.title}
                className="rounded-[1.75rem] border border-steel-200 bg-white p-7 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-steel-950">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4 text-sm leading-7 text-steel-700">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {section.bullets?.length ? (
                  <div className="mt-5 grid gap-3">
                    {section.bullets.map((bullet) => (
                      <div
                        key={bullet}
                        className="rounded-[1.25rem] bg-concrete-50 px-4 py-4 text-sm leading-7 text-steel-700"
                      >
                        {bullet}
                      </div>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-steel-100 bg-concrete-50 py-16">
        <div className="container-custom flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xl font-bold text-steel-950">
              Нужна дополнительная информация?
            </div>
            <p className="mt-2 text-sm text-steel-600">
              Напишите нам или перейдите на страницу контактов, если нужно
              обсудить документы детальнее.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              to={marketingPaths.contact}
              className="inline-flex w-full items-center justify-center rounded-full bg-steel-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-steel-900 sm:w-auto"
            >
              Перейти к контактам
            </Link>
            <Link
              to={marketingPaths.cookies}
              className="inline-flex w-full items-center justify-center rounded-full border border-steel-300 bg-white px-5 py-3 text-center text-sm font-semibold text-steel-700 transition hover:border-construction-300 hover:text-construction-700 sm:w-auto"
            >
              Политика cookie
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
