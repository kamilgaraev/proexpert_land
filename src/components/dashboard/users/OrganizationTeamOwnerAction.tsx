import { useEffect, useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { grantOrganizationTeamOwner } from '@/services/organizationTeamService';
import type { OrganizationTeamMember } from '@/types/organization-team';

interface Props {
  member: OrganizationTeamMember;
  actorId: number;
  scope: string | null;
  canGrant: boolean;
  onChanged: () => void;
}

export default function OrganizationTeamOwnerAction(props: Props) {
  if (!props.scope || !props.canGrant || props.actorId === props.member.id || !props.member.is_active
    || props.member.roles.some(role => role.slug === 'organization_owner')) return null;
  return <OwnerDialog key={`${props.scope}:${props.member.id}`} {...props} />;
}

function OwnerDialog({ member, onChanged }: Props) {
  const [open, setOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [pending, setPending] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);

  async function confirm() {
    if (!acknowledged || request.current || completed) return;
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    setError(null);
    let succeeded = false;
    try {
      await grantOrganizationTeamOwner(member.id, controller.signal);
      succeeded = !controller.signal.aborted;
    } catch (failure: unknown) {
      if (!controller.signal.aborted) {
        setError(failure instanceof Error ? failure.message : 'Не удалось назначить владельца. Обновите список и проверьте его роль.');
        setAcknowledged(false);
      }
    } finally {
      if (!controller.signal.aborted) {
        request.current = null;
        setPending(false);
      }
    }
    if (succeeded) {
      setOpen(false);
      setCompleted(true);
      onChanged();
    }
  }

  if (completed) return <p role="status" className="text-sm text-muted-foreground">Сотрудник назначен владельцем компании.</p>;

  return (
    <Dialog open={open} onOpenChange={next => {
      if (request.current) return;
      setOpen(next);
      setAcknowledged(false);
      setError(null);
    }}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="gap-2" aria-label={`Назначить владельцем: ${member.name}`}>
          <ShieldCheck aria-hidden="true" className="h-5 w-5" />Назначить владельцем
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] rounded-md border-border bg-card sm:rounded-md">
        <DialogHeader className="pr-6 text-left">
          <DialogTitle className="text-xl leading-snug">Добавить владельца компании?</DialogTitle>
          <DialogDescription className="pt-2 leading-relaxed">
            Сотрудник получит полный доступ к компании, её объектам, команде и настройкам. Вы сохраните свои права владельца.
          </DialogDescription>
        </DialogHeader>
        <div className="min-w-0 border-y border-border py-4">
          <p className="break-words font-medium">{member.name}</p>
          <p className="mt-1 break-all text-sm text-muted-foreground">{member.email}</p>
        </div>
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
          <input type="checkbox" checked={acknowledged} disabled={pending} onChange={event => setAcknowledged(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-current" />
          <span>Подтверждаю полный доступ этого сотрудника к компании, включая управление доступом других сотрудников.</span>
        </label>
        {error && <p role="alert" className="text-sm leading-relaxed text-destructive">{error}</p>}
        <DialogFooter className="gap-2 sm:space-x-0">
          <Button variant="outline" disabled={pending} onClick={() => setOpen(false)}>Отмена</Button>
          <Button disabled={!acknowledged || pending} onClick={confirm} className="bg-foreground text-background hover:bg-foreground/90">
            {pending ? 'Назначаем…' : 'Назначить владельцем'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
