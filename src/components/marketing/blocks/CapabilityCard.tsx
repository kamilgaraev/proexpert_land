import { CheckIcon } from '@heroicons/react/24/outline';
import { MaturityBadge, SurfaceBadges } from '@/components/marketing/MarketingPrimitives';
import type { MarketingCapability } from '@/types/marketing';

interface CapabilityCardProps {
  capability: MarketingCapability;
  tone?: 'light' | 'dark';
  compact?: boolean;
}

const CapabilityCard = ({
  capability,
  tone = 'light',
  compact = false,
}: CapabilityCardProps) => {
  const isDark = tone === 'dark';
  const wrapperClass = isDark
    ? 'h-full rounded-[2rem] border border-white/10 bg-white/5 p-7 text-white lg:p-8'
    : 'h-full rounded-[2rem] border border-steel-200 bg-white p-7 shadow-sm lg:p-8';
  const summaryClass = isDark ? 'text-white/70' : 'text-steel-600';
  const outcomeClass = isDark
    ? 'rounded-[1.5rem] bg-white/5 px-5 py-4 text-sm leading-7 text-white/80'
    : 'rounded-[1.5rem] bg-concrete-50 px-5 py-4 text-sm leading-7 text-steel-700';

  return (
    <article className={wrapperClass}>
      <div className="flex flex-wrap items-center gap-3">
        <div className={`text-2xl font-bold leading-tight ${isDark ? 'text-white' : 'text-steel-950'}`}>
          {capability.title}
        </div>
        <MaturityBadge maturity={capability.maturity} />
      </div>
      <p className={`mt-5 text-base leading-8 ${summaryClass}`}>{capability.publicClaim}</p>
      <div className="mt-5">
        <SurfaceBadges surfaces={capability.surfaces} />
      </div>
      {compact ? null : (
        <div className="mt-7 grid gap-3">
          {capability.outcomes.map((outcome) => (
            <div key={outcome} className="flex items-start gap-3">
              <CheckIcon
                className={`mt-0.5 h-4 w-4 shrink-0 ${
                  isDark ? 'text-construction-200' : 'text-construction-600'
                }`}
              />
              <div className={`${outcomeClass} w-full`}>{outcome}</div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
};

export default CapabilityCard;
