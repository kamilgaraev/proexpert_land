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
  it('показывает бесплатную базу, пакеты и полный комплект', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /Бесплатная база и пакеты под задачи стройки/i })).toBeInTheDocument();
    expect(screen.getByText('10 бизнес-пакетов')).toBeInTheDocument();
    expect(screen.getByText('79 900 ₽')).toBeInTheDocument();
    expect(screen.getByText('экономия 23 100 ₽')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Создать бесплатную базу' })).toHaveAttribute('href', '/register');
    expect(screen.getByRole('link', { name: 'Собрать свой набор' })).toHaveAttribute('href', '/pricing#constructor');
    expect(screen.queryByText(/Start|Business|Profi|Enterprise Конструктор/)).not.toBeInTheDocument();
  });
});
