import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import {
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
  const alignmentClass = align === 'center' ? 'mx-auto text-center' : '';
  const eyebrowClass =
    tone === 'dark'
      ? 'border-white/15 bg-white/5 text-construction-200'
      : 'border-construction-200 bg-construction-50 text-construction-700';
  const titleClass = tone === 'dark' ? 'text-white' : 'text-steel-950';
  const descriptionClass = tone === 'dark' ? 'text-white/70' : 'text-steel-600';

  return (
    <div className={`max-w-3xl ${alignmentClass}`}>
      <div
        className={`inline-flex rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] ${eyebrowClass}`}
      >
        {eyebrow}
      </div>
      <h2 className={`mt-5 text-4xl font-bold tracking-tight sm:text-5xl ${titleClass}`}>
        {title}
      </h2>
      {description ? (
        <p className={`mt-5 text-lg leading-8 ${descriptionClass}`}>{description}</p>
      ) : null}
    </div>
  );
};

export const MaturityBadge = ({ maturity }: { maturity: MarketingMaturity }) => {
  const meta = marketingMaturityMeta[maturity];

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${meta.tone}`}
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
          className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.tone}`}
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
    <div className="bg-white pt-28">
      <section className="border-b border-steel-100 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.15),_transparent_28%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
        <div className="container-custom py-16 lg:py-20">
          <div className="max-w-4xl">
            <div className="inline-flex rounded-full border border-steel-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-steel-700">
              {document.shortTitle}
            </div>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-steel-950 sm:text-5xl">
              {document.title}
            </h1>
            <p className="mt-5 text-lg leading-8 text-steel-600">{document.intro}</p>
            <div className="mt-8 flex flex-wrap gap-4 text-sm text-steel-500">
              <span>Версия {document.version}</span>
              <span>Обновлено: {document.updatedAt}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container-custom grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <aside className="space-y-6 rounded-[2rem] border border-steel-200 bg-concrete-50 p-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-steel-500">
                Ключевые положения
              </div>
              <div className="mt-4 space-y-3">
                {document.highlights.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white bg-white px-4 py-4 text-sm leading-7 text-steel-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-steel-950 p-5 text-white">
              <div className="text-sm font-semibold">Контакты по юридическим вопросам</div>
              <a
                href={marketingCompany.emailHref}
                className="mt-3 block text-lg font-bold text-construction-300"
              >
                {marketingCompany.email}
              </a>
              <p className="mt-3 text-sm leading-6 text-white/75">
                {marketingCompany.legalStatusNote}
              </p>
            </div>
          </aside>

          <div className="space-y-6">
            {document.sections.map((section) => (
              <article
                key={section.title}
                className="rounded-[2rem] border border-steel-200 bg-white p-7 shadow-sm"
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
                        className="rounded-2xl bg-concrete-50 px-4 py-4 text-sm leading-7 text-steel-700"
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
              Оставьте запрос через форму или перейдите на страницу контактов.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to={marketingPaths.contact}
              className="inline-flex items-center justify-center rounded-2xl bg-steel-950 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-steel-900"
            >
              Перейти к контактам
            </Link>
            <Link
              to={marketingPaths.cookies}
              className="inline-flex items-center justify-center rounded-2xl border border-steel-300 bg-white px-6 py-3 text-sm font-semibold text-steel-900 transition hover:border-steel-500"
            >
              Настройки cookie
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
