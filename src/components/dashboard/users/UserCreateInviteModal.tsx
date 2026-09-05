import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useCustomRoles } from '@/hooks/useCustomRoles';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  canInvite?: boolean;
}

type Mode = 'invitation' | 'direct';

const UserCreateInviteModal: React.FC<Props> = ({ isOpen, onClose, onSave, canInvite = true }) => {
  const { roles, fetchRoles, sendInvitation, createUserWithCustomRoles, rolesError: systemRolesError } = useUserManagement();
  const { customRoles, fetchCustomRoles, error: customRolesError } = useCustomRoles();
  const [rolesPending, setRolesPending] = useState(true);
  const [rolesFailed, setRolesFailed] = useState(false);
  const [rolesRevision, setRolesRevision] = useState(0);
  const rolesUnavailable = rolesPending || rolesFailed || Boolean(systemRolesError || customRolesError);

  const [mode, setMode] = useState<Mode>(canInvite ? 'invitation' : 'direct');
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false);
  const [query, setQuery] = useState('');
  const [showEmailVerificationNotice, setShowEmailVerificationNotice] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    role_slugs: [] as string[],
    custom_role_ids: [] as number[],
    password: '',
    password_confirmation: '',
    send_credentials: true
  });

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setRolesPending(true);
    setRolesFailed(false);
    Promise.allSettled([fetchRoles(), fetchCustomRoles()]).then(results => {
      if (!active) return;
      setRolesFailed(results.some(result => result.status === 'rejected'));
      setRolesPending(false);
    });
    return () => { active = false; };
  }, [isOpen, fetchRoles, fetchCustomRoles, rolesRevision]);

  const systemRoles = useMemo(() => roles.filter((r: any) => r.is_system), [roles]);

  const filteredSystemRoles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return systemRoles;
    return systemRoles.filter((r: any) => r.name.toLowerCase().includes(q) || r.slug.toLowerCase().includes(q));
  }, [systemRoles, query]);

  const filteredCustomRoles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customRoles;
    return customRoles.filter((r: any) => r.name.toLowerCase().includes(q) || r.slug.toLowerCase().includes(q));
  }, [customRoles, query]);

  const toggleSystemRole = (slug: string) => {
    setForm(prev => ({
      ...prev,
      role_slugs: prev.role_slugs.includes(slug)
        ? prev.role_slugs.filter(s => s !== slug)
        : [...prev.role_slugs, slug]
    }));
  };

  const toggleCustomRole = (id: number) => {
    setForm(prev => ({
      ...prev,
      custom_role_ids: prev.custom_role_ids.includes(id)
        ? prev.custom_role_ids.filter(rid => rid !== id)
        : [...prev.custom_role_ids, id]
    }));
  };

  const submit = async () => {
    if (rolesUnavailable || showEmailVerificationNotice || submitting.current || (mode === 'invitation' && !canInvite)) return;
    submitting.current = true;
    setLoading(true);
    const normalizedEmail = form.email.trim().toLowerCase();

    try {
      if (mode === 'direct') {
        const response = await createUserWithCustomRoles({
          name: form.name,
          email: normalizedEmail,
          password: form.password,
          password_confirmation: form.password_confirmation,
          custom_role_ids: form.custom_role_ids,
          roles: form.role_slugs,
          send_credentials: form.send_credentials
        });
        
        // Проверяем статус верификации email
        if (response?.data?.user?.email_verified_at === null || response?.data?.user?.email_verified_at === undefined) {
          setShowEmailVerificationNotice(true);
        } else {
          onSave();
        }
      } else {
        await sendInvitation({
          name: form.name,
          email: normalizedEmail,
          role_slugs: form.role_slugs,
          custom_role_ids: form.custom_role_ids,
          metadata: {}
        });
        onSave();
      }
    } catch (error: any) {
      toast.error(error.message || 'Ошибка создания пользователя');
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  const close = () => {
    if (submitting.current) return;
    if (showEmailVerificationNotice) onSave();
    else onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => { if (!open) close(); }}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:rounded-md" onPointerDownOutside={event => event.preventDefault()} onEscapeKeyDown={event => { if (submitting.current) event.preventDefault(); }}>
        <DialogHeader className="border-b border-border px-5 py-5 pr-14 text-left sm:px-7">
          <DialogTitle>{mode === 'direct' ? 'Добавить сотрудника' : 'Пригласить сотрудника'}</DialogTitle>
          <DialogDescription>Укажите рабочую почту и выберите роли сотрудника в компании.</DialogDescription>
        </DialogHeader>
      <div className="min-h-0 space-y-5 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7">
        {showEmailVerificationNotice && (
          <div role="status" className="bg-secondary border border-border rounded-md p-4 flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-foreground mb-1">Сотрудник добавлен</h4>
              <p className="text-sm text-muted-foreground">
                Почта сотрудника пока не подтверждена. Повторно добавлять его не нужно.
              </p>
              <button
                onClick={() => {
                  setShowEmailVerificationNotice(false);
                  onSave();
                }}
                className="mt-3 text-sm font-medium text-foreground hover:text-foreground underline"
              >
                Понятно
              </button>
            </div>
          </div>
        )}

        <fieldset disabled={loading || showEmailVerificationNotice} className="min-w-0 space-y-5 disabled:opacity-60">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Способ добавления сотрудника">
          {canInvite && <Button
            variant={mode === 'invitation' ? 'secondary' : 'ghost'}
            aria-pressed={mode === 'invitation'}
            onClick={() => setMode('invitation')}
            disabled={!canInvite || loading}
            type="button"
          >
            Приглашение
          </Button>}
          <Button
            variant={mode === 'direct' ? 'secondary' : 'ghost'}
            aria-pressed={mode === 'direct'}
            onClick={() => setMode('direct')}
            disabled={loading}
            type="button"
          >
            Создать напрямую
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="employee-invite-name" className="block text-sm font-medium text-foreground mb-1">Имя *</label>
            <Input id="employee-invite-name" autoComplete="name" className="w-full" value={form.name} onChange={e => setForm(v => ({...v, name: e.target.value}))} />
          </div>
          <div>
            <label htmlFor="employee-invite-email" className="block text-sm font-medium text-foreground mb-1">Рабочая почта *</label>
            <Input id="employee-invite-email" type="email" autoComplete="email" className="w-full" value={form.email} onChange={e => setForm(v => ({...v, email: e.target.value}))} />
          </div>
        </div>

        {mode === 'direct' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="employee-invite-password" className="block text-sm font-medium text-foreground mb-1">Пароль *</label>
              <Input id="employee-invite-password" autoComplete="new-password" type="password" className="w-full" value={form.password} onChange={e => setForm(v => ({...v, password: e.target.value}))} />
            </div>
            <div>
              <label htmlFor="employee-invite-password-confirmation" className="block text-sm font-medium text-foreground mb-1">Повторите пароль *</label>
              <Input id="employee-invite-password-confirmation" autoComplete="new-password" type="password" className="w-full" value={form.password_confirmation} onChange={e => setForm(v => ({...v, password_confirmation: e.target.value}))} />
            </div>
            <label className="flex items-center gap-2 text-sm col-span-full">
              <input type="checkbox" checked={form.send_credentials} onChange={e => setForm(v => ({...v, send_credentials: e.target.checked}))} />
              Отправить данные для входа на email
            </label>
          </div>
        )}

        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-medium text-foreground">Роли</div>
            <Input
              aria-label="Поиск по ролям"
              placeholder="Поиск по ролям"
              className="w-full sm:w-64"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          {rolesPending ? <p role="status" className="text-sm text-muted-foreground">Загружаем роли…</p> : rolesUnavailable ? (
            <div className="space-y-3">
              <p role="alert">Не удалось загрузить роли. Повторите загрузку, чтобы выбрать доступ сотрудника.</p>
              <Button type="button" variant="outline" onClick={() => setRolesRevision(value => value + 1)}>Повторить загрузку ролей</Button>
            </div>
          ) : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-border rounded-md p-3">
              <div className="text-xs font-semibold text-muted-foreground mb-2">Готовые роли</div>
              <div className="space-y-1 max-h-44 overflow-y-auto">
                {filteredSystemRoles.map((r: any) => (
                  <label key={r.slug} className="flex items-start gap-2 text-sm">
                    <input type="checkbox" checked={form.role_slugs.includes(r.slug)} onChange={() => toggleSystemRole(r.slug)} />
                    <span>
                      <span className="block font-medium text-foreground">{r.name}</span>
                      {r.permission_preview?.length ? (
                        <span className="block text-xs text-muted-foreground">{r.permission_preview.slice(0, 3).join(', ')}</span>
                      ) : null}
                    </span>
                  </label>
                ))}
                {filteredSystemRoles.length === 0 && <div className="text-xs text-muted-foreground">Ничего не найдено</div>}
              </div>
            </div>
            <div className="border border-border rounded-md p-3">
              <div className="text-xs font-semibold text-muted-foreground mb-2">Роли компании</div>
              <div className="space-y-1 max-h-44 overflow-y-auto">
                {filteredCustomRoles.map((r: any) => (
                  <label key={r.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.custom_role_ids.includes(r.id)} onChange={() => toggleCustomRole(r.id)} />
                    <span>{r.name}</span>
                  </label>
                ))}
                {filteredCustomRoles.length === 0 && <div className="text-xs text-muted-foreground">Ничего не найдено</div>}
              </div>
            </div>
          </div>}
        </div>
        </fieldset>
      </div>
        <DialogFooter className="shrink-0 gap-2 border-t border-border px-5 py-4 sm:px-7">
          <Button variant="outline" onClick={close} disabled={loading}>{showEmailVerificationNotice ? 'Закрыть' : 'Отменить'}</Button>
          <Button onClick={showEmailVerificationNotice ? onSave : submit} disabled={loading || (!showEmailVerificationNotice && rolesUnavailable)}>
            {loading ? 'Сохранение…' : showEmailVerificationNotice ? 'Готово' : mode === 'direct' ? 'Создать' : 'Отправить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserCreateInviteModal;


