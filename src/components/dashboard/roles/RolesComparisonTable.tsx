import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { rolesComparisonService, type RoleComparison } from '@utils/api';
import { Button } from '@/components/ui/button';
import RoleDetailsModal from './RoleDetailsModal';
import { roleScopeLabel, roleWorkspaceLabel } from './rolePresentation';

interface RolesComparisonTableProps {
  onRoleClick?: (role: RoleComparison) => void;
}

const RolesComparisonTable: React.FC<RolesComparisonTableProps> = ({ onRoleClick }) => {
  const [roles, setRoles] = useState<RoleComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [selectedRole, setSelectedRole] = useState<RoleComparison | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [contextFilter, setContextFilter] = useState('all');
  const [interfaceFilters, setInterfaceFilters] = useState<string[]>([]);
  const [billingFilter, setBillingFilter] = useState('all');
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    rolesComparisonService.getRolesComparison().then((response) => {
      if (!active) return;
      if (!response.data.success || !response.data.data) throw new Error('roles');
      setRoles(response.data.data.roles || []);
    }).catch(() => {
      if (active) setError(true);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [attempt]);

  const availableInterfaces = useMemo(() => [...new Set(roles.flatMap(role => role.interfaces_slugs))], [roles]);
  const filteredRoles = useMemo(() => {
    const term = searchTerm.trim().toLocaleLowerCase('ru');
    return roles.filter(role => (
      (!term || `${role.name} ${role.description}`.toLocaleLowerCase('ru').includes(term)) &&
      (contextFilter === 'all' || role.context_slug === contextFilter) &&
      (!interfaceFilters.length || interfaceFilters.some(value => role.interfaces_slugs.includes(value))) &&
      (billingFilter === 'all' || role.billing_access === (billingFilter === 'yes'))
    )).sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  }, [roles, searchTerm, contextFilter, interfaceFilters, billingFilter]);

  const resetFilters = () => {
    setSearchTerm('');
    setContextFilter('all');
    setInterfaceFilters([]);
    setBillingFilter('all');
  };
  const hasFilters = Boolean(searchTerm || contextFilter !== 'all' || interfaceFilters.length || billingFilter !== 'all');
  const openRole = (role: RoleComparison, button: HTMLButtonElement) => {
    triggerRef.current = button;
    setSelectedRole(role);
    onRoleClick?.(role);
  };
  const roleButton = (role: RoleComparison) => (
    <Button variant="outline" onClick={event => openRole(role, event.currentTarget)} aria-label={`Подробнее о роли «${role.name}»`}>
      Подробнее <ArrowUpRightIcon className="ml-2 h-5 w-5" aria-hidden="true" />
    </Button>
  );
  const accessSummary = (role: RoleComparison) => role.has_all_permissions
    ? 'Все права доступа'
    : `${role.system_permissions_count + role.module_permissions_count} разрешений`;

  if (loading) return <div role="status" className="py-12 text-center text-muted-foreground">Загружаем роли…</div>;
  if (error) return (
    <div role="alert" className="space-y-4 border border-border bg-card p-6">
      <p className="font-medium">Не удалось загрузить роли</p>
      <p className="text-sm text-muted-foreground">Проверьте подключение и попробуйте ещё раз.</p>
      <Button variant="outline" onClick={() => setAttempt(value => value + 1)}>Попробовать снова</Button>
    </div>
  );

  return (
    <section className="space-y-6" aria-label="Сравнение ролей">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Какие возможности даёт роль</h2>
          <p className="mt-2 text-sm text-muted-foreground">Сравните доступ к разделам и оплате. Полный список разрешений — в подробностях роли.</p>
        </div>
        <p className="text-sm text-muted-foreground" role="status">Показано: {filteredRoles.length} из {roles.length}</p>
      </div>
      <div className="space-y-4 border-y border-border py-5">
        <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <label className="block space-y-2 text-sm font-medium">
            <span>Найти роль</span>
            <span className="relative block">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input type="search" value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Название или назначение" className="h-11 w-full rounded-sm border border-input bg-card pl-10 pr-3 font-normal" />
            </span>
          </label>
          <label className="block space-y-2 text-sm font-medium">
            <span>Область действия</span>
            <select value={contextFilter} onChange={event => setContextFilter(event.target.value)} className="h-11 w-full rounded-sm border border-input bg-card px-3 font-normal">
              <option value="all">Все области</option>
              <option value="system">Вся платформа</option>
              <option value="organization">Организация</option>
              <option value="project">Объект</option>
            </select>
          </label>
          <label className="block space-y-2 text-sm font-medium">
            <span>Оплата и подписка</span>
            <select value={billingFilter} onChange={event => setBillingFilter(event.target.value)} className="h-11 w-full rounded-sm border border-input bg-card px-3 font-normal">
              <option value="all">Любой доступ</option>
              <option value="yes">Есть доступ</option>
              <option value="no">Нет доступа</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <fieldset className="flex flex-wrap gap-x-5 gap-y-2">
            <legend className="sr-only">Доступные разделы</legend>
            {availableInterfaces.map(workspace => (
              <label key={workspace} className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" checked={interfaceFilters.includes(workspace)} onChange={() => setInterfaceFilters(values => values.includes(workspace) ? values.filter(value => value !== workspace) : [...values, workspace])} className="h-4 w-4 accent-primary" />
                {roleWorkspaceLabel(workspace)}
              </label>
            ))}
          </fieldset>
          {hasFilters && <Button variant="ghost" onClick={resetFilters}>Сбросить фильтры</Button>}
        </div>
      </div>
      {filteredRoles.length === 0 ? (
        <div className="space-y-3 py-10 text-center">
          <h3 className="text-lg font-medium">Роли не найдены</h3>
          <p className="text-sm text-muted-foreground">{hasFilters ? 'Измените условия поиска или сбросьте фильтры.' : 'Доступные роли пока не добавлены.'}</p>
        </div>
      ) : (
        <>
          <div className="hidden lg:block">
            <table className="w-full table-fixed border-collapse text-left text-sm">
              <caption className="sr-only">Роли сотрудников и доступ к возможностям МОСТ</caption>
              <thead className="border-b border-border text-muted-foreground">
                <tr><th scope="col" className="w-[34%] pb-3 pr-5 font-medium">Роль и назначение</th><th scope="col" className="w-[24%] pb-3 pr-5 font-medium">Доступные разделы</th><th scope="col" className="w-[25%] pb-3 pr-5 font-medium">Разрешения</th><th scope="col" className="w-[17%] pb-3 font-medium"><span className="sr-only">Подробности</span></th></tr>
              </thead>
              <tbody>
                {filteredRoles.map(role => (
                  <tr key={`${role.context_slug}:${role.slug}`} className="border-b border-border align-top">
                    <th scope="row" className="py-5 pr-5 font-normal"><span className="block text-base font-semibold">{role.name}</span><span className="mt-1 block text-muted-foreground">{role.description}</span><span className="mt-3 inline-block text-xs text-muted-foreground">{roleScopeLabel(role.context_slug)}</span></th>
                    <td className="py-5 pr-5"><ul className="space-y-2">{role.interfaces_slugs.map(workspace => <li key={workspace}>{roleWorkspaceLabel(workspace)}</li>)}</ul></td>
                    <td className="space-y-2 py-5 pr-5"><p>{accessSummary(role)}</p><p className="text-muted-foreground">Оплата и подписка: {role.billing_access ? 'доступны' : 'недоступны'}</p>{role.has_all_modules && <p className="text-muted-foreground">Все модули</p>}</td>
                    <td className="py-5 text-right">{roleButton(role)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-4 lg:hidden">
            {filteredRoles.map(role => (
              <article key={`${role.context_slug}:${role.slug}`} className="space-y-4 border border-border bg-card p-5">
                <div><h3 className="text-lg font-semibold">{role.name}</h3><p className="mt-2 text-sm text-muted-foreground">{role.description}</p></div>
                <dl className="space-y-3 text-sm">
                  <div><dt className="text-muted-foreground">Область действия</dt><dd>{roleScopeLabel(role.context_slug)}</dd></div>
                  <div><dt className="text-muted-foreground">Доступные разделы</dt><dd>{role.interfaces_slugs.map(roleWorkspaceLabel).join(', ') || 'Не указаны'}</dd></div>
                  <div><dt className="text-muted-foreground">Разрешения</dt><dd>{accessSummary(role)}{role.has_all_modules ? ' · Все модули' : ''}</dd></div>
                  <div><dt className="text-muted-foreground">Оплата и подписка</dt><dd>{role.billing_access ? 'Есть доступ' : 'Нет доступа'}</dd></div>
                </dl>
                {roleButton(role)}
              </article>
            ))}
          </div>
        </>
      )}
      <RoleDetailsModal isOpen={Boolean(selectedRole)} role={selectedRole} onClose={() => setSelectedRole(null)} returnFocusRef={triggerRef} />
    </section>
  );
};

export default RolesComparisonTable;
