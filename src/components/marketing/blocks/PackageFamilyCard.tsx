import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import {
  PackageIcon,
  formatPackageTierPrice,
} from '@/components/marketing/MarketingPrimitives';
import { marketingPaths } from '@/data/marketingRegistry';
import type { MarketingPackageFamily } from '@/types/marketing';

interface PackageFamilyCardProps {
  item: MarketingPackageFamily;
  compact?: boolean;
}

const PackageFamilyCard = ({ item, compact = false }: PackageFamilyCardProps) => {
  const tiers = compact ? item.tiers.slice(0, 2) : item.tiers;

  return (
    <article className="rounded-[1.9rem] border border-steel-200 bg-white p-6 shadow-sm lg:p-7">
      <div className="flex flex-col gap-5 border-b border-steel-100 pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] bg-construction-50 text-construction-700">
            <PackageIcon slug={item.slug} className="h-7 w-7" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-steel-500">
              Пакетный контур
            </div>
            <h3 className="mt-2 text-[1.9rem] font-bold leading-tight text-steel-950">
              {item.name}
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-steel-600">{item.description}</p>
          </div>
        </div>

        <div className="rounded-[1.25rem] bg-concrete-50 px-4 py-4 text-sm leading-7 text-steel-700 lg:max-w-[280px]">
          <span className="font-semibold text-steel-950">Лучше всего подходит:</span> {item.bestFor}
        </div>
      </div>

      <div className={`mt-6 grid gap-4 ${compact ? 'lg:grid-cols-2' : 'xl:grid-cols-3'}`}>
        {tiers.map((tier) => (
          <div key={`${item.slug}-${tier.key}`} className="rounded-[1.35rem] bg-concrete-50 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-steel-500">
                  {tier.label}
                </div>
                <div className="mt-2 text-xl font-bold text-steel-950">
                  {formatPackageTierPrice(tier)}
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm leading-7 text-steel-600">{tier.description}</p>
            <div className="mt-4 grid gap-3">
              {tier.highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="rounded-[1rem] border border-white bg-white px-4 py-3 text-sm leading-6 text-steel-700"
                >
                  {highlight}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-4 border-t border-steel-100 pt-5">
        <Link
          to={marketingPaths.contact}
          className="inline-flex items-center gap-2 text-sm font-semibold text-steel-950 transition hover:text-construction-700"
        >
          Обсудить пакет
          <ArrowUpRightIcon className="h-4 w-4" />
        </Link>
        {compact ? (
          <Link
            to={marketingPaths.pricing}
            className="inline-flex items-center gap-2 text-sm font-semibold text-steel-500 transition hover:text-steel-950"
          >
            Посмотреть страницу пакетов
          </Link>
        ) : null}
      </div>
    </article>
  );
};

export default PackageFamilyCard;
