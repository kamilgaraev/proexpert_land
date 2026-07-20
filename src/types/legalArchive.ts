export interface HoldingLegalArchiveVersion {
  id: number;
  version_number: number;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  preview_available: boolean;
}

export interface HoldingLegalArchiveFile {
  id: number;
  title: string;
  role: string;
  current_version: HoldingLegalArchiveVersion | null;
  versions: HoldingLegalArchiveVersion[];
}

export interface HoldingLegalArchiveDossier {
  id: number;
  organization: { id: number; name: string } | null;
  contract: { id: number; number: string; status: string } | null;
  title: string;
  document_number: string | null;
  document_type: string;
  document_type_label: string;
  status: string;
  status_label: string;
  document_date: string | null;
  effective_from: string | null;
  effective_until: string | null;
  counterparty_name: string | null;
  legal_significance_status: string | null;
  legal_significance_status_label: string;
  workflow_summary: { status: 'read_only'; available_action_details: [] };
  signature_summary: { total: number; verified: number; status: string | null };
  financial_summary: { visible: boolean; total_amount: number | null; paid_amount: number | null; remaining_amount: number | null };
  files: HoldingLegalArchiveFile[];
  permissions: { can_preview_download: boolean; read_only: true };
  created_at: string | null;
  updated_at: string | null;
}
