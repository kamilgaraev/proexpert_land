export interface OrganizationTeamRole {
  id: number | null;
  slug: string;
  name: string;
  type: 'system' | 'custom';
}

export interface OrganizationTeamMember {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  is_active: boolean;
  roles: OrganizationTeamRole[];
  created_at: string | null;
}

export interface OrganizationTeamPage {
  success: true;
  data: OrganizationTeamMember[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface OrganizationTeamQuery {
  search: string;
  page: number;
  per_page: number;
}
