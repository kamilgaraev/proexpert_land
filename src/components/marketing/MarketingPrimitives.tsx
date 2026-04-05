import type { ComponentType, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRightIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  CpuChipIcon,
  CubeIcon,
  RectangleGroupIcon,
  ShieldCheckIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { useSEO } from '@/hooks/useSEO';
import {
  legalDocuments,
  marketingCompany,
  marketingMaturityMeta,
  marketingPaths,
  marketingSurfaceMeta,
} from '@/data/marketingRegistry';
import type { MarketingMaturity, MarketingSurface } from '@/types/marketing';

const packageIcons: Record<string, ComponentType<{ className?: string }>> = {
  projects: BuildingOfficeIcon,
  finance: BanknotesIcon,
  supply: TruckIcon,
  analytics: ChartBarIcon,
  ai: CpuChipIcon,
  integrations: RectangleGroupIcon,
  enterprise: ShieldCheckIcon,
};

const isExternalHref = (href: string) => href.startsWith('mailto:') || href.startsWith('http');

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

  if (href.startsWith('#')) {
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
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'light',
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  tone?: 'light' | 'dark';
}) => {
  const wrapperClass = align === 'center' ? 'mx-auto text-center' : '';
  const eyebrowClass =
    tone === 'dark'
      ? 'border-white/15 bg-white/5 text-construction-200'
      : 'border-construction-200 bg-construction-50 text-construction-700';
  const titleClass = tone === 'dark' ? 'text-white' : 'text-steel-950';
  const descriptionClass = tone === 'dark' ? 'text-white/72' : 'text-steel-600';

  return (
    <div className={`max-w-4xl ${wrapperClass}`}>
      <div
        className={`inline-flex items-center rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] ${eyebrowClass}`}
      >
        {eyebrow}
      </div>
      <h2
        className={`mt-4 max-w-4xl font-sans text-[clamp(1.85rem,3.6vw,3.2rem)] font-bold leading-[1.04] tracking-tight [overflow-wrap:anywhere] [text-wrap:balance] sm:mt-5 ${titleClass}`}
      >
        {title}
      </h2>
      {description ? (
        <p className={`mt-4 max-w-3xl text-sm leading-7 sm:mt-5 sm:text-base sm:leading-8 ${descriptionClass}`}>{description}</p>
      ) : null}
    </div>
  );
};

export const PageSectionNav = ({
  items,
  className = '',
}: {
  items: { label: string; href: string }[];
  className?: string;
}) => (
  <div className={`overflow-x-auto pb-2 ${className}`}>
    <div className="flex min-w-max gap-3 sm:min-w-0 sm:flex-wrap">
      {items.map((item) => (
        <MarketingLink
          key={`${item.href}-${item.label}`}
          href={item.href}
          className="inline-flex items-center whitespace-nowrap rounded-full border border-steel-200 bg-white px-4 py-2 text-sm font-semibold text-steel-700 transition hover:border-construction-300 hover:text-construction-700"
        >
          {item.label}
        </MarketingLink>
      ))}
    </div>
  </div>
);

export const PageHero = ({
  eyebrow,
  title,
  description,
  actions = [],
  nav = [],
  aside,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: { label: string; href: string; primary?: boolean }[];
  nav?: { label: string; href: string }[];
  aside?: ReactNode;
}) => (
  <section className="overflow-x-hidden border-b border-steel-100 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.16),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(148,163,184,0.16),_transparent_24%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
    <div className="container-custom py-12 sm:py-14 lg:py-20">
      <div className={`grid gap-8 ${aside ? 'xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] xl:items-start' : ''}`}>
        <div className="min-w-0 max-w-4xl">
          <div className="inline-flex items-center rounded-full border border-construction-200 bg-construction-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-construction-700">
            {eyebrow}
          </div>
          <h1 className="mt-4 max-w-full font-sans text-[clamp(1.9rem,8vw,4.4rem)] font-bold leading-[0.98] tracking-tight text-steel-950 [overflow-wrap:anywhere] [text-wrap:balance] sm:mt-5 sm:max-w-4xl sm:text-[clamp(2rem,5.4vw,4.4rem)]">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl break-words text-base leading-7 text-steel-600 sm:mt-6 sm:text-lg sm:leading-8">{description}</p>

          {actions.length > 0 ? (
            <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
              {actions.map((action) => (
                <MarketingLink
                  key={`${action.href}-${action.label}`}
                  href={action.href}
                  className={`inline-flex w-full min-w-0 flex-wrap items-center justify-center gap-2 rounded-full px-5 py-3 text-center text-sm font-semibold whitespace-normal [overflow-wrap:anywhere] transition sm:w-auto ${
                    action.primary
                      ? 'bg-steel-950 text-white hover:-translate-y-0.5 hover:bg-steel-900'
                      : 'border border-steel-200 bg-white text-steel-700 hover:border-construction-300 hover:text-construction-700'
                  }`}
                >
                  {action.label}
                  {action.primary ? <ArrowUpRightIcon className="h-4 w-4 shrink-0" /> : null}
                </MarketingLink>
              ))}
            </div>
          ) : null}
        </div>

        {aside ? <div className="min-w-0">{aside}</div> : null}
      </div>

      {nav.length > 0 ? <PageSectionNav items={nav} className="mt-8 sm:mt-10" /> : null}
    </div>
  </section>
);

export const MaturityBadge = ({ maturity }: { maturity: MarketingMaturity }) => {
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

export const SurfaceBadges = ({ surfaces }: { surfaces: MarketingSurface[] }) => (
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
  className = 'h-6 w-6',
}: {
  slug: string;
  className?: string;
}) => {
  const Icon = packageIcons[slug] ?? CubeIcon;

  return <Icon className={className} />;
};

export const formatPackageTierPrice = ({
  price,
  priceLabel,
  billingModel,
  durationDays,
}: {
  price: number;
  priceLabel?: string;
  billingModel: 'free' | 'subscription';
  durationDays?: number;
}) => {
  if (priceLabel) {
    return priceLabel;
  }

  if (billingModel === 'free' && durationDays) {
    return `${durationDays} дней`;
  }

  if (billingModel === 'free') {
    return 'Бесплатно';
  }

  if (price <= 0) {
    return 'По запросу';
  }

  return `от ${price.toLocaleString('ru-RU')} ₽/мес`;
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
    type: 'website',
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
            <div className="mt-3 text-lg font-bold text-steel-950">{document.version}</div>
            <div className="mt-2 text-sm text-steel-600">Обновлено: {document.updatedAt}</div>
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
                <h2 className="text-2xl font-bold text-steel-950">{section.title}</h2>
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
            <div className="text-xl font-bold text-steel-950">Нужна дополнительная информация?</div>
            <p className="mt-2 text-sm text-steel-600">
              Напишите нам или перейдите на страницу контактов, если нужно обсудить документы
              детальнее.
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
