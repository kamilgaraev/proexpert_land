import type { RoleComparison } from '@utils/api';

export const roleScopeLabel = (scope: string): string => ({
  system: 'Вся платформа',
  organization: 'Организация',
  project: 'Объект',
}[scope] ?? 'Не указано');

export const roleWorkspaceLabel = (workspace: string): string => ({
  admin: 'Работа с объектами',
  lk: 'Личный кабинет',
  mobile: 'Мобильное приложение',
}[workspace] ?? 'Другой раздел');

export const roleScheduleLabel = (restrictions: RoleComparison['time_restrictions']): string => {
  if (!restrictions.has_restrictions) return 'Без ограничений по времени';
  return [restrictions.working_hours, restrictions.working_days].filter(Boolean).join(', ') || 'Действуют ограничения по времени';
};
