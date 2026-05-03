import { multiOrganizationService } from '@/utils/api';
import type { AddChildOrganizationRequest } from '@/utils/api';
import type {
  HoldingContext,
  HoldingOrganization,
  HoldingOrganizationsFilters,
  HoldingOrganizationsPagination,
  HoldingOrganizationsResult,
} from '@/types/holding-organizations';

export class HoldingOrganizationsApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'HoldingOrganizationsApiError';
    this.status = status;
  }
}

const defaultPagination = (total: number): HoldingOrganizationsPagination => ({
  current_page: 1,
  last_page: 1,
  per_page: total,
  total,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asRecord = (value: unknown): Record<string, unknown> => (isRecord(value) ? value : {});

const optionalString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const numberOrZero = (value: unknown): number => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const optionalNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
};

const unwrapResponse = (response: unknown): { payload: unknown; status?: number } => {
  const responseRecord = asRecord(response);
  const status = optionalNumber(responseRecord.status);
  const payload = 'status' in responseRecord && 'data' in responseRecord
    ? responseRecord.data
    : response;

  return { payload, status };
};

const unwrapEnvelope = (response: unknown): { payload: unknown; status?: number } => {
  const { payload, status } = unwrapResponse(response);
  const envelope = asRecord(payload);

  if (envelope.success === false) {
    throw new HoldingOrganizationsApiError(
      optionalString(envelope.message) ?? 'Не удалось загрузить организации холдинга',
      status,
    );
  }

  const data = envelope.success === true && 'data' in envelope ? envelope.data : payload;
  const nested = asRecord(data);

  if (nested.success === false) {
    throw new HoldingOrganizationsApiError(
      optionalString(nested.message) ?? 'Не удалось загрузить организации холдинга',
      status,
    );
  }

  if (nested.success === true && 'data' in nested) {
    return { payload: nested.data, status };
  }

  return { payload: data, status };
};

const normalizePagination = (
  rawPagination: unknown,
  organizationsCount: number,
): HoldingOrganizationsPagination => {
  const pagination = asRecord(rawPagination);

  if (Object.keys(pagination).length === 0) {
    return defaultPagination(organizationsCount);
  }

  return {
    current_page: numberOrZero(pagination.current_page) || 1,
    last_page: numberOrZero(pagination.last_page) || 1,
    per_page: numberOrZero(pagination.per_page) || organizationsCount,
    total: numberOrZero(pagination.total) || organizationsCount,
  };
};

const normalizeOrganization = (rawOrganization: unknown): HoldingOrganization => {
  const organization = asRecord(rawOrganization);
  const stats = asRecord(organization.stats);
  const activeContractsValue = optionalNumber(
    stats.active_contracts_value ?? organization.active_contracts_value,
  );

  return {
    id: numberOrZero(organization.id),
    name: optionalString(organization.name) ?? 'Организация',
    description: optionalString(organization.description),
    organization_type: optionalString(organization.organization_type) ?? 'child',
    hierarchy_level: numberOrZero(organization.hierarchy_level),
    tax_number: optionalString(organization.tax_number),
    registration_number: optionalString(organization.registration_number),
    address: optionalString(organization.address),
    phone: optionalString(organization.phone),
    email: optionalString(organization.email),
    created_at: optionalString(organization.created_at),
    is_active: typeof organization.is_active === 'boolean' ? organization.is_active : undefined,
    stats: {
      users_count: numberOrZero(stats.users_count ?? organization.users_count),
      projects_count: numberOrZero(stats.projects_count ?? organization.projects_count),
      contracts_count: numberOrZero(stats.contracts_count ?? organization.contracts_count),
      ...(activeContractsValue === undefined ? {} : { active_contracts_value: activeContractsValue }),
    },
  };
};

export const normalizeHoldingOrganizationsResponse = (response: unknown): HoldingOrganizationsResult => {
  const { payload } = unwrapEnvelope(response);
  const payloadRecord = asRecord(payload);
  const rawOrganizations = Array.isArray(payload)
    ? payload
    : Array.isArray(payloadRecord.organizations)
      ? payloadRecord.organizations
      : Array.isArray(payloadRecord.data)
        ? payloadRecord.data
        : [];

  const organizations = rawOrganizations.map(normalizeOrganization);

  return {
    organizations,
    pagination: normalizePagination(payloadRecord.pagination, organizations.length),
  };
};

export const normalizeHoldingContextResponse = (response: unknown): HoldingContext => {
  const { payload } = unwrapEnvelope(response);
  const parent = asRecord(asRecord(payload).parent);
  const groupId = numberOrZero(parent.group_id);

  return {
    name: optionalString(parent.name) ?? 'Холдинг',
    groupId,
  };
};

export const holdingOrganizationsService = {
  getOrganizations: async (filters: HoldingOrganizationsFilters = {}): Promise<HoldingOrganizationsResult> => {
    const response = await multiOrganizationService.getChildOrganizations({
      status: 'all',
      per_page: 100,
      sort_by: 'name',
      sort_direction: 'asc',
      ...filters,
    });

    return normalizeHoldingOrganizationsResponse(response);
  },

  getContext: async (): Promise<HoldingContext> => {
    const response = await multiOrganizationService.getHierarchy();
    return normalizeHoldingContextResponse(response);
  },

  createOrganization: async (payload: AddChildOrganizationRequest): Promise<void> => {
    const response = await multiOrganizationService.addChildOrganization(payload);
    unwrapEnvelope(response);
  },
};
