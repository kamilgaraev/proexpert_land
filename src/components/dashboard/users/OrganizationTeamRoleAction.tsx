import { useEffect, useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { changeOrganizationTeamRole, getOrganizationTeamRoleChoices, type OrganizationTeamRoleChoice } from '@/services/organizationTeamRoleService';
import type { OrganizationTeamMember } from '@/types/organization-team';

interface Props {
  member: OrganizationTeamMember;
  actorId: number;
  organizationId: number;
  canAssign: boolean;
  onChanged: () => void;
}
type Change = { role: OrganizationTeamRoleChoice; action: 'add' | 'remove' };
const roleKey = (role: { type: string; slug: string }) => `${role.type}:${role.slug}`;

export default function OrganizationTeamRoleAction(props: Props) {
  if (!props.canAssign || !props.organizationId) return null;
  return <RoleDialog key={`${props.actorId}:${props.organizationId}:${props.member.id}`} {...props} />;
}

function RoleDialog({ member, actorId, organizationId, onChanged }: Props) {
  const [open, setOpen] = useState(false);
  const [choices, setChoices] = useState<OrganizationTeamRoleChoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [revision, setRevision] = useState(0);
  const [change, setChange] = useState<Change | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [selfAcknowledged, setSelfAcknowledged] = useState(false);
  const request = useRef<AbortController | null>(null);
  const selfRemoval = actorId === member.id && change?.action === 'remove';
  const assigned = new Set(member.roles.map(roleKey));
  const available = choices.filter(role => !assigned.has(roleKey(role)));

  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setLoading(true);
    setChoices([]);
    setLoadError(false);
    setChange(null);
    setSelfAcknowledged(false);
    getOrganizationTeamRoleChoices(organizationId, controller.signal).then(roles => {
      if (!controller.signal.aborted) setChoices(roles);
    }).catch(() => {
      if (!controller.signal.aborted) setLoadError(true);
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [open, organizationId, revision]);

  function select(next: Change | null) {
    setChange(next);
    setError(null);
    setSelfAcknowledged(false);
  }

  async function confirm() {
    if (!change || loading || loadError || request.current || (selfRemoval && !selfAcknowledged)) return;
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    setError(null);
    let succeeded = false;
    try {
      await changeOrganizationTeamRole(member.id, change.role, change.action, controller.signal);
      succeeded = !controller.signal.aborted;
    } catch (failure: unknown) {
      if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'Не удалось изменить роль. Обновите список и проверьте роли сотрудника.');
    } finally {
      if (!controller.signal.aborted) {
        request.current = null;
        setPending(false);
      }
    }
    if (succeeded) {
      setOpen(false);
      setChange(null);
      onChanged();
    }
  }

  return (
    <Dialog open={open} onOpenChange={next => {
      if (request.current) return;
      setOpen(next);
      setChange(null);
      setError(null);
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2" aria-label={`Изменить роли: ${member.name}`}><ShieldCheck aria-hidden="true" className="h-5 w-5" />Изменить роли</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto rounded-md bg-card sm:rounded-md">
        <DialogHeader className="pr-6 text-left">
          <DialogTitle className="text-xl">Роли в компании</DialogTitle>
          <DialogDescription className="pt-2 leading-relaxed">{member.name}. Назначьте или снимите роль в этой компании. Права на отдельных объектах здесь не меняются.</DialogDescription>
        </DialogHeader>
        <div>
          <h3 className="mb-3 font-medium">Назначенные роли</h3>
          {member.roles.length === 0 ? <p className="text-sm text-muted-foreground">Роли компании не назначены.</p> : (
            <ul className="divide-y divide-border border-y border-border">
              {member.roles.map(role => {
                const editable = choices.find(choice => roleKey(choice) === roleKey(role));
                const selected = change?.action === 'remove' && roleKey(change.role) === roleKey(role);
                return (
                  <li key={roleKey(role)} className="flex items-center justify-between gap-3 py-3">
                    <span className="min-w-0 break-words text-sm">{role.name}</span>
                    {editable ? <Button variant="ghost" size="sm" disabled={loading || pending || loadError} aria-pressed={selected} aria-label={`Снять роль: ${role.name}`} onClick={() => select(selected ? null : { role: editable, action: 'remove' })}>{selected ? 'Выбрано для снятия' : 'Снять'}</Button> : <span className="text-xs text-muted-foreground">{role.slug === 'organization_owner' ? 'Владелец компании' : loading ? 'Проверяем…' : 'Недоступна для изменения'}</span>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {loading && <p role="status" className="text-sm text-muted-foreground">Загружаем доступные роли…</p>}
        {loadError && <div role="alert" className="space-y-3 text-sm"><p>Не удалось загрузить роли. Текущие назначения сохранены.</p><Button variant="outline" onClick={() => setRevision(value => value + 1)}>Повторить загрузку</Button></div>}
        {!loading && !loadError && <label className="space-y-2 text-sm"><span className="block font-medium">Добавить роль</span><select className="min-h-11 w-full rounded-md border border-input bg-background px-3" disabled={pending} value={change?.action === 'add' ? roleKey(change.role) : ''} onChange={event => {
          const role = available.find(item => roleKey(item) === event.target.value);
          select(role ? { role, action: 'add' } : null);
        }}><option value="">{available.length ? 'Выберите роль' : 'Других доступных ролей нет'}</option>{available.map(role => <option key={roleKey(role)} value={roleKey(role)}>{role.name}</option>)}</select></label>}
        {change && <div className="space-y-2 border-l-2 border-foreground/30 pl-4 text-sm"><p className="font-medium">{change.action === 'add' ? 'Будет назначена роль' : 'Будет снята роль'} «{change.role.name}»</p>{change.role.description && <p className="text-muted-foreground">{change.role.description}</p>}{change.role.preview.length > 0 && <ul className="list-disc space-y-1 pl-4 text-muted-foreground">{change.role.preview.map((permission, index) => <li key={`${permission}:${index}`}>{permission}</li>)}</ul>}<p className="text-muted-foreground">Остальные роли сохранятся.</p></div>}
        {selfRemoval && <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={selfAcknowledged} disabled={pending} onChange={event => setSelfAcknowledged(event.target.checked)} className="mt-1 h-4 w-4 accent-current" /><span>Понимаю, что снимаю свою роль и могу потерять доступ к разделам компании.</span></label>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <DialogFooter className="gap-2 sm:space-x-0"><Button variant="outline" disabled={pending} onClick={() => setOpen(false)}>Отмена</Button><Button disabled={!change || loading || loadError || pending || (selfRemoval && !selfAcknowledged)} onClick={confirm} className="bg-foreground text-background hover:bg-foreground/90">{pending ? 'Сохраняем…' : change?.action === 'remove' ? 'Снять роль' : 'Назначить роль'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
