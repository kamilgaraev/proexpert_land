import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import type { MarketingTrustFact } from '@/types/marketing';

interface TrustFactListProps {
  items: MarketingTrustFact[];
  tone?: 'light' | 'dark';
}

const TrustFactList = ({ items, tone = 'light' }: TrustFactListProps) => {
  const isDark = tone === 'dark';

  return (
    <div className="space-y-4">
      {items.map((fact) => (
        <article
          key={fact.title}
          className={
            isDark
              ? 'rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-5'
              : 'rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm'
          }
        >
          <div className="flex items-center gap-3">
            <ShieldCheckIcon
              className={`h-5 w-5 ${isDark ? 'text-construction-200' : 'text-construction-700'}`}
            />
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-steel-950'}`}>
              {fact.title}
            </h3>
          </div>
          <p className={`mt-3 text-sm leading-7 ${isDark ? 'text-white/75' : 'text-steel-600'}`}>
            {fact.text}
          </p>
        </article>
      ))}
    </div>
  );
};

export default TrustFactList;
