import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRightIcon,
  CheckIcon,
  ChevronDownIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import ContactForm from '@/components/landing/ContactForm';
import {
  MaturityBadge,
  PackageIcon,
  SectionHeader,
  SurfaceBadges,
  formatPackageTierPrice,
} from '@/components/marketing/MarketingPrimitives';
import {
  marketingAdvancedOffers,
  marketingCapabilityMatrix,
  marketingFaqs,
  marketingHeroFacts,
  marketingLaunchSteps,
  marketingPackages,
  marketingPaths,
  marketingSeo,
  marketingSolutionSegments,
  marketingTrustFacts,
} from '@/data/marketingRegistry';
import useAnalytics from '@/hooks/useAnalytics';
import { useSEO } from '@/hooks/useSEO';

const HomePage = () => {
  const { addFAQSchema } = useSEO({
    ...marketingSeo.home,
    type: 'website',
  });
  const { trackButtonClick, trackPageView } = useAnalytics();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    addFAQSchema(marketingFaqs);
  }, [addFAQSchema]);

  useEffect(() => {
    trackPageView('marketing_home');
  }, [trackPageView]);

  const capabilityPreview = marketingCapabilityMatrix.slice(0, 6);
  const packagePreview = marketingPackages.slice(0, 4);

  return (
    <div className="overflow-hidden bg-white">
      <section className="border-b border-steel-100 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.2),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_24%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] pt-24">
        <div className="container-custom py-16 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-construction-200 bg-construction-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-construction-700">
                <SparklesIcon className="h-4 w-4" />
                Corporate product site
              </div>
              <h1 className="mt-6 max-w-4xl text-5xl font-bold tracking-tight text-steel-950 sm:text-6xl">
                Единый operating system для стройки: объекты, снабжение, финансы,
                документы, mobile и holding.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-steel-600">
                ProHelper показывает только подтверждённые сценарии продукта:
                существующие модули backend, admin, mobile, LK и enterprise-контуров
                без вымышленных кейсов и неподтверждённых обещаний.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  to={`${marketingPaths.home}#contact`}
                  onClick={() => trackButtonClick('hero_demo', 'marketing_home')}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-steel-950 px-6 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-steel-900"
                >
                  Запросить demo
                  <ArrowUpRightIcon className="h-4 w-4" />
                </Link>
                <Link
                  to={marketingPaths.pricing}
                  onClick={() => trackButtonClick('hero_pricing', 'marketing_home')}
                  className="inline-flex items-center justify-center rounded-2xl border border-steel-300 bg-white px-6 py-4 text-sm font-semibold text-steel-900 transition hover:border-steel-500"
                >
                  Посмотреть пакеты
                </Link>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {[
                  'Пакетная модель синхронизирована с личным кабинетом.',
                  'Mobile, admin, LK и holding живут на одном backend-контуре.',
                  'AI-возможности показаны только с честной маркировкой зрелости.',
                  'Внедрение стартует с рабочего процесса, а не с витринной презентации.',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-steel-200 bg-white px-4 py-4 text-sm leading-6 text-steel-700 shadow-sm"
                  >
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-construction-600" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-steel-200 bg-steel-950 p-7 text-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.7)]">
              <div className="text-sm font-semibold uppercase tracking-[0.22em] text-construction-200">
                Что уже автоматизировано
              </div>
              <div className="mt-6 space-y-4">
                {capabilityPreview.map((capability) => (
                  <div
                    key={capability.id}
                    className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-lg font-semibold">{capability.title}</div>
                      <MaturityBadge maturity={capability.maturity} />
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/75">
                      {capability.publicClaim}
                    </p>
                    <div className="mt-4">
                      <SurfaceBadges surfaces={capability.surfaces} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {marketingHeroFacts.map((fact) => (
              <div
                key={fact.label}
                className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm"
              >
                <div className="text-3xl font-bold text-steel-950">{fact.value}</div>
                <div className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-construction-700">
                  {fact.label}
                </div>
                <p className="mt-3 text-sm leading-7 text-steel-600">{fact.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Для кого"
            title="Сценарии от подрядчика до холдинга"
            description="Показываем продукт через роли и контуры управления, а не через разрозненный каталог фич."
            align="center"
          />

          <div className="mt-12 grid gap-5 xl:grid-cols-4">
            {marketingSolutionSegments.map((segment) => (
              <article
                key={segment.id}
                className="rounded-[2rem] border border-steel-200 bg-white p-7 shadow-sm"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-construction-700">
                  {segment.title}
                </div>
                <h2 className="mt-4 text-2xl font-bold text-steel-950">
                  {segment.audience}
                </h2>
                <p className="mt-4 text-sm leading-7 text-steel-600">
                  {segment.challenge}
                </p>
                <div className="mt-5 rounded-[1.5rem] bg-concrete-50 p-4 text-sm leading-7 text-steel-700">
                  {segment.transformation}
                </div>
                <div className="mt-5 space-y-2">
                  {segment.workflows.map((workflow) => (
                    <div
                      key={workflow}
                      className="flex items-start gap-3 text-sm leading-6 text-steel-700"
                    >
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-construction-600" />
                      {workflow}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-concrete-50 py-16 lg:py-24">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Возможности"
            title="Подтверждённые capability matrix для публичных claims"
            description="Каждый блок ниже связан с реальными module slug, surface-ами и ролями внутри ProHelper."
          />

          <div className="mt-12 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {marketingCapabilityMatrix.map((capability) => (
              <article
                key={capability.id}
                className="rounded-[2rem] border border-steel-200 bg-white p-7 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-steel-500">
                    {capability.businessContour}
                  </div>
                  <MaturityBadge maturity={capability.maturity} />
                </div>
                <h3 className="mt-4 text-2xl font-bold text-steel-950">
                  {capability.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-steel-600">
                  {capability.summary}
                </p>
                <p className="mt-4 rounded-[1.5rem] bg-concrete-50 px-4 py-4 text-sm leading-7 text-steel-700">
                  {capability.publicClaim}
                </p>
                <div className="mt-4">
                  <SurfaceBadges surfaces={capability.surfaces} />
                </div>
                <div className="mt-5 space-y-2">
                  {capability.outcomes.map((outcome) => (
                    <div
                      key={outcome}
                      className="flex items-start gap-3 text-sm leading-6 text-steel-700"
                    >
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-construction-600" />
                      {outcome}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Пакеты"
            title="Коммерческая модель строится от реальных package family"
            description="Pricing синхронизирована с текущей пакетной моделью LK: base, pro и enterprise-tier в существующих семействах."
          />

          <div className="mt-12 grid gap-5 xl:grid-cols-4">
            {packagePreview.map((item) => (
              <article
                key={item.slug}
                className="rounded-[2rem] border border-steel-200 bg-white p-7 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-construction-50 text-construction-700">
                    <PackageIcon slug={item.slug} className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-steel-950">{item.name}</h3>
                    <p className="mt-1 text-sm text-steel-500">{item.bestFor}</p>
                  </div>
                </div>
                <div className="mt-5 text-3xl font-bold text-steel-950">
                  {formatPackageTierPrice(item.tiers[0])}
                </div>
                <p className="mt-3 text-sm leading-7 text-steel-600">
                  {item.description}
                </p>
                <div className="mt-5 space-y-2">
                  {item.tiers[0].highlights.map((highlight) => (
                    <div
                      key={highlight}
                      className="rounded-2xl bg-concrete-50 px-4 py-4 text-sm leading-6 text-steel-700"
                    >
                      {highlight}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {marketingAdvancedOffers.map((offer) => (
              <article
                key={offer.id}
                className="rounded-[2rem] border border-steel-200 bg-steel-950 p-7 text-white"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-construction-200">
                    Advanced offer
                  </div>
                  <MaturityBadge maturity={offer.maturity} />
                </div>
                <h3 className="mt-4 text-2xl font-bold">{offer.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/75">{offer.summary}</p>
                <div className="mt-4">
                  <SurfaceBadges surfaces={offer.surfaces} />
                </div>
                <div className="mt-5 text-sm font-semibold text-construction-200">
                  {offer.cta}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-concrete-50 py-16 lg:py-24">
        <div className="container-custom grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <SectionHeader
              eyebrow="Запуск"
              title="Как проходит внедрение"
              description="Стартуем с контура, который уже приносит управляемый результат в текущем масштабе компании."
            />
            <div className="mt-8 space-y-4">
              {marketingLaunchSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex gap-4 rounded-[1.75rem] border border-steel-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-steel-950 text-lg font-bold text-construction-300">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-steel-950">{step.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-steel-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionHeader
              eyebrow="Доверие"
              title="Доказательства зрелости"
              description="Trust-контур сайта опирается на архитектурные факты и реальные продуктовые ограничения."
            />
            <div className="mt-8 grid gap-4">
              {marketingTrustFacts.map((fact) => (
                <article
                  key={fact.title}
                  className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheckIcon className="h-5 w-5 text-construction-700" />
                    <h3 className="text-lg font-bold text-steel-950">{fact.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-steel-600">{fact.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="py-16 lg:py-24">
        <div className="container-custom">
          <SectionHeader
            eyebrow="FAQ"
            title="Частые вопросы по публичному сайту и rollout-модели"
            align="center"
          />

          <div className="mx-auto mt-12 max-w-4xl space-y-3">
            {marketingFaqs.map((item, index) => (
              <div
                key={item.question}
                className="overflow-hidden rounded-[1.75rem] border border-steel-200 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq((current) => (current === index ? null : index))}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-base font-semibold text-steel-950">
                    {item.question}
                  </span>
                  <ChevronDownIcon
                    className={`h-5 w-5 shrink-0 text-steel-400 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index ? (
                  <div className="border-t border-steel-100 px-6 py-5 text-sm leading-7 text-steel-600">
                    {item.answer}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-steel-950 py-16 lg:py-24">
        <div className="container-custom grid gap-10 lg:grid-cols-[0.95fr_0.85fr] lg:items-start">
          <div>
            <SectionHeader
              eyebrow="Demo и контакт"
              title="Покажем релевантный контур, а не перегруженную витрину"
              description="Соберём пакет, surface-ы и advanced-модули под ваш текущий процесс: объект, снабжение, финансы, документы или multi-org контур."
            />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[
                'Диагностика ролей, бизнес-потерь и текущих систем.',
                'Сборка минимального пакета без лишних модулей.',
                'Честная маркировка beta/alpha-возможностей.',
                'Дальнейшее масштабирование после первого рабочего сценария.',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-5 text-sm leading-7 text-white/80"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <ContactForm variant="full" className="border-white/10 bg-white shadow-none" />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
