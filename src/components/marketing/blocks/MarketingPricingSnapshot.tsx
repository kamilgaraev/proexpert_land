import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

import { SectionHeader } from '@/components/marketing/MarketingPrimitives';
import {
  marketingPaths,
  publicPricingPlans,
  type PublicPricingPlanSlug,
} from '@/data/marketingRegistry';

type SnapshotPlanSlug = Exclude<PublicPricingPlanSlug, 'enterprise'>;

interface SnapshotPlanMeta {
  period: string;
  description: string;
  highlights: string[];
  ctaLabel: string;
}

const planMeta: Record<SnapshotPlanSlug, SnapshotPlanMeta> = {
  free: {
    period: 'навсегда',
    description: 'Для знакомства с системой и проверки базового рабочего контура без оплаты.',
    highlights: ['Объекты и договоры', 'Работы и акты', 'Старт без внедрения'],
    ctaLabel: 'Начать бесплатно',
  },
  start: {
    period: 'в месяц',
    description: 'Для небольшой команды, которая ведет первые объекты, график и заявки в едином порядке.',
    highlights: ['График работ', 'Заявки с объекта', 'До 7 пользователей'],
    ctaLabel: 'Выбрать Start',
  },
  business: {
    period: 'в месяц',
    description: 'Для компаний, которым нужен основной контур по объектам, снабжению и финансам.',
    highlights: ['До 15 пользователей', 'Снабжение и склад', 'Финансовый контроль'],
    ctaLabel: 'Выбрать Business',
  },
  profi: {
    period: 'в месяц',
    description: 'Для зрелой команды, которая ведет портфель объектов и управленческую аналитику.',
    highlights: ['До 40 пользователей', 'Сметы и ПТО', 'AI-возможности'],
    ctaLabel: 'Выбрать Profi',
  },
};

const selfServicePlans = publicPricingPlans.filter(
  (plan): plan is (typeof publicPricingPlans)[number] & { slug: SnapshotPlanSlug } =>
    plan.isSelfService && plan.slug in planMeta,
);

const MarketingPricingSnapshot = () => (
  <section id="pricing" className="border-y border-steel-100 bg-white py-16 lg:py-20">
    <div className="container-custom">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeader
          eyebrow="Тарифы"
          title="Тарифы для самостоятельного старта"
          description="Короткая витрина тарифов для команд, которые хотят начать без долгого согласования и перейти к рабочему контуру."
        />

        <Link
          to={marketingPaths.pricing}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-steel-200 bg-white px-5 py-3 text-sm font-semibold text-steel-700 transition hover:border-construction-300 hover:text-construction-700 sm:w-auto"
        >
          Все тарифы
          <ArrowUpRightIcon className="h-4 w-4 shrink-0" />
        </Link>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {selfServicePlans.map((plan) => {
          const meta = planMeta[plan.slug];

          return (
            <article
              key={plan.slug}
              className={`flex min-h-full flex-col rounded-[1.55rem] border p-5 shadow-sm transition hover:-translate-y-0.5 ${
                plan.isFeatured
                  ? 'border-construction-300 bg-construction-50 shadow-[0_24px_56px_rgba(180,83,9,0.12)]'
                  : 'border-steel-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-steel-500">
                    Тариф
                  </div>
                  <h3 className="mt-2 text-2xl font-bold text-steel-950">{plan.title}</h3>
                </div>
                {plan.isFeatured ? (
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-construction-800">
                    Популярный
                  </span>
                ) : null}
              </div>

              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-steel-950">{plan.priceLabel}</span>
                <span className="text-sm text-steel-500">{meta.period}</span>
              </div>
              <div className="mt-2 text-sm font-semibold text-steel-700">{plan.userLimitLabel}</div>

              <p className="mt-4 text-sm leading-7 text-steel-600">{meta.description}</p>

              <div className="mt-5 grid gap-2">
                {meta.highlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="rounded-[1rem] border border-white bg-white/80 px-4 py-3 text-sm leading-6 text-steel-700"
                  >
                    {highlight}
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-6">
                <Link
                  to={plan.ctaHref}
                  className={`inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-center text-sm font-semibold transition ${
                    plan.isFeatured
                      ? 'bg-steel-950 text-white hover:bg-steel-900'
                      : 'border border-steel-200 bg-white text-steel-700 hover:border-construction-300 hover:text-construction-700'
                  }`}
                >
                  {meta.ctaLabel}
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  </section>
);

export default MarketingPricingSnapshot;
