import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { MarketingLink } from '@/components/marketing/MarketingPrimitives';

interface CtaBandAction {
  label: string;
  href: string;
  primary?: boolean;
}

interface CtaBandProps {
  eyebrow: string;
  title: string;
  description: string;
  actions: CtaBandAction[];
  tone?: 'light' | 'dark';
}

const CtaBand = ({
  eyebrow,
  title,
  description,
  actions,
  tone = 'dark',
}: CtaBandProps) => {
  const isDark = tone === 'dark';

  return (
    <section
      className={`rounded-[2rem] border p-8 md:p-9 ${
        isDark
          ? 'border-steel-900 bg-steel-950 text-white'
          : 'border-steel-200 bg-white text-steel-950'
      }`}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <div
            className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${
              isDark ? 'text-construction-200' : 'text-construction-700'
            }`}
          >
            {eyebrow}
          </div>
          <h2 className="mt-4 max-w-4xl text-[clamp(2rem,3.8vw,3.6rem)] font-bold leading-[1.02]">
            {title}
          </h2>
          <p className={`mt-5 max-w-3xl text-base leading-8 ${isDark ? 'text-white/72' : 'text-steel-600'}`}>
            {description}
          </p>
        </div>

        {actions.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {actions.map((action) => (
              <MarketingLink
                key={`${action.href}-${action.label}`}
                href={action.href}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                  action.primary
                    ? isDark
                      ? 'bg-white text-steel-950 hover:bg-construction-100'
                      : 'bg-steel-950 text-white hover:bg-steel-900'
                    : isDark
                      ? 'border border-white/15 bg-white/5 text-white hover:bg-white/10'
                      : 'border border-steel-300 bg-white text-steel-700 hover:border-construction-300 hover:text-construction-700'
                }`}
              >
                {action.label}
                {action.primary ? <ArrowUpRightIcon className="h-4 w-4" /> : null}
              </MarketingLink>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default CtaBand;
