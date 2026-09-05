import { useEffect, useRef, useState } from 'react';
import { Monitor, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { securitySessionService, type SecuritySession } from '@/services/securitySessionService';

const lastSeen = (value: string | null): string => {
  if (!value) return 'Время входа не указано';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Время входа не указано'
    : `Последняя активность: ${new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(date)}`;
};

export function SecuritySessions() {
  const [sessions, setSessions] = useState<SecuritySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<SecuritySession | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [notice, setNotice] = useState('');
  const pending = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError(false);
    securitySessionService.list(controller.signal).then((data) => {
      if (!controller.signal.aborted) setSessions(data);
    }).catch(() => {
      if (!controller.signal.aborted) setLoadError(true);
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [revision]);

  const revoke = async () => {
    if (!selected || selected.is_current || selected.status !== 'active' || pending.current) return;
    pending.current = true;
    setSaving(true);
    setSaveError(false);
    try {
      await securitySessionService.revoke(selected.id);
      if (!mounted.current) return;
      setSessions((items) => items.map((item) => item.id === selected.id ? { ...item, status: 'revoked' } : item));
      setSelected(null);
      setNotice('Вход на выбранном устройстве завершён.');
    } catch {
      if (mounted.current) setSaveError(true);
    } finally {
      pending.current = false;
      if (mounted.current) setSaving(false);
    }
  };

  return (
    <section aria-labelledby="security-sessions-title" className="space-y-4 border-t border-border pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="security-sessions-title" className="text-xl font-semibold">Устройства и входы</h2>
          <p className="mt-1 text-sm text-muted-foreground">Завершите вход на устройстве, которым больше не пользуетесь.</p>
        </div>
        <Button variant="outline" disabled={loading || saving} onClick={() => { setNotice(''); setRevision((value) => value + 1); }}>
          <RefreshCw className="mr-2 h-5 w-5" aria-hidden="true" />Обновить
        </Button>
      </div>
      {notice && <p role="status" className="text-sm">{notice}</p>}
      {loading ? <p role="status" className="py-6 text-muted-foreground">Загружаем устройства…</p> : loadError ? (
        <div role="alert" className="space-y-3 border border-border p-4">
          <p>Не удалось загрузить устройства. Проверьте подключение и повторите попытку.</p>
          <Button variant="outline" onClick={() => setRevision((value) => value + 1)}>Повторить</Button>
        </div>
      ) : sessions.length === 0 ? <p className="py-6 text-muted-foreground">Сведения о входах пока отсутствуют.</p> : (
        <ul className="divide-y divide-border border-y border-border">
          {sessions.map((session) => (
            <li key={session.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div className="flex min-w-0 flex-1 gap-3">
                <Monitor className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="min-w-0 space-y-1 break-words">
                  <p className="font-medium">{session.device_name || 'Устройство не определено'}</p>
                  <p className="text-sm text-muted-foreground">{lastSeen(session.last_seen_at)}</p>
                  {(session.ip_city || session.ip_country) && <p className="text-sm text-muted-foreground">{[session.ip_city, session.ip_country].filter(Boolean).join(', ')}</p>}
                  {session.is_current ? <p className="text-sm font-medium">Это устройство</p> : session.status !== 'active' && <p className="text-sm text-muted-foreground">{session.status === 'revoked' ? 'Вход завершён' : session.status === 'expired' ? 'Срок входа истёк' : 'Состояние не определено'}</p>}
                </div>
              </div>
              {!session.is_current && session.status === 'active' && <Button variant="outline" onClick={() => { setSaveError(false); setSelected(session); }}>Завершить вход<span className="sr-only">: {session.device_name || 'устройство'}</span></Button>}
            </li>
          ))}
        </ul>
      )}
      <Dialog open={selected !== null} onOpenChange={(open) => { if (!open && !pending.current) setSelected(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Завершить вход?</DialogTitle>
            <DialogDescription>На устройстве «{selected?.device_name || 'Устройство не определено'}» потребуется снова войти в МОСТ. Этот вход останется активным.</DialogDescription>
          </DialogHeader>
          {saveError && <p role="alert" className="text-sm">Не удалось завершить вход. Попробуйте ещё раз.</p>}
          <DialogFooter className="gap-2">
            <Button variant="outline" disabled={saving} onClick={() => setSelected(null)}>Отмена</Button>
            <Button disabled={saving} onClick={revoke}>{saving ? 'Завершаем…' : 'Завершить вход'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
