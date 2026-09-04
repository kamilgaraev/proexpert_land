import { useEffect, useRef, useState } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { setOrganizationTeamAccess } from '@/services/organizationTeamService';
import type { OrganizationTeamMember } from '@/types/organization-team';

interface Props {
  member: OrganizationTeamMember;
  actorId: number;
  scope: string | null;
  canManage: boolean;
  onChanged: () => void;
}

export default function OrganizationTeamAccessAction(props: Props) {
  if (!props.scope || !props.canManage || props.actorId === props.member.id
    || props.member.roles.some(role => role.slug === 'organization_owner')) return null;

  return <AccessDialog key={`${props.scope}:${props.member.id}:${props.member.is_active}`} {...props} />;
}

function AccessDialog({ member, onChanged }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);
  const enable = !member.is_active;

  useEffect(() => () => request.current?.abort(), []);

  async function confirm() {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    setError(null);
    let succeeded = false;
    try {
      await setOrganizationTeamAccess(member.id, enable, controller.signal);
      succeeded = !controller.signal.aborted;
    } catch (failure: unknown) {
      if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'Не удалось изменить доступ. Попробуйте ещё раз.');
    } finally {
      if (!controller.signal.aborted) {
        request.current = null;
        setPending(false);
      }
    }
    if (succeeded) {
      setOpen(false);
      setNotice(enable ? 'Доступ к компании открыт.' : 'Доступ к компании отключён.');
      onChanged();
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={next => {
        if (pending) return;
        setOpen(next);
        setError(null);
      }}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2" aria-label={`${enable ? 'Открыть' : 'Отключить'} доступ: ${member.name}`}>
            {enable ? <ShieldCheck aria-hidden="true" className="h-5 w-5" /> : <LockKeyhole aria-hidden="true" className="h-5 w-5" />}
            {enable ? 'Открыть доступ' : 'Отключить доступ'}
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[calc(100%-2rem)] rounded-md border-border bg-card sm:rounded-md">
          <DialogHeader className="pr-6 text-left">
            <DialogTitle className="text-xl leading-snug">{enable ? 'Открыть доступ к компании?' : 'Отключить доступ к компании?'}</DialogTitle>
            <DialogDescription className="pt-2 leading-relaxed">
              {enable ? 'Сотрудник снова сможет работать в этой компании с назначенными ему правами.' : 'Сотрудник потеряет доступ к этой компании. Его работа в других компаниях и сохранённые документы останутся без изменений.'}
            </DialogDescription>
          </DialogHeader>
          <div className="min-w-0 border-y border-border py-4">
            <p className="break-words font-medium">{member.name}</p>
            <p className="mt-1 break-all text-sm text-muted-foreground">{member.email}</p>
          </div>
          {error && <p role="alert" className="text-sm leading-relaxed text-destructive">{error}</p>}
          <DialogFooter className="gap-2 sm:space-x-0">
            <Button variant="outline" disabled={pending} onClick={() => setOpen(false)}>Отмена</Button>
            <Button disabled={pending} onClick={confirm} className="bg-foreground text-background hover:bg-foreground/90">
              {pending ? 'Сохраняем…' : enable ? 'Открыть доступ' : 'Отключить доступ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {notice && <p role="status" className="text-sm text-muted-foreground">{notice}</p>}
    </>
  );
}
