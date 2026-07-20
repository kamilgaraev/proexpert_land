import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { HoldingContractDetails } from '@/components/holding/HoldingContractDetails';

vi.mock('@/hooks/useHoldingContractDetails', () => ({
  useHoldingContractDetails: () => ({
    loading: false,
    error: null,
    fetchContractDetails: vi.fn(),
    data: {
      id: 5, organization: { id: 2, name: 'Дочерняя организация' }, contract: { id: 7, number: 'Д-7', status: 'active' }, title: 'Договор подряда', document_number: 'Д-7', document_type: 'contract', document_type_label: 'Договор', status: 'active', status_label: 'Действует', document_date: null, effective_from: null, effective_until: null, counterparty_name: null, legal_significance_status: null, legal_significance_status_label: 'Не подтверждено', workflow_summary: { status: 'read_only', available_action_details: [] }, signature_summary: { total: 2, verified: 1, status: 'partially_signed' }, financial_summary: { visible: false, total_amount: null, paid_amount: null, remaining_amount: null }, files: [], permissions: { can_preview_download: false, read_only: true }, created_at: null, updated_at: null,
    },
  }),
}));

describe('HoldingContractDetails', () => {
  it('renders read-only dossier and keeps masked sections unavailable', () => {
    render(<MemoryRouter initialEntries={['/projects/contracts/7']}><Routes><Route path="/projects/contracts/:contractId" element={<HoldingContractDetails />} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Договор подряда' })).toBeInTheDocument();
    expect(screen.getByText('У вас нет права просмотра финансовых показателей этого досье.')).toBeInTheDocument();
    expect(screen.getByText('У вас нет права просмотра и скачивания файлов этого досье.')).toBeInTheDocument();
  });
});
