import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/landing/ContactForm', () => ({ default: () => <div /> }));
vi.mock('@/components/marketing/blocks/FaqAccordion', () => ({ default: () => <div /> }));
vi.mock('@/components/marketing/MarketingPrimitives', () => ({
  MarketingLink: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
  PageHero: ({ title }: { title: string }) => <h1>{title}</h1>,
  PageSectionNav: () => <nav />,
  SectionHeader: ({ title }: { title: string }) => <h2>{title}</h2>,
}));
vi.mock('@/hooks/useSEO', () => ({ useSEO: () => undefined }));

import SeoClusterPage from './SeoClusterPage';

describe('SeoClusterPage workflow', () => {
  it('renders configured workflow heading and stages for a product page', () => {
    const html = renderToStaticMarkup(<SeoClusterPage pageKey="construction-procurement" />);

    expect(html).toContain('Как проходит закупка по объекту');
    expect(html).toContain('Заявка на закупку');
    expect(html).toContain('Приемка');
  });

  it('does not render the workflow section for a legacy page without workflow data', () => {
    const html = renderToStaticMarkup(<SeoClusterPage pageKey="foreman-software" />);

    expect(html).not.toContain('Как проходит закупка по объекту');
  });
});
