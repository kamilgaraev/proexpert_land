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

  return (
    <article
      className={`h-full rounded-[1.75rem] border p-6 ${
        isDark ? 'border-white/10 bg-white/5 text-white' : 'border-steel-200 bg-white'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <div
            className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${
              isDark ? 'text-construction-200' : 'text-steel-500'
            }`}
          >
            {capability.businessContour}
          </div>
          <h3 className={`mt-3 text-2xl font-bold leading-tight ${isDark ? 'text-white' : 'text-steel-950'}`}>
            {capability.title}
          </h3>
        </div>
        <MaturityBadge maturity={capability.maturity} />
      </div>

      <p className={`mt-4 text-sm leading-7 ${isDark ? 'text-white/72' : 'text-steel-600'}`}>
        {capability.publicClaim}
      </p>

      <div className="mt-5">
        <SurfaceBadges surfaces={capability.surfaces} />
      </div>

      {compact ? null : (
        <div className="mt-6 grid gap-3">
          {capability.outcomes.map((outcome) => (
            <div
              key={outcome}
              className={`flex items-start gap-3 rounded-[1.25rem] px-4 py-4 text-sm leading-7 ${
                isDark ? 'bg-white/5 text-white/78' : 'bg-concrete-50 text-steel-700'
              }`}
            >
              <CheckIcon
                className={`mt-1 h-4 w-4 shrink-0 ${
                  isDark ? 'text-construction-200' : 'text-construction-600'
                }`}
              />
              <span>{outcome}</span>
            </div>
          ))}
        </div>
      )}

      <div
        className={`mt-6 border-t pt-4 text-[11px] font-semibold uppercase tracking-[0.2em] ${
          isDark ? 'border-white/10 text-white/45' : 'border-steel-100 text-steel-500'
        }`}
      >
        {capability.cta}
      </div>
    </article>
  );
};

export default CapabilityCard;
