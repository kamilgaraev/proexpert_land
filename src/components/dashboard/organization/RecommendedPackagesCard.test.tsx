import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { commercialPackages } from '@/data/marketing/packages';
import { RecommendedPackagesCard } from './RecommendedPackagesCard';

describe('RecommendedPackagesCard', () => {
  it('показывает коммерческие пакеты и открывает оплату выбранного пакета', () => {
    const onPackageClick = vi.fn();
    const packages = commercialPackages.filter((item) => (
      item.slug === 'projects-processes' || item.slug === 'supply-warehouse'
    ));

    render(<RecommendedPackagesCard packages={packages} onPackageClick={onPackageClick} />);

    expect(screen.getByText('Рекомендуемые пакеты')).toBeInTheDocument();
    expect(screen.getByText('Проекты и процессы')).toBeInTheDocument();
    expect(screen.getByText('Снабжение и склад')).toBeInTheDocument();
    expect(screen.queryByText('project-management')).not.toBeInTheDocument();
    expect(screen.queryByText(/модул/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Проекты и процессы'));
    expect(onPackageClick).toHaveBeenCalledWith('projects-processes');
  });
});
