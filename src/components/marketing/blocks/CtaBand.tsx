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
  size?: 'default' | 'compact';
}

const CtaBand = ({
  eyebrow,
  title,
  description,
  actions,
  tone = 'dark',
  size = 'default',
}: CtaBandProps) => {
  const isDark = tone === 'dark';
  const isCompact = size === 'compact';

  return (
    <section
      className={`rounded-[2rem] border ${
        isCompact ? 'p-6 md:p-7' : 'p-8 md:p-9'
      } ${
        isDark
          ? 'border-steel-900 bg-steel-950 text-white'
          : 'border-steel-200 bg-white text-steel-950'
      }`}
    >
      <div className={`grid ${isCompact ? 'gap-6' : 'gap-8'}`}>
        <div>
          <div
            className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${
              isDark ? 'text-construction-200' : 'text-construction-700'
            }`}
          >
            {eyebrow}
          </div>
          <h2
            className={`mt-4 font-bold [overflow-wrap:anywhere] [text-wrap:balance] ${
              isCompact
                ? 'max-w-none text-[clamp(1.7rem,7vw,3.1rem)] leading-[1.02] sm:text-[clamp(2rem,4vw,3.1rem)]'
                : 'max-w-4xl text-[clamp(1.15rem,10vw,3.6rem)] leading-[1.04] sm:text-[clamp(1.75rem,6vw,3.6rem)]'
            }`}
          >
            {title}
          </h2>
          <p
            className={`mt-5 ${
              isCompact ? 'max-w-none text-sm leading-7 sm:text-base sm:leading-8' : 'max-w-3xl text-sm leading-7 sm:text-base sm:leading-8'
            } ${isDark ? 'text-white/72' : 'text-steel-600'}`}
          >
            {description}
          </p>
        </div>

        {actions.length > 0 ? (
          <div className={`flex flex-col gap-3 ${isCompact ? '' : 'sm:flex-row sm:flex-wrap'}`}>
            {actions.map((action) => (
              <MarketingLink
                key={`${action.href}-${action.label}`}
                href={action.href}
                className={`inline-flex min-w-0 flex-wrap items-center justify-center gap-2 rounded-full px-5 py-3 text-center text-sm font-semibold whitespace-normal [overflow-wrap:anywhere] transition ${
                  action.primary
                    ? `${isCompact ? 'w-full' : 'w-full sm:w-auto'} ${isDark
                      ? 'bg-white text-steel-950 hover:bg-construction-100'
                      : 'bg-steel-950 text-white hover:bg-steel-900'}`
                    : `${isCompact ? 'w-full' : 'w-full sm:w-auto'} ${isDark
                      ? 'border border-white/15 bg-white/5 text-white hover:bg-white/10'
                      : 'border border-steel-300 bg-white text-steel-700 hover:border-construction-300 hover:text-construction-700'}`
                }`}
              >
                {action.label}
                {action.primary ? <ArrowUpRightIcon className="h-4 w-4 shrink-0" /> : null}
              </MarketingLink>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default CtaBand;
