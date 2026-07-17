import { cleanup, render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

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
import { marketingSeoLandingPages } from '@/data/marketingRegistry';

afterEach(cleanup);

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

  it('renders an honest process comparison without proof terminology', () => {
    const page = marketingSeoLandingPages['construction-procurement'];

    expect(page.processComparison).toEqual({
      eyebrow: 'Как меняется работа',
      title: 'Заявка проходит один понятный маршрут',
      description: 'Сотрудники видят ответственного, статус и следующий шаг.',
      metrics: [
        {
          value: 'Одна карточка',
          label: 'Вместо переписки',
          description: 'История решения остаётся у заявки.',
        },
      ],
      note: 'Это описание процесса, а не обещание результата.',
    });

    render(<SeoClusterPage pageKey="construction-procurement" />);

    expect(screen.getByRole('heading', { name: 'Заявка проходит один понятный маршрут' })).toBeInTheDocument();
    expect(screen.queryByText(/доказательств/i)).not.toBeInTheDocument();
  });

  it('uses verifiable process properties instead of result promises', () => {
    for (const page of Object.values(marketingSeoLandingPages)) {
      const comparisonText = [
        page.processComparison.title,
        page.processComparison.description,
        page.processComparison.note,
        ...page.processComparison.metrics.flatMap((metric) => [
          metric.value,
          metric.label,
          metric.description,
        ]),
      ].join(' ');

      expect(comparisonText).not.toMatch(
        /в тот же день|сильно (?:ниже|меньше)|минуты|до срыва срока|раньше заметен|ежедневный контроль|сразу с объекта|готовятся быстрее|видны быстрее|риск.{0,30}ниже|скорост.{0,30}выше|нагрузк.{0,30}ниже/iu,
      );

      for (const metric of page.processComparison.metrics) {
        expect(metric.value).toMatch(
          /карточ|запис|статус|ответствен|связь|истори|маршрут|объект|документ|рол/iu,
        );
      }
    }
  });
});
