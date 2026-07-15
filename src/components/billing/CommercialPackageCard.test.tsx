import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { CommercialPackage } from '@/types/commercialBilling';
import { CommercialPackageCard } from './CommercialPackageCard';
import { CommercialPackageDetailsSheet } from './CommercialPackageDetailsSheet';

const packageItem: CommercialPackage = {
  slug: 'estimates-norms',
  name: 'Сметы и нормы',
  description: 'Расчёты стоимости для строительных проектов.',
  sortOrder: 3,
  price: '12900.00',
  priceMinor: 1290000,
  currency: 'RUB',
  billingPeriodDays: 30,
  modules: [
    { slug: 'budget-estimates', name: 'Сметное дело', description: 'Создание, расчёт и согласование смет.' },
    { slug: 'rate-management', name: 'Расценки и нормы', description: 'Единая нормативная база компании.' },
  ],
  highlights: ['Сметы', 'Расценки и нормы'],
  businessOutcomes: ['Контролируемые расчёты стоимости'],
  isActive: true,
  status: 'active',
  accessSource: 'paid_package',
  currentPeriodStartAt: '2026-07-15T06:21:00Z',
  currentPeriodEndAt: '2026-08-14T06:21:00Z',
  trialEndsAt: null,
  trialAvailable: false,
  trialUsed: true,
};

describe('CommercialPackageCard', () => {
  it('показывает подключённый пакет без галочки и предлагает управляемое отключение', () => {
    render(
      <CommercialPackageCard
        packageItem={packageItem}
        variant="connected"
        onPrimaryAction={vi.fn()}
        onDetails={vi.fn()}
      />,
    );

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Подробнее' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Отключить со следующего периода' })).toBeInTheDocument();
  });

  it('добавляет доступный пакет явной кнопкой', () => {
    const onPrimaryAction = vi.fn();
    render(
      <CommercialPackageCard
        packageItem={{ ...packageItem, isActive: false, status: null, accessSource: null }}
        variant="available"
        onPrimaryAction={onPrimaryAction}
        onDetails={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Добавить' }));
    expect(onPrimaryAction).toHaveBeenCalledOnce();
  });

  it('показывает в подробностях все модули и их описания', () => {
    render(
      <CommercialPackageDetailsSheet
        packageItem={packageItem}
        open
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Сметы и нормы' })).toBeInTheDocument();
    expect(screen.getByText('Сметное дело')).toBeInTheDocument();
    expect(screen.getByText('Создание, расчёт и согласование смет.')).toBeInTheDocument();
    expect(screen.getByText('Расценки и нормы')).toBeInTheDocument();
    expect(screen.getByText('Единая нормативная база компании.')).toBeInTheDocument();
  });
});
