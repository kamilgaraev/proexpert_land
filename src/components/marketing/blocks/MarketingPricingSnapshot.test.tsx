import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import MarketingPricingSnapshot from './MarketingPricingSnapshot';

const renderComponent = () =>
  render(
    <MemoryRouter>
      <MarketingPricingSnapshot />
    </MemoryRouter>,
  );

describe('MarketingPricingSnapshot', () => {
  it('renders pricing snapshot links', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /Тарифы для самостоятельного старта/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Начать бесплатно' })).toHaveAttribute(
      'href',
      '/register?plan=free',
    );
    expect(screen.getByRole('link', { name: 'Выбрать Business' })).toHaveAttribute(
      'href',
      '/register?plan=business',
    );
    expect(screen.getByRole('link', { name: 'Все тарифы' })).toHaveAttribute('href', '/pricing');
  });
});
