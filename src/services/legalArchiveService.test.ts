import { describe, expect, it } from 'vitest';
import { normalizeHoldingLegalArchiveDossier } from '@/services/legalArchiveService';

describe('normalizeHoldingLegalArchiveDossier', () => {
  it('masks financial fields and files when the server withheld both permissions', () => {
    const result = normalizeHoldingLegalArchiveDossier({
      id: 1, organization: null, contract: null, title: 'Договор', document_number: null, document_type: 'contract', document_type_label: 'Договор', status: 'active', status_label: 'Действует', document_date: null, effective_from: null, effective_until: null, counterparty_name: null, legal_significance_status: null, legal_significance_status_label: 'Не подтверждено', workflow_summary: { status: 'read_only', available_action_details: [] }, signature_summary: { total: 0, verified: 0, status: null }, financial_summary: { visible: false, total_amount: 500, paid_amount: 200, remaining_amount: 300 }, files: null as unknown as [], permissions: { can_preview_download: false, read_only: true }, created_at: null, updated_at: null,
    });
    expect(result.files).toEqual([]);
    expect(result.financial_summary).toEqual({ visible: false, total_amount: null, paid_amount: null, remaining_amount: null });
  });
});
