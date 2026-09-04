import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import LineChart from './LineChart';
import DonutStatusChart from './DonutStatusChart';

vi.mock('react-chartjs-2', () => ({
  Line: () => <canvas data-testid="line" />,
  Doughnut: () => <canvas data-testid="donut" />,
}));
afterEach(cleanup);

describe('Dashboard charts', () => {
  it('distinguishes an empty series from a series of zeros', () => {
    const { rerender } = render(<LineChart title="Проекты" labels={[]} values={[]} />);
    expect(screen.getByText('Нет данных за выбранный период')).toBeInTheDocument();
    rerender(<LineChart title="Проекты" labels={['Июнь']} values={[0]} />);
    expect(screen.getByText('За выбранный период все значения равны нулю')).toBeInTheDocument();
    expect(screen.queryByTestId('line')).not.toBeInTheDocument();
  });
  it('preserves nonzero negative balances as a chart', () => {
    render(<LineChart title="Баланс" labels={['Июнь']} values={[-100]} />);
    expect(screen.getByTestId('line')).toBeInTheDocument();
  });
  it('makes every positive status and its count available outside the canvas', () => {
    render(<DonutStatusChart title="Статусы" data={{ Активные: 3, Завершённые: 1, Черновики: 0 }} />);
    expect(screen.getByRole('list', { name: 'Статусы' })).toHaveTextContent('Активные3 · 75%');
    expect(screen.getByRole('list', { name: 'Статусы' })).toHaveTextContent('Завершённые1 · 25%');
    expect(screen.queryByText('Черновики')).not.toBeInTheDocument();
  });
  it('does not render a meaningless zero-total doughnut', () => {
    render(<DonutStatusChart title="Статусы" data={{ Активные: 0 }} />);
    expect(screen.getByText('Нет данных для распределения')).toBeInTheDocument();
    expect(screen.queryByTestId('donut')).not.toBeInTheDocument();
  });
});
