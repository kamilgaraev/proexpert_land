import { CheckIcon } from '@heroicons/react/24/outline';
import CapabilityCard from '@/components/marketing/blocks/CapabilityCard';
import { SurfaceBadges } from '@/components/marketing/MarketingPrimitives';
import type {
  MarketingCapability,
  MarketingPackageFamily,
  MarketingSolutionSegment,
} from '@/types/marketing';

interface SolutionStoryProps {
  segment: MarketingSolutionSegment;
  capabilities: MarketingCapability[];
  packages: MarketingPackageFamily[];
  inverted?: boolean;
}

const SolutionStory = ({
  segment,
  capabilities,
  packages,
  inverted = false,
}: SolutionStoryProps) => {
  const leadClass = inverted
    ? 'bg-steel-950 text-white'
    : 'bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_100%)] text-steel-950';
  const leadTextClass = inverted ? 'text-white/75' : 'text-steel-600';

  return (
    <article className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <div
        className={`rounded-[2rem] border border-steel-200 p-8 shadow-sm ${leadClass} ${
          inverted ? 'xl:order-2' : ''
        }`}
      >
        <div
          className={`text-xs font-semibold uppercase tracking-[0.24em] ${
            inverted ? 'text-construction-200' : 'text-construction-700'
          }`}
        >
          {segment.title}
        </div>
        <h2 className="mt-5 text-3xl font-bold leading-tight">{segment.audience}</h2>
        <p className={`mt-5 text-sm leading-7 ${leadTextClass}`}>{segment.challenge}</p>
        <div className="mt-5">
          <SurfaceBadges surfaces={segment.surfaces} />
        </div>
        <div
          className={`mt-6 rounded-[1.5rem] p-5 text-sm leading-7 ${
            inverted ? 'border border-white/10 bg-white/5 text-white/80' : 'bg-white text-steel-700'
          }`}
        >
          {segment.transformation}
        </div>
      </div>

      <div className={`space-y-5 ${inverted ? 'xl:order-1' : ''}`}>
        <div className="rounded-[2rem] border border-steel-200 bg-white p-7 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-steel-500">
            Что получает команда
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {segment.workflows.map((workflow) => (
              <div
                key={workflow}
                className="flex items-start gap-3 rounded-2xl bg-concrete-50 px-4 py-4 text-sm leading-6 text-steel-700"
              >
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-construction-600" />
                {workflow}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {capabilities.map((capability) => (
            <CapabilityCard key={capability.id} capability={capability} compact />
          ))}
        </div>

        <div className="rounded-[2rem] border border-steel-200 bg-white p-7 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-steel-500">
            Рекомендуемые пакеты
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {packages.map((item) => (
              <div key={item.slug} className="rounded-[1.5rem] bg-concrete-50 p-5">
                <div className="text-sm font-semibold text-steel-950">{item.name}</div>
                <p className="mt-2 text-sm leading-6 text-steel-600">{item.bestFor}</p>
                <div className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-construction-700">
                  {item.tiers[0]?.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
};

export default SolutionStory;
