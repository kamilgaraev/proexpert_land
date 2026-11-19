export type AiAssistantProfile = 'short' | 'normal' | 'detailed';
export type AiAssistantParticipantRole = 'viewer' | 'editor';
export interface AiAssistantPaginationMeta { current_page: number; last_page: number; per_page: number; total: number; active_request?: AiAssistantRequestAccepted | null }
export interface AiAssistantConversation { id: string; title?: string | null; user_id: string; participant_role?: AiAssistantParticipantRole; is_owned_by_current_user?: boolean; can_edit?: boolean; can_manage_participants?: boolean; scope?: 'personal' | 'shared' }
export interface AiAssistantParticipant { user_id: string; name?: string; role: AiAssistantParticipantRole }
export interface AiAssistantSource { title?: string; display_label?: string; name?: string; source_type?: string; entity_type?: string; entity_id?: string | number; project_id?: string | number | null; document_id?: number; unit_id?: number; chunk_id?: number; chunk_index?: number; excerpt?: string; fetched_at?: string; navigation?: { url?: string }; url?: string; provenance?: string }
export interface AiAssistantSourcePreview { message_id: string; source_index: number; source: AiAssistantSource; kind: 'source_chunk_preview'; title: string; content: string; content_range: { offset: number; length: number; total_length: number; truncated: boolean } }
export interface AiAssistantAction { type?: string; requires_confirmation?: boolean; tool_name: string; arguments: Record<string, unknown>; label?: string; allowed?: boolean; action_class?: string; origin_request_id?: string | null }
export interface AiAssistantAttachment { id: string; name: string; mime: string; size: number; width: number; height: number }
export interface AiAssistantTypedFactsLocator { version: 'ordinary-typed-facts-context/1'; receipt_id: string; receipt_hash: string }
export type AiAssistantOutcome = 'ok' | 'no_match' | 'ambiguous' | 'denied' | 'unavailable' | 'conflict' | 'clarification' | 'write_proposal';
export type AiAssistantCoverageStatus = 'found' | 'partial' | 'confirmed_absence' | 'unavailable' | 'not_applicable';
export interface AiAssistantUiAction { type: 'reveal_source'; label: string; surface: 'admin' | 'lk' | 'mobile'; target: string; auto_open?: boolean }
export interface AiAssistantPublishedResult {
  contract_version?: 1;
  outcome?: AiAssistantOutcome;
  coverage?: { status: AiAssistantCoverageStatus; reason?: string };
  evidence?: Array<{ source_ref?: AiAssistantSource } & Record<string, unknown>>;
  billing?: { charged_minor: number; reason: string };
  ui_actions?: AiAssistantUiAction[];
  auto_open?: boolean;
  export_task?: AiAssistantArtifact;
}
export interface AiAssistantMessage { id: string; role: string; content: string; created_at?: string; metadata?: AiAssistantPublishedResult & { typed_facts?: AiAssistantTypedFactsLocator; attachments?: AiAssistantAttachment[]; response_kind?: string; validation_status?: 'verified' | 'partial' | 'unverified'; source_refs_version?: string; source_refs?: AiAssistantSource[]; rag_context?: { sources?: AiAssistantSource[] }; entity_references?: AiAssistantSource[]; request_id?: string; next_actions?: AiAssistantAction[]; proposed_actions?: AiAssistantAction[]; suggested_actions?: AiAssistantAction[]; actions?: AiAssistantAction[]; fetched_at?: string; financial_provenance?: unknown; artifacts?: AiAssistantArtifact[] } }
export interface AiAssistantMemory { id: string; content: string }
export interface AiAssistantCreditsBalance { included_minor: number; purchased_minor: number; reserved_minor: number; available_minor: number; total_minor: number; base_period_expires_at?: string | null; packs: { id: string; units_minor: number; amount_minor: number }[]; charging_enabled: boolean; billing_mode?: 'shadow' | 'paid'; can_purchase?: boolean; can_manage_billing?: boolean; pack_purchase_enabled?: boolean }
export interface AiAssistantUsage { billing_contract_version?: number; limiting_resource?: string; usage_kind?: string; monthly_limit: number | null; used: number; remaining: number | null; percentage_used: number | null; tokens_used?: number; cost_rub?: number }
export interface AiAssistantCreditUsage { charged_minor?: number | string | null; reserved_minor?: number | string | null; available_after_minor?: number | string | null; charging_enabled?: boolean }
export interface AiAssistantQuote { quote_id: string; min_units_minor: number; max_units_minor: number; expires_at: string; profile: AiAssistantProfile; price_version: string; metadata?: { processing_deadline_seconds?: number } }
export interface AiAssistantChatInput { conversation_id: string; message: string; request_id: string; profile: AiAssistantProfile; allow_actions: boolean; context: Record<string, unknown> & { typed_facts?: AiAssistantTypedFactsLocator }; attachment_ids?: string[] }
export interface AiAssistantActionPreview { title: string; description?: string; action: { id: string }; preview_token: string; expires_at: string; before?: unknown; after?: unknown; warnings?: string[]; executable?: boolean }
export type AiAssistantProgressCode = 'rag_search' | 'estimates' | 'warehouse' | 'projects' | 'contracts' | 'procurement' | 'schedule' | 'work_volumes' | 'materials' | 'reports' | 'financial_data' | 'record_check' | 'composing';
export type AiAssistantProgressState = 'started' | 'completed' | 'failed';
export interface AiAssistantProgress { id: number; key?: string; code: AiAssistantProgressCode; state: AiAssistantProgressState; at?: string }
export interface AiAssistantInterimResult {
  key: 'answer';
  revision: number;
  text: string;
  scope: { kind: 'project' | 'organization'; project_id?: number };
  sources: { label: string }[];
  published_at: string;
}
export interface AiAssistantChatResult extends AiAssistantPublishedResult { result_key?: 'answer'; request_id: string; conversation_id: string; message: AiAssistantMessage; credit_usage: AiAssistantCreditUsage; progress?: AiAssistantProgress[] }
export type AiAssistantRunStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
export interface AiAssistantRequestStatus { accepted_at?: string; elapsed_seconds?: number; interim_result?: AiAssistantInterimResult | null; request_id: string; conversation_id: string | null; status: string; run_status?: AiAssistantRunStatus; stage?: string; progress?: AiAssistantProgress[]; response?: AiAssistantChatResult; error_code?: string; calls_used?: number; max_calls?: number }
export interface AiAssistantRequestAccepted extends AiAssistantRequestStatus { status: 'running' | 'queued' | 'cancel_requested'; stage: string }
export interface AiAssistantRequestTerminated extends AiAssistantRequestStatus { status: 'failed' | 'cancelled' }
export type AiAssistantChatSubmission = AiAssistantChatResult | AiAssistantRequestAccepted | AiAssistantRequestTerminated;


export interface AiAssistantArtifact { artifact_type?: string | null; task_id?: string | null; status?: string | null; title?: string | null; filename?: string | null; file_name?: string | null; download_url?: string | null; url?: string | null }
export interface AiAssistantDocumentSettings { enabled: boolean; scope: 'new' | 'archive'; limit_minor: number; reserved_minor: number; spent_minor: number; available_minor: number; scanned_count: number; last_file_id: number | null; scan_completed_at: string | null }
export interface AiAssistantDocumentCoverage { total: number; ready: number; pending: number; ocr_required: number; ocr_processing: number; failed: number; unsupported: number; empty: number; processed_units: number; total_pages: number; ocr_completed_pages: number }
export interface AiAssistantRagStatus {
  status_available: boolean; enabled: boolean; ready: boolean; source_count: number | null; chunk_count: number | null;
  expected_source_count: number | null; indexed_source_count: number | null; pending_source_count: number | null; stale_source_count: number | null;
  eligible_count_known: boolean; coverage_complete: boolean; processing: boolean; lag_seconds: number | null; lag_exceeded: boolean; coverage_snapshot_at?: string | null;
  source_catalog: { type: string; enabled: boolean; expected_count: number | null; indexed_count: number | null; pending_count: number | null; error: string | null }[];
  document_coverage?: AiAssistantDocumentCoverage | null;
  archive_scan?: { expected_file_count: number | null; scanned_file_count: number | null; last_file_id: number | null; completed_at: string | null; processing: boolean } | null;
  can_manage_document_settings: boolean;
}
