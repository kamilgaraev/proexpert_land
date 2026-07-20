import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HoldingContractDetails } from '@/components/holding/HoldingContractDetails';

const serviceMocks = vi.hoisted(() => ({
  getPreviewUrl: vi.fn(),
  getDownloadUrl: vi.fn(),
}));

vi.mock('@/services/legalArchiveService', () => ({
  holdingLegalArchiveService: serviceMocks,
}));

vi.mock('@/hooks/useHoldingContractDetails', () => ({
  useHoldingContractDetails: () => ({
    loading: false,
    error: null,
    fetchContractDetails: vi.fn(),
    data: {
      id: 5,
      organization: { id: 2, name: 'Дочерняя организация' },
      contract: { id: 7, number: 'Д-7', status: 'active' },
      title: 'Договор подряда',
      document_number: 'Д-7',
      document_type: 'contract',
      document_type_label: 'Договор',
      status: 'active',
      status_label: 'Действует',
      document_date: null,
      effective_from: null,
      effective_until: null,
      counterparty_name: null,
      legal_significance_status: null,
      legal_significance_status_label: 'Не подтверждено',
      workflow_summary: { status: 'read_only', available_action_details: [] },
      signature_summary: { total: 2, verified: 1, status: 'partially_signed' },
      financial_summary: { visible: false, total_amount: null, paid_amount: null, remaining_amount: null },
      files: [{
        id: 11,
        title: 'Договор',
        role: 'main',
        current_version: { id: 12, version_number: 2, original_filename: 'contract-v2.pdf', mime_type: 'application/pdf', size_bytes: 100, preview_available: true },
        versions: [
          { id: 10, version_number: 1, original_filename: 'contract-v1.docx', mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size_bytes: 90, preview_available: false },
          { id: 12, version_number: 2, original_filename: 'contract-v2.pdf', mime_type: 'application/pdf', size_bytes: 100, preview_available: true },
        ],
      }],
      permissions: { can_preview_download: true, read_only: true },
      created_at: null,
      updated_at: null,
    },
  }),
}));

const renderPage = () => render(
  <MemoryRouter initialEntries={['/projects/contracts/7']}>
    <Routes><Route path="/projects/contracts/:contractId" element={<HoldingContractDetails />} /></Routes>
  </MemoryRouter>,
);

describe('HoldingContractDetails', () => {
  beforeEach(() => {
    serviceMocks.getPreviewUrl.mockReset();
    serviceMocks.getDownloadUrl.mockReset();
  });

  it('renders read-only dossier and complete version history', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Договор подряда' })).toBeInTheDocument();
    expect(screen.getByText('Версия 1: contract-v1.docx')).toBeInTheDocument();
    expect(screen.getByText('Версия 2: contract-v2.pdf')).toBeInTheDocument();
    expect(screen.getByText('У вас нет права просмотра финансовых показателей этого досье.')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Просмотр' })).toHaveLength(1);
  });

  it('requests a secure download URL for the selected historical version', async () => {
    serviceMocks.getDownloadUrl.mockResolvedValue('https://storage.example.test/contract-v1.docx');
    const target = { opener: null, location: { replace: vi.fn() }, close: vi.fn() };
    vi.spyOn(window, 'open').mockReturnValue(target as unknown as Window);
    renderPage();

    fireEvent.click(screen.getAllByRole('button', { name: 'Скачать' })[0]);

    await vi.waitFor(() => expect(serviceMocks.getDownloadUrl).toHaveBeenCalledWith(7, 10));
    expect(target.location.replace).toHaveBeenCalledWith('https://storage.example.test/contract-v1.docx');
  });
});
