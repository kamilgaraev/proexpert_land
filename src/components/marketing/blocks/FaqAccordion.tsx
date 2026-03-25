import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import type { MarketingFaqItem } from '@/types/marketing';

interface FaqAccordionProps {
  items: MarketingFaqItem[];
}

const FaqAccordion = ({ items }: FaqAccordionProps) => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={item.question}
          className="overflow-hidden rounded-[1.75rem] border border-steel-200 bg-white shadow-sm"
        >
          <button
            type="button"
            onClick={() => setOpenIndex((current) => (current === index ? -1 : index))}
            className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
          >
            <span className="text-base font-semibold text-steel-950">{item.question}</span>
            <ChevronDownIcon
              className={`h-5 w-5 shrink-0 text-steel-400 transition-transform ${
                openIndex === index ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openIndex === index ? (
            <div className="border-t border-steel-100 px-6 py-5 text-sm leading-7 text-steel-600">
              {item.answer}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default FaqAccordion;
