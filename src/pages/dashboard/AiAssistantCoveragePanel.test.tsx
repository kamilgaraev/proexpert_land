import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AiAssistantCoveragePanel, { assistantOcrLimit } from './AiAssistantCoveragePanel';
import { aiAssistantService } from '@/services/aiAssistantService';
import type { AiAssistantRagStatus } from '@/types/aiAssistant';
vi.mock('@/services/aiAssistantService', () => ({ aiAssistantService: { getRagStatus: vi.fn(), getDocumentSettings: vi.fn(), setDocumentSettings: vi.fn() } }));
const status: AiAssistantRagStatus = { enabled: true, ready: true, source_count: 10, chunk_count: 20, expected_source_count: null, indexed_source_count: null, pending_source_count: null, stale_source_count: null, eligible_count_known: false, coverage_complete: false, processing: false, lag_seconds: null, lag_exceeded: false, source_catalog: [], can_manage_document_settings: false, document_coverage: { total: 8, ready: 3, pending: 1, ocr_required: 2, ocr_processing: 1, failed: 1, unsupported: 0, empty: 0, processed_units: 30, total_pages: 12, ocr_completed_pages: 5 }, archive_scan: { expected_file_count: 9, scanned_file_count: 6, last_file_id: 20, completed_at: null, processing: true } };
const settings = { enabled: false, scope: 'new' as const, limit_minor: 10000, reserved_minor: 100, spent_minor: 200, available_minor: 9700, scanned_count: 6, last_file_id: 20, scan_completed_at: null };
beforeEach(() => { vi.mocked(aiAssistantService.getRagStatus).mockResolvedValue(status); vi.mocked(aiAssistantService.getDocumentSettings).mockResolvedValue(settings); vi.mocked(aiAssistantService.setDocumentSettings).mockResolvedValue(settings); });
afterEach(() => { cleanup(); vi.clearAllMocks(); });
describe('AiAssistantCoveragePanel', () => {
  it('does not claim complete coverage from search readiness or expose owner controls', async () => {
    render(<AiAssistantCoveragePanel />);
    await screen.findByText(/полнота пока неизвестна/);
    expect(screen.queryByText('Все доступные источники обработаны.')).not.toBeInTheDocument();
    expect(screen.getByText(/Документы: готово 3 из 8/)).toBeInTheDocument();
    expect(screen.getByText(/Архив: проверено 6 из 9/)).toBeInTheDocument();
    expect(aiAssistantService.getDocumentSettings).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Сохранить бюджет' })).not.toBeInTheDocument();
  });
  it('requires explicit confirmation, sends minor units and selected archive scope', async () => {
    vi.mocked(aiAssistantService.getRagStatus).mockResolvedValue({ ...status, can_manage_document_settings: true });
    render(<AiAssistantCoveragePanel />);
    await screen.findByLabelText('Общий лимит, единиц');
    fireEvent.change(screen.getByLabelText('Общий лимит, единиц'), { target: { value: '125,50' } });
    fireEvent.change(screen.getByLabelText('Область распознавания'), { target: { value: 'archive' } });
    fireEvent.click(screen.getByLabelText('Разрешить фоновое распознавание'));
    expect(screen.getByRole('button', { name: 'Сохранить бюджет' })).toBeDisabled();
    fireEvent.click(screen.getByLabelText('Подтверждаю бюджет и область обработки'));
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить бюджет' }));
    await waitFor(() => expect(aiAssistantService.setDocumentSettings).toHaveBeenCalledWith({ enabled: true, scope: 'archive', limit_minor: 12550 }));
  });
  it('parses a bounded decimal budget without rounding arbitrary fractions', () => {
    expect(assistantOcrLimit('1,25')).toBe(125);
    expect(assistantOcrLimit('1.005')).toBeNull();
    expect(assistantOcrLimit('-1')).toBeNull();
    expect(assistantOcrLimit('10000000')).toBe(1000000000);
    expect(assistantOcrLimit('10000000.01')).toBeNull();
  });
});
