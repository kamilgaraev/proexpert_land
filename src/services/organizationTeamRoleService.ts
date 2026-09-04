import { userManagementService } from '@/utils/api';
import type { OrganizationTeamRole } from '@/types/organization-team';

export interface OrganizationTeamRoleChoice extends OrganizationTeamRole {
  description: string;
  preview: string[];
}

const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const positiveId = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
const loadFailure = 'Не удалось загрузить роли компании. Попробуйте ещё раз.';

function parseChoice(value: unknown, type: 'system' | 'custom'): OrganizationTeamRoleChoice {
  if (!record(value) || value.type !== type || typeof value.slug !== 'string' || !value.slug
    || typeof value.name !== 'string' || !value.name.trim() || typeof value.is_active !== 'boolean'
    || (type === 'custom' && !positiveId(value.id))
    || (value.description !== null && typeof value.description !== 'string')
    || !Array.isArray(value.permission_preview) || !value.permission_preview.every(item => typeof item === 'string')) {
    throw new Error(loadFailure);
  }
  return {
    id: type === 'custom' && positiveId(value.id) ? value.id : null,
    slug: value.slug,
    name: value.name,
    type,
    description: value.description ?? '',
    preview: value.permission_preview,
  };
}

export async function getOrganizationTeamRoleChoices(organizationId: number, signal: AbortSignal): Promise<OrganizationTeamRoleChoice[]> {
  if (!positiveId(organizationId)) throw new Error(loadFailure);
  let result: unknown;
  try {
    result = await userManagementService.getOrganizationTeamRoles(signal);
  } catch {
    throw new Error(loadFailure);
  }
  if (!record(result) || result.success !== true || !record(result.data)
    || result.data.organization_id !== organizationId || !Array.isArray(result.data.system_roles)
    || !Array.isArray(result.data.custom_roles)) throw new Error(loadFailure);

  const choices: OrganizationTeamRoleChoice[] = [];
  for (const type of ['system', 'custom'] as const) {
    const values = type === 'system' ? result.data.system_roles : result.data.custom_roles;
    for (const value of values) {
      const choice = parseChoice(value, type);
      if (record(value) && value.is_active && choice.slug !== 'organization_owner'
        && (type === 'custom' || value.assignable === true)) choices.push(choice);
    }
  }
  const keys = choices.map(choice => `${choice.type}:${choice.slug}`);
  if (new Set(keys).size !== keys.length) throw new Error(loadFailure);
  return choices;
}

export async function changeOrganizationTeamRole(memberId: number, role: OrganizationTeamRole, action: 'add' | 'remove', signal: AbortSignal): Promise<void> {
  const failure = 'Не удалось изменить роль сотрудника. Обновите список и проверьте его роли перед повторной попыткой.';
  if (!positiveId(memberId) || !role.slug || role.slug === 'organization_owner'
    || !['system', 'custom'].includes(role.type) || !['add', 'remove'].includes(action)
    || (role.type === 'custom' && !positiveId(role.id))) throw new Error(failure);
  const roles = role.type === 'system' ? { system_roles: [role.slug] } : { custom_role_ids: [role.id as number] };
  let result: unknown;
  try {
    result = await userManagementService.changeOrganizationTeamRole(memberId, { ...roles, action }, signal);
  } catch (error: unknown) {
    const status = record(error) && record(error.response) ? error.response.status : null;
    if (status === 403) throw new Error('У вас нет права изменять роли этого сотрудника.');
    if (status === 404) throw new Error('Сотрудник больше не доступен в этой компании. Обновите список.');
    if (status === 422) throw new Error('Эту роль нельзя назначить или снять. Обновите список доступных ролей.');
    throw new Error(failure);
  }
  if (!record(result) || result.success !== true || !record(result.data) || result.data.id !== memberId) throw new Error(failure);
}
