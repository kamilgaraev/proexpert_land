export type AiAssistantProfile = 'short' | 'normal' | 'detailed';
export type AiAssistantParticipantRole = 'viewer' | 'editor';
export interface AiAssistantPaginationMeta { current_page: number; last_page: number; per_page: number; total: number }
export interface AiAssistantConversation { id: string; title?: string | null; user_id: string; participant_role?: AiAssistantParticipantRole; is_owned_by_current_user?: boolean; can_edit?: boolean; can_manage_participants?: boolean; scope?: 'personal' | 'shared' }
export interface AiAssistantParticipant { user_id: string; name?: string; role: AiAssistantParticipantRole }
export interface AiAssistantSource { title?: string; name?: string; source_type?: string; entity_type?: string; entity_id?: string | number; project_id?: string | number | null; excerpt?: string; fetched_at?: string; navigation?: { url?: string }; url?: string; provenance?: string }
export interface AiAssistantAction { tool_name: string; arguments: Record<string, unknown>; label?: string }
export interface AiAssistantAttachment { id: string; name: string; mime: string; size: number; width: number; height: number }
export interface AiAssistantMessage { id: string; role: string; content: string; created_at?: string; metadata?: { attachments?: AiAssistantAttachment[]; response_kind?: string; validation_status?: 'verified' | 'partial' | 'unverified'; source_refs?: AiAssistantSource[]; rag_context?: { sources?: AiAssistantSource[] }; entity_references?: AiAssistantSource[]; proposed_actions?: AiAssistantAction[]; suggested_actions?: AiAssistantAction[]; actions?: AiAssistantAction[]; fetched_at?: string; financial_provenance?: unknown; artifacts?: AiAssistantArtifact[] } }
export interface AiAssistantMemory { id: string; content: string }
export interface AiAssistantCreditsBalance { included_minor: number; purchased_minor: number; reserved_minor: number; available_minor: number; total_minor: number; base_period_expires_at?: string | null; packs: { id: string; units_minor: number; amount_minor: number }[]; charging_enabled: boolean; billing_mode?: 'shadow' | 'paid'; can_purchase?: boolean; can_manage_billing?: boolean; pack_purchase_enabled?: boolean }
export interface AiAssistantUsage { billing_contract_version?: number; limiting_resource?: string; usage_kind?: string; monthly_limit: number | null; used: number; remaining: number | null; percentage_used: number | null; tokens_used?: number; cost_rub?: number }
export interface AiAssistantCreditUsage { charged_minor?: number | string | null; reserved_minor?: number | string | null; available_after_minor?: number | string | null; charging_enabled?: boolean }
export interface AiAssistantQuote { quote_id: string; min_units_minor: number; max_units_minor: number; expires_at: string; profile: AiAssistantProfile; price_version: string }
export interface AiAssistantChatInput { conversation_id: string; message: string; request_id: string; profile: AiAssistantProfile; allow_actions: boolean; context: Record<string, unknown>; attachment_ids?: string[] }
export interface AiAssistantActionPreview { title: string; description?: string; action: { id: string }; preview_token: string; expires_at: string; before?: unknown; after?: unknown; warnings?: string[]; executable?: boolean }
export interface AiAssistantChatResult { request_id: string; conversation_id: string; message: AiAssistantMessage; credit_usage: AiAssistantCreditUsage }
export interface AiAssistantRequestAccepted { request_id: string; conversation_id: string | null; status: 'running'; stage: string }
export type AiAssistantChatSubmission = AiAssistantChatResult | AiAssistantRequestAccepted;
export interface AiAssistantRequestStatus { request_id: string; conversation_id: string | null; status: 'running' | 'completed' | 'failed' | 'cancelled' | string; stage?: string; response?: AiAssistantChatResult; error_code?: string; calls_used?: number; max_calls?: number }


export interface AiAssistantArtifact { title?: string | null; filename?: string | null; file_name?: string | null; download_url?: string | null; url?: string | null }
export interface AiAssistantDocumentSettings { enabled: boolean; scope: 'new' | 'archive'; limit_minor: number; reserved_minor: number; spent_minor: number; available_minor: number; scanned_count: number; last_file_id: number | null; scan_completed_at: string | null }
export interface AiAssistantDocumentCoverage { total: number; ready: number; pending: number; ocr_required: number; ocr_processing: number; failed: number; unsupported: number; empty: number; processed_units: number; total_pages: number; ocr_completed_pages: number }
export interface AiAssistantRagStatus {
  enabled: boolean; ready: boolean; source_count: number; chunk_count: number;
  expected_source_count: number | null; indexed_source_count: number | null; pending_source_count: number | null; stale_source_count: number | null;
  eligible_count_known: boolean; coverage_complete: boolean; processing: boolean; lag_seconds: number | null; lag_exceeded: boolean; coverage_snapshot_at?: string | null;
  source_catalog: { type: string; enabled: boolean; expected_count: number | null; indexed_count: number | null; pending_count: number | null; error: string | null }[];
  document_coverage?: AiAssistantDocumentCoverage | null;
  archive_scan?: { expected_file_count: number | null; scanned_file_count: number | null; last_file_id: number | null; completed_at: string | null; processing: boolean } | null;
  can_manage_document_settings: boolean;
}
