import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AdminProductDemo from './AdminProductDemo';
import { adminProductDemoModules } from '@/data/marketing/adminProductDemo';

describe('AdminProductDemo', () => {
  it('renders all core modules as clickable navigation controls', () => {
    render(<AdminProductDemo />);

    expect(screen.getAllByRole('button', { pressed: false }).length).toBeGreaterThan(10);
    for (const module of adminProductDemoModules) {
      expect(screen.getByRole('button', { name: `Открыть раздел ${module.title}` })).toBeInTheDocument();
    }

    expect(screen.getByText(/Демонстрационная версия/i)).toBeInTheDocument();
    expect(screen.getAllByText(/В личном кабинете ProHelper больше деталей/i).length).toBeGreaterThan(0);
  });

  it('changes the active admin workspace when a module is clicked', () => {
    render(<AdminProductDemo />);

    fireEvent.click(screen.getByRole('button', { name: 'Открыть раздел Склад и материалы' }));

    expect(screen.getByRole('heading', { name: 'Склад и материалы' })).toBeInTheDocument();
    expect(screen.getByText('Поставка арматуры принята и зарезервирована под корпус 2.')).toBeInTheDocument();
  });

  it('lets visitors move from a selected row to a linked module', () => {
    render(<AdminProductDemo />);

    fireEvent.click(screen.getByRole('button', { name: /ЖК "Северный", корпус 2/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Платежи' }));

    expect(screen.getByRole('heading', { name: 'Платежи и финансы' })).toBeInTheDocument();
  });

  it('makes workflow cards interactive', () => {
    render(<AdminProductDemo />);

    fireEvent.click(screen.getByRole('button', { name: /От сметы до акта/i }));

    expect(screen.getByRole('heading', { name: 'Сметы и версии' })).toBeInTheDocument();
  });

  it('does not expose internal admin file paths in the public demo', () => {
    const { container } = render(<AdminProductDemo />);

    expect(container).not.toHaveTextContent(/prohelper_admin/i);
    expect(container).not.toHaveTextContent(/src\/pages/i);
    expect(container).not.toHaveTextContent(/src\/components/i);
  });
});
