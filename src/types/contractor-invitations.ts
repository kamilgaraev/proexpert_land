// Типы для системы приглашений подрядчиков

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface ContractorInvitation {
  id: number;
  token?: string;
  status: InvitationStatus;
  invitation_message: string;
  expires_at: string;
  created_at: string;
  accepted_at?: string;
  declined_at?: string;
  is_expired: boolean;
  can_be_accepted: boolean;
  from_organization: OrganizationInfo;
  invited_by: InvitedByUser;
  metadata?: InvitationMetadata;
  decline_reason?: string;
}

export interface OrganizationInfo {
  id: number;
  name: string;
  legal_name?: string;
  city: string;
  country?: string;
  is_verified: boolean;
  description?: string;
  logo_path?: string;
  contractor_connections_count?: number;
}

export interface InvitedByUser {
  name: string;
  email: string;
}

export interface InvitationMetadata {
  project_type?: string;
  budget_range?: string;
  [key: string]: any;
}

export interface InvitationStats {
  received_invitations: {
    total: number;
    pending: number;
    accepted: number;
    declined: number;
  };
  sent_invitations: {
    total: number;
    pending: number;
    accepted: number;
    declined: number;
  };
}

export interface InvitationListResponse {
  data: ContractorInvitation[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    has_more_pages: boolean;
  };
  meta: {
    type: 'received';
    filters: InvitationFilters;
  };
}

export interface InvitationFilters {
  status?: InvitationStatus;
  date_from?: string;
  date_to?: string;
  per_page?: number;
}

export interface InvitationAcceptResponse {
  contractor: {
    id: number;
    name: string;
    connected_at: string;
  };
  message: string;
}

export interface InvitationDeclineRequest {
  reason?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Константы статусов для удобства
export const INVITATION_STATUSES = {
  PENDING: 'pending' as const,
  ACCEPTED: 'accepted' as const,
  DECLINED: 'declined' as const,
  EXPIRED: 'expired' as const,
};

export const INVITATION_STATUS_LABELS = {
  [INVITATION_STATUSES.PENDING]: 'Ожидает ответа',
  [INVITATION_STATUSES.ACCEPTED]: 'Принято',
  [INVITATION_STATUSES.DECLINED]: 'Отклонено',
  [INVITATION_STATUSES.EXPIRED]: 'Истекло',
};

export const INVITATION_STATUS_COLORS = {
  [INVITATION_STATUSES.PENDING]: 'text-safety-600 bg-safety-100',
  [INVITATION_STATUSES.ACCEPTED]: 'text-construction-600 bg-construction-100',
  [INVITATION_STATUSES.DECLINED]: 'text-steel-600 bg-steel-100',
  [INVITATION_STATUSES.EXPIRED]: 'text-concrete-600 bg-concrete-100',
};