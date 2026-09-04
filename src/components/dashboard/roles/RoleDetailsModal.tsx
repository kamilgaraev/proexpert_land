import React from 'react';
import type { RoleComparison } from '@utils/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { roleScheduleLabel, roleScopeLabel, roleWorkspaceLabel } from './rolePresentation';

interface RoleDetailsModalProps {
  isOpen: boolean;
  role: RoleComparison | null;
  onClose: () => void;
  returnFocusRef?: React.RefObject<HTMLButtonElement | null>;
}

const RoleDetailsModal: React.FC<RoleDetailsModalProps> = ({ isOpen, role, onClose, returnFocusRef }) => (
  <Dialog open={isOpen && Boolean(role)} onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="most-workspace max-h-[90dvh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto" onCloseAutoFocus={event => {
      if (returnFocusRef?.current) {
        event.preventDefault();
        returnFocusRef.current.focus();
      }
    }}>
      {role && <>
        <DialogHeader className="pr-8 text-left">
          <DialogTitle className="text-2xl leading-tight">{role.name}</DialogTitle>
          <DialogDescription className="pt-2 leading-relaxed">{role.description}</DialogDescription>
        </DialogHeader>
        <dl className="grid gap-5 border-y border-border py-5 text-sm sm:grid-cols-2">
          <div><dt className="mb-1 text-muted-foreground">Область действия</dt><dd>{roleScopeLabel(role.context_slug)}</dd></div>
          <div><dt className="mb-1 text-muted-foreground">Оплата и подписка</dt><dd>{role.billing_access ? 'Есть доступ' : 'Нет доступа'}</dd></div>
          <div><dt className="mb-1 text-muted-foreground">Доступные разделы</dt><dd>{role.interfaces_slugs.map(roleWorkspaceLabel).join(', ') || 'Не указаны'}</dd></div>
          <div><dt className="mb-1 text-muted-foreground">Время доступа</dt><dd>{roleScheduleLabel(role.time_restrictions)}</dd></div>
        </dl>
        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Управление ролями сотрудников</h3>
          <p className="text-sm">{role.can_manage_roles.length ? role.can_manage_roles.join(', ') : 'Назначение и изменение ролей недоступно.'}</p>
          {role.cannot_manage_roles.length > 0 && <p className="text-sm text-muted-foreground">Нельзя управлять ролями: {role.cannot_manage_roles.join(', ')}.</p>}
        </section>
        <section className="space-y-4 border-t border-border pt-5">
          <h3 className="text-lg font-semibold">Права доступа</h3>
          {role.has_all_permissions ? <p className="text-sm">Доступны все разрешения.</p> : <>
            <p className="text-sm text-muted-foreground">Всего разрешений: {role.system_permissions_count + role.module_permissions_count}</p>
            {(role.permission_groups || []).length > 0 ? role.permission_groups!.map(group => (
              <details key={group.slug} className="border-b border-border pb-3">
                <summary className="cursor-pointer py-2 text-sm font-medium">{group.name} <span className="ml-2 font-normal text-muted-foreground">{group.permissions.length}</span></summary>
                <ul className="space-y-2 py-2 pl-5 text-sm text-muted-foreground">{group.permissions.map(permission => <li key={permission.slug}>{permission.name}</li>)}</ul>
              </details>
            )) : <p className="text-sm text-muted-foreground">Подробный список разрешений не предоставлен.</p>}
          </>}
          {role.has_all_modules && <p className="text-sm">Доступны все модули.</p>}
        </section>
        <div className="flex justify-end border-t border-border pt-4"><Button variant="outline" onClick={onClose}>Закрыть</Button></div>
      </>}
    </DialogContent>
  </Dialog>
);

export default RoleDetailsModal;
