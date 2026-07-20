import api from '@/utils/api';
import type { HoldingLegalArchiveDossier } from '@/types/legalArchive';

type LandingResponse<T> = { success: boolean; data: T; message?: string };
type HoldingFileUrl = { url: string; expires_in_seconds: number };

const dossierPath = (contractId: number): string => `/multi-organization/legal-archive/contracts/${contractId}`;

export const normalizeHoldingLegalArchiveDossier = (value: HoldingLegalArchiveDossier): HoldingLegalArchiveDossier => ({
  ...value,
  organization: value.organization ?? null,
  contract: value.contract ?? null,
  document_number: value.document_number ?? null,
  counterparty_name: value.counterparty_name ?? null,
  legal_significance_status: value.legal_significance_status ?? null,
  files: Array.isArray(value.files) ? value.files : [],
  workflow_summary: { status: 'read_only', available_action_details: [] },
  permissions: { can_preview_download: Boolean(value.permissions?.can_preview_download), read_only: true },
  financial_summary: {
    visible: Boolean(value.financial_summary?.visible),
    total_amount: value.financial_summary?.visible ? value.financial_summary.total_amount ?? null : null,
    paid_amount: value.financial_summary?.visible ? value.financial_summary.paid_amount ?? null : null,
    remaining_amount: value.financial_summary?.visible ? value.financial_summary.remaining_amount ?? null : null,
  },
});

export const holdingLegalArchiveService = {
  async getContractDossier(contractId: number): Promise<HoldingLegalArchiveDossier> {
    const response = await api.get<LandingResponse<HoldingLegalArchiveDossier>>(dossierPath(contractId));
    return normalizeHoldingLegalArchiveDossier(response.data.data);
  },
  async getPreviewUrl(contractId: number, versionId: number): Promise<string> {
    const response = await api.get<LandingResponse<HoldingFileUrl>>(`${dossierPath(contractId)}/versions/${versionId}/preview`);
    return response.data.data.url;
  },
  async getDownloadUrl(contractId: number, versionId: number): Promise<string> {
    const response = await api.get<LandingResponse<HoldingFileUrl>>(`${dossierPath(contractId)}/versions/${versionId}/download`);
    return response.data.data.url;
  },
};
