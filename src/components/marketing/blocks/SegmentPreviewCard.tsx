import { ArrowUpRightIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import type { MarketingSolutionSegment } from '@/types/marketing';

interface SegmentPreviewCardProps {
  segment: MarketingSolutionSegment;
  linkTo?: string;
}

const SegmentPreviewCard = ({ segment, linkTo }: SegmentPreviewCardProps) => {
  return (
    <article className="rounded-[2rem] border border-steel-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_-50px_rgba(15,23,42,0.45)]">
      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-construction-700">
        {segment.title}
      </div>
      <h3 className="mt-4 max-w-md text-2xl font-bold leading-tight text-steel-950">
        {segment.audience}
      </h3>
      <p className="mt-4 text-sm leading-7 text-steel-600">{segment.challenge}</p>
      <div className="mt-6 grid gap-3">
        {segment.workflows.slice(0, 3).map((workflow) => (
          <div
            key={workflow}
            className="flex items-start gap-3 rounded-2xl bg-concrete-50 px-4 py-4 text-sm leading-6 text-steel-700"
          >
            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-construction-600" />
            {workflow}
          </div>
        ))}
      </div>
      {linkTo ? (
        <Link
          to={linkTo}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-steel-950 transition hover:text-construction-700"
        >
          {segment.cta}
          <ArrowUpRightIcon className="h-4 w-4" />
        </Link>
      ) : null}
    </article>
  );
};

export default SegmentPreviewCard;
