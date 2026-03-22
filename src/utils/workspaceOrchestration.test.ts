import { describe, expect, it } from 'vitest';

import {
  buildWorkspaceSummary,
  getPreferredWorkspaceRoute,
  prioritizeWorkspaceNavigation,
} from './workspaceOrchestration';

describe('workspaceOrchestration', () => {
  const navigation = [
    { href: '/dashboard', name: 'Обзор' },
    { href: '/dashboard/projects', name: 'Проекты' },
    { href: '/dashboard/modules', name: 'Модули' },
    { href: '/dashboard/contractor-invitations', name: 'Связи' },
    { href: '/dashboard/billing', name: 'Финансы' },
  ];

  it('prioritizes project routes for general contracting', () => {
    const prioritized = prioritizeWorkspaceNavigation(
      navigation,
      {
        primary_profile: 'general_contracting',
        workspace_options: [
          {
            value: 'general_contracting',
            label: 'Генеральный подряд',
            default_route: '/dashboard/projects',
            interaction_modes: ['project_participant'],
            allowed_project_roles: ['general_contractor', 'observer'],
            recommended_modules: [],
          },
        ],
        recommended_actions: [],
      },
      ['project-management', 'contractor-portal']
    );

    expect(prioritized.map((item) => item.href)).toEqual([
      '/dashboard/projects',
      '/dashboard/contractor-invitations',
      '/dashboard/modules',
      '/dashboard/billing',
      '/dashboard',
    ]);
  });

  it('keeps active module access visible for supply profiles', () => {
    const prioritized = prioritizeWorkspaceNavigation(
      navigation,
      {
        primary_profile: 'materials_supply',
        workspace_options: [
          {
            value: 'materials_supply',
            label: 'Поставка материалов',
            default_route: '/dashboard/modules',
            interaction_modes: ['procurement_counterparty'],
            allowed_project_roles: ['observer'],
            recommended_modules: [],
          },
        ],
        recommended_actions: [],
      },
      ['payments', 'basic-warehouse']
    );

    expect(prioritized[0].href).toBe('/dashboard/modules');
    expect(prioritized.some((item) => item.href === '/dashboard')).toBe(true);
  });

  it('builds a workspace summary from the primary profile', () => {
    expect(
      buildWorkspaceSummary({
        primary_profile: 'equipment_rental',
        workspace_options: [
          {
            value: 'equipment_rental',
            label: 'Аренда техники',
            default_route: '/dashboard/modules',
            interaction_modes: ['service_counterparty'],
            allowed_project_roles: ['observer'],
            recommended_modules: [],
          },
        ],
        recommended_actions: [],
      })
    ).toMatchObject({
      label: 'Аренда техники',
      modeLabels: ['Сервисный контур'],
    });
  });

  it('returns the first non-overview route as preferred workspace route', () => {
    expect(
      getPreferredWorkspaceRoute(navigation, {
        primary_profile: 'general_contracting',
        workspace_options: [
          {
            value: 'general_contracting',
            label: 'Генеральный подряд',
            default_route: '/dashboard/projects',
            interaction_modes: ['project_participant'],
            allowed_project_roles: ['general_contractor', 'observer'],
            recommended_modules: [],
          },
        ],
        recommended_actions: [],
      })
    ).toBe('/dashboard/projects');
  });
});
