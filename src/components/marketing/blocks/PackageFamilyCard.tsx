import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { PackageIcon } from '@/components/marketing/MarketingPrimitives';
import { marketingPaths } from '@/data/marketingRegistry';
import type { MarketingPackageFamily } from '@/types/marketing';

interface PackageFamilyCardProps {
  item: MarketingPackageFamily;
  compact?: boolean;
}

const PackageFamilyCard = ({ item, compact = false }: PackageFamilyCardProps) => {
  const tiers = compact ? item.tiers.slice(0, 1) : item.tiers;

  return (
    <article className="rounded-[2rem] border border-steel-200 bg-white p-7 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.5rem] bg-construction-50 text-construction-700">
          <PackageIcon slug={item.slug} className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-steel-950">{item.name}</h3>
          <p className="mt-2 text-sm leading-7 text-steel-600">{item.description}</p>
          <p className="mt-3 text-sm font-semibold text-construction-700">{item.bestFor}</p>
        </div>
      </div>

      <div className={`mt-6 grid gap-4 ${compact ? '' : 'lg:grid-cols-3'}`}>
        {tiers.map((tier) => (
          <div key={`${item.slug}-${tier.key}`} className="rounded-[1.5rem] bg-concrete-50 p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-steel-500">
              {tier.label}
            </div>
            <div className="mt-3 text-xl font-bold text-steel-950">
              {tier.priceLabel ?? tier.label}
            </div>
            <p className="mt-3 text-sm leading-6 text-steel-600">{tier.description}</p>
            <div className="mt-4 grid gap-3">
              {tier.highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-steel-700"
                >
                  {highlight}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {compact ? (
        <Link
          to={marketingPaths.pricing}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-steel-950 transition hover:text-construction-700"
        >
          Посмотреть пакет целиком
          <ArrowUpRightIcon className="h-4 w-4" />
        </Link>
      ) : null}
    </article>
  );
};

export default PackageFamilyCard;
