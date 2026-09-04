import { userManagementService } from '@/utils/api';
import type { OrganizationTeamMember, OrganizationTeamPage, OrganizationTeamQuery, OrganizationTeamRole } from '@/types/organization-team';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const isNullableString = (value: unknown) => value === null || typeof value === 'string';
const isNonNegativeInteger = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

const isRole = (value: unknown): value is OrganizationTeamRole => isRecord(value)
  && (value.id === null || isNonNegativeInteger(value.id))
  && typeof value.slug === 'string' && typeof value.name === 'string'
  && (value.type === 'system' || value.type === 'custom');

const isMember = (value: unknown): value is OrganizationTeamMember => isRecord(value)
  && isNonNegativeInteger(value.id) && value.id > 0
  && typeof value.name === 'string' && typeof value.email === 'string'
  && typeof value.is_active === 'boolean'
  && isNullableString(value.created_at) && isNullableString(value.email_verified_at)
  && Array.isArray(value.roles) && value.roles.every(isRole);

export function parseOrganizationTeamPage(value: unknown): OrganizationTeamPage {
  if (!isRecord(value) || value.success !== true || !Array.isArray(value.data)
    || !value.data.every(isMember) || !isRecord(value.meta)
    || !isNonNegativeInteger(value.meta.current_page) || value.meta.current_page < 1
    || !isNonNegativeInteger(value.meta.last_page) || value.meta.last_page < 1
    || !isNonNegativeInteger(value.meta.per_page) || value.meta.per_page < 1 || value.meta.per_page > 100
    || !isNonNegativeInteger(value.meta.total)
    || value.data.length > value.meta.per_page || value.data.length > value.meta.total) {
    throw new Error('Не удалось загрузить сотрудников. Попробуйте ещё раз.');
  }

  return {
    success: true,
    data: value.data,
    meta: {
      current_page: value.meta.current_page,
      last_page: value.meta.last_page,
      per_page: value.meta.per_page,
      total: value.meta.total,
    },
  };
}

export async function getOrganizationTeam(query: OrganizationTeamQuery, signal: AbortSignal): Promise<OrganizationTeamPage> {
  return parseOrganizationTeamPage(await userManagementService.getOrganizationTeam(query, signal));
}

export async function grantOrganizationTeamOwner(memberId: number, signal: AbortSignal): Promise<void> {
  const failure = 'Не удалось назначить владельца компании. Обновите список и проверьте его роль перед повторной попыткой.';
  if (!Number.isSafeInteger(memberId) || memberId < 1) throw new Error(failure);

  let result: unknown;
  try {
    const response = await userManagementService.grantOrganizationOwner(memberId, signal);
    result = response.data;
  } catch (error: unknown) {
    const status = isRecord(error) && isRecord(error.response) ? error.response.status : null;
    if (status === 403) throw new Error('Назначать владельцев может только владелец компании с правом назначения ролей.');
    if (status === 404) throw new Error('Сотрудник больше не доступен в этой компании. Обновите список.');
    if (status === 422) throw new Error('Сотрудника нельзя назначить владельцем. Проверьте, открыт ли ему доступ к компании.');
    throw new Error(failure);
  }

  if (!isRecord(result) || result.success !== true || !isRecord(result.data)
    || !isRecord(result.data.user) || result.data.user.id !== memberId
    || result.data.role_slug !== 'organization_owner') throw new Error(failure);
}

export async function setOrganizationTeamAccess(memberId: number, active: boolean, signal: AbortSignal): Promise<void> {
  const failure = 'Не удалось изменить доступ сотрудника. Попробуйте ещё раз.';
  if (!Number.isSafeInteger(memberId) || memberId < 1 || typeof active !== 'boolean') {
    throw new Error(failure);
  }

  let result: unknown;
  try {
    result = await userManagementService.setOrganizationTeamAccess(memberId, active, signal);
  } catch (error: unknown) {
    const status = isRecord(error) && isRecord(error.response) ? error.response.status : null;
    if (status === 403) throw new Error('У вас нет права изменять доступ этого сотрудника.');
    if (status === 404) throw new Error('Сотрудник больше не доступен в этой компании. Обновите список.');
    if (status === 422) throw new Error('Доступ этого сотрудника нельзя изменить. Обновите список и проверьте его статус.');
    throw new Error(failure);
  }

  if (!isRecord(result) || result.success !== true || !isRecord(result.data)
    || result.data.id !== memberId || result.data.is_active !== active) {
    throw new Error(failure);
  }
}
