import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check, Mail, RefreshCw, Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrganizationTeam } from '@/hooks/useOrganizationTeam';
import type { OrganizationTeamMember } from '@/types/organization-team';

interface Props {
  scope: string | null;
  canManage: boolean;
  renderActions: (member: OrganizationTeamMember, refresh: () => void) => ReactNode;
}

export default function OrganizationTeamDirectory({ scope, canManage, renderActions }: Props) {
  const team = useOrganizationTeam(scope, canManage);

  if (!canManage) {
    return <p className="py-8 text-muted-foreground">Для просмотра команды нужен доступ к управлению сотрудниками.</p>;
  }

  return (
    <section aria-label="Сотрудники компании" aria-busy={team.loading} className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:max-w-md">
          <label htmlFor="organization-team-search" className="mb-2 block text-sm font-medium">Найти сотрудника</label>
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input id="organization-team-search" type="search" value={team.search} onChange={event => team.setSearch(event.target.value)} maxLength={200} placeholder="Имя или почта" className="min-h-11 w-full rounded-md border border-input bg-card py-2 pl-11 pr-3 text-foreground placeholder:text-muted-foreground" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
          <span aria-live="polite">{team.meta ? `${team.search.trim() ? 'Найдено' : 'Всего сотрудников'}: ${team.meta.total}` : team.loading ? 'Загружаем…' : ''}</span>
          <Button variant="outline" onClick={team.refresh} disabled={team.loading}><RefreshCw aria-hidden="true" className="mr-2 h-4 w-4" />Обновить</Button>
        </div>
      </div>
      {team.error ? (
        <div role="alert" className="rounded-md border border-border bg-card p-6">
          <h3 className="font-semibold">Не удалось показать команду</h3>
          <p className="mt-2 text-muted-foreground">{team.error}</p>
          <Button className="mt-4" variant="outline" onClick={team.refresh}>Повторить загрузку</Button>
        </div>
      ) : team.loading ? (
        <div role="status" className="flex min-h-48 items-center justify-center gap-3 text-muted-foreground">
          <RefreshCw aria-hidden="true" className="h-5 w-5 animate-spin motion-reduce:animate-none" />Загружаем сотрудников…
        </div>
      ) : team.meta && team.members.length === 0 ? (
        <div className="rounded-md border border-border bg-card px-6 py-10">
          <Users aria-hidden="true" className="mb-4 h-8 w-8 text-muted-foreground" />
          <h3 className="text-lg font-semibold">{team.search.trim() ? 'Сотрудники не найдены' : 'В команде пока нет сотрудников'}</h3>
          <p className="mt-2 text-muted-foreground">{team.search.trim() ? 'Проверьте имя или адрес почты либо сбросьте поиск.' : 'Пригласите сотрудника, чтобы работать с объектами вместе.'}</p>
          {team.search && <Button variant="outline" className="mt-4" onClick={() => team.setSearch('')}>Сбросить поиск</Button>}
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border bg-card">
          {team.members.map(member => (
            <li key={member.id} className="min-w-0 p-4 sm:p-6">
              <article aria-label={member.name} className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="min-w-0">
                  <h3 className="break-words text-lg font-semibold">{member.name}</h3>
                  <p className="mt-2 flex min-w-0 items-start gap-2 text-sm text-muted-foreground"><Mail aria-hidden="true" className="h-5 w-5 shrink-0" /><span className="min-w-0 break-all">{member.email}</span></p>
                  <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>{member.is_active ? 'Доступ открыт' : 'Доступ отключён'}</span>
                    <span className="inline-flex items-center gap-1">{member.email_verified_at && <Check aria-hidden="true" className="h-4 w-4" />}{member.email_verified_at ? 'Почта подтверждена' : 'Почта не подтверждена'}</span>
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="mb-2 text-sm text-muted-foreground">Роли в компании</p>
                  <p className="break-words text-sm">{member.roles.map(role => role.name).join(' · ') || 'Роли компании не назначены'}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 lg:col-span-2">{renderActions(member, team.refresh)}</div>
              </article>
            </li>
          ))}
        </ul>
      )}
      {team.meta && team.meta.last_page > 1 && (
        <nav aria-label="Страницы списка сотрудников" className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <Button variant="outline" disabled={team.page <= 1} onClick={() => team.setPage(team.page - 1)}><ArrowLeft aria-hidden="true" className="mr-2 h-4 w-4" />Назад</Button>
          <p className="text-sm text-muted-foreground">Страница {team.meta.current_page} из {team.meta.last_page}</p>
          <Button variant="outline" disabled={team.page >= team.meta.last_page} onClick={() => team.setPage(team.page + 1)}>Далее<ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" /></Button>
        </nav>
      )}
    </section>
  );
}
