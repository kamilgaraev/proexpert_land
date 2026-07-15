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
  it('показывает бесплатный старт, пакеты и полный комплект понятным языком', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /Начните бесплатно. Подключайте нужные пакеты./i })).toBeInTheDocument();
    expect(screen.getByText('10 бизнес-пакетов')).toBeInTheDocument();
    expect(screen.getByText('79 900 ₽')).toBeInTheDocument();
    expect(screen.getByText('экономия 23 100 ₽')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Создать организацию' })).toHaveAttribute('href', '/register');
    expect(screen.getByRole('link', { name: 'Собрать свой набор' })).toHaveAttribute('href', '/pricing#constructor');
    expect(screen.queryByText(/Start|Business|Profi|Enterprise Конструктор/)).not.toBeInTheDocument();
    expect(screen.queryByText(/бесплатная база/i)).not.toBeInTheDocument();
  });
});
