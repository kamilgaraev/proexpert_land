export interface ChildOrganization {
  id: number;
  name: string;
  organization_type: string;
  hierarchy_level: number;
  tax_number: string | null;
  registration_number: string | null;
  address: string | null;
  users_count: number;
  projects_count: number;
  contracts_count: number;
  is_active: boolean;
  created_at: string;
}

export interface ChildOrganizationsPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ChildOrganizationsResult {
  organizations: ChildOrganization[];
  pagination: ChildOrganizationsPagination;
}

export interface OrganizationStats {
  users: {
    total: number;
    active: number;
    owners: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
  };
  contracts: {
    total: number;
    active: number;
    total_value: number;
    active_value: number;
  };
  financial: {
    balance: number;
    monthly_expenses: number;
  };
}

const defaultPagination: ChildOrganizationsPagination = {
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
};

const unwrapLandingData = (payload: unknown): unknown => {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  const value = payload as { data?: unknown };

  if (value.data && typeof value.data === 'object') {
    return value.data;
  }

  return payload;
};

const toNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
};

const normalizeOrganization = (value: unknown): ChildOrganization | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const organization = value as Record<string, unknown>;
  const id = toNumber(organization.id);
  const name = typeof organization.name === 'string' ? organization.name : '';

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    organization_type:
      typeof organization.organization_type === 'string' ? organization.organization_type : 'child',
    hierarchy_level: toNumber(organization.hierarchy_level),
    tax_number: typeof organization.tax_number === 'string' ? organization.tax_number : null,
    registration_number:
      typeof organization.registration_number === 'string'
        ? organization.registration_number
        : null,
    address: typeof organization.address === 'string' ? organization.address : null,
    users_count: toNumber(organization.users_count),
    projects_count: toNumber(organization.projects_count),
    contracts_count: toNumber(organization.contracts_count),
    is_active:
      typeof organization.is_active === 'boolean' ? organization.is_active : true,
    created_at:
      typeof organization.created_at === 'string' ? organization.created_at : '',
  };
};

export const normalizeChildOrganizationsPayload = (
  payload: unknown,
): ChildOrganizationsResult => {
  const data = unwrapLandingData(payload);

  if (!data || typeof data !== 'object') {
    return {
      organizations: [],
      pagination: defaultPagination,
    };
  }

  const value = data as {
    organizations?: unknown;
    pagination?: Partial<ChildOrganizationsPagination>;
  };

  const organizations = Array.isArray(value.organizations)
    ? value.organizations
        .map((organization) => normalizeOrganization(organization))
        .filter((organization): organization is ChildOrganization => Boolean(organization))
    : [];

  return {
    organizations,
    pagination: {
      current_page: toNumber(value.pagination?.current_page) || 1,
      last_page: toNumber(value.pagination?.last_page) || 1,
      per_page: toNumber(value.pagination?.per_page) || 15,
      total: toNumber(value.pagination?.total),
    },
  };
};

export const normalizeOrganizationStatsPayload = (payload: unknown): OrganizationStats => {
  const data = unwrapLandingData(payload);
  const value = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  const users = value.users && typeof value.users === 'object' ? (value.users as Record<string, unknown>) : {};
  const projects =
    value.projects && typeof value.projects === 'object'
      ? (value.projects as Record<string, unknown>)
      : {};
  const contracts =
    value.contracts && typeof value.contracts === 'object'
      ? (value.contracts as Record<string, unknown>)
      : {};
  const financial =
    value.financial && typeof value.financial === 'object'
      ? (value.financial as Record<string, unknown>)
      : {};

  return {
    users: {
      total: toNumber(users.total),
      active: toNumber(users.active),
      owners: toNumber(users.owners),
    },
    projects: {
      total: toNumber(projects.total),
      active: toNumber(projects.active),
      completed: toNumber(projects.completed),
    },
    contracts: {
      total: toNumber(contracts.total),
      active: toNumber(contracts.active),
      total_value: toNumber(contracts.total_value),
      active_value: toNumber(contracts.active_value),
    },
    financial: {
      balance: toNumber(financial.balance),
      monthly_expenses: toNumber(financial.monthly_expenses),
    },
  };
};
