import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HoldingContractsReportPage from './HoldingContractsReportPage';

const { can, getReport } = vi.hoisted(() => ({ can: vi.fn(), getReport: vi.fn() }));

vi.mock('@/contexts/PermissionsContext', () => ({
  usePermissionsContext: () => ({ can }),
}));

vi.mock('@utils/api', () => ({
  holdingReportsService: { getContractsSummary: getReport },
}));

const renderReport = () => render(
  <MemoryRouter initialEntries={['/reports/contracts']}>
    <Routes>
      <Route path="/reports/contracts" element={<HoldingContractsReportPage />} />
      <Route path="/reports" element={<h1>Список отчётов</h1>} />
    </Routes>
  </MemoryRouter>,
);

describe('Отчёт по контрактам холдинга', () => {
  beforeEach(() => {
    can.mockReturnValue(true);
    getReport.mockResolvedValue({ data: { success: true, data: null } });
  });

  it('загружает первую страницу и применяет изменённый фильтр по кнопке', async () => {
    renderReport();
    const refresh = await screen.findByRole('button', { name: 'Обновить' });
    expect(getReport).toHaveBeenCalledExactlyOnceWith({ page: 1, per_page: 50 });

    fireEvent.click(screen.getByRole('button', { name: 'Фильтры' }));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'active' } });
    expect(getReport).toHaveBeenCalledTimes(1);

    fireEvent.click(refresh);
    await waitFor(() => expect(getReport).toHaveBeenCalledTimes(2));
    expect(getReport).toHaveBeenLastCalledWith({ page: 1, per_page: 50, status: 'active' });
  });

  it('возвращает к списку отчётов при отсутствии права', async () => {
    can.mockReturnValue(false);
    renderReport();

    expect(await screen.findByRole('heading', { name: 'Список отчётов' })).toBeInTheDocument();
    expect(can).toHaveBeenCalledWith('multi-organization.reports.financial');
    expect(getReport).not.toHaveBeenCalled();
  });
});
