import { useContext, useEffect, useRef, useState } from 'react';
import { Bell, LockKeyhole } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { notificationPreferencesService, type NotificationChannel, type NotificationPreference, type NotificationPreferences as Preferences } from '@/services/notificationPreferencesService';

const eventLabels: Record<string, { title: string; description: string }> = {
  transactional: { title: 'Платежи и подтверждения', description: 'Подтверждения операций и сообщения об оплате.' },
  system: { title: 'Рабочие события', description: 'Сроки, ограничения и события, требующие внимания.' },
  communication: { title: 'Общение с командой', description: 'Приглашения, комментарии и упоминания.' },
  marketing: { title: 'Новости МОСТ', description: 'Новости сервиса и рассылки.' },
  custom: { title: 'Другие уведомления', description: 'Дополнительные сообщения, настроенные в системе.' },
};

const channelGroups: { label: string; channels: NotificationChannel[] }[] = [
  { label: 'В кабинете', channels: ['in_app', 'websocket'] },
  { label: 'На почту', channels: ['email'] },
  { label: 'В Telegram', channels: ['telegram'] },
];

function PreferenceRow({ preference, available }: { preference: NotificationPreference; available: NotificationChannel[] }) {
  const [selected, setSelected] = useState(preference.enabled_channels);
  const [saved, setSaved] = useState(preference.enabled_channels);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<'idle' | 'saved' | 'error'>('idle');
  const pending = useRef(false);
  const editable = !preference.mandatory && preference.user_customizable;
  const dirty = selected.length !== saved.length || selected.some((channel) => !saved.includes(channel));
  const labels = eventLabels[preference.notification_type] ?? { title: preference.name, description: preference.description };

  const save = async () => {
    if (pending.current || !editable || !dirty) return;
    pending.current = true;
    setSaving(true);
    setResult('idle');
    try {
      await notificationPreferencesService.save(preference.notification_type, selected);
      setSaved(selected);
      setResult('saved');
    } catch {
      setResult('error');
    } finally {
      pending.current = false;
      setSaving(false);
    }
  };

  return (
    <fieldset className="min-w-0 border-t border-border py-5" disabled={!editable || saving}>
      <legend className="sr-only">{labels.title}</legend>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,1fr)]">
        <div>
          <h3 className="text-base font-semibold">{labels.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{labels.description}</p>
          {!editable && <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><LockKeyhole className="h-4 w-4" aria-hidden="true" />Обязательные сообщения</p>}
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            {channelGroups.map((group) => {
              const channels = group.channels.filter((channel) => available.includes(channel));
              if (channels.length === 0) return null;
              return (
                <label key={group.label} className="flex min-h-11 items-center gap-2 text-sm">
                  <input type="checkbox" className="h-4 w-4 accent-primary" checked={channels.some((channel) => selected.includes(channel))} onChange={(event) => {
                    const checked = event.target.checked;
                    setSelected((current) => checked ? [...new Set([...current, ...channels])] : current.filter((channel) => !channels.includes(channel)));
                    setResult('idle');
                  }} />
                  {group.label}
                </label>
              );
            })}
          </div>
          {editable && <Button variant="outline" size="sm" disabled={!dirty || saving} onClick={() => void save()}>{saving ? 'Сохраняем…' : 'Сохранить'}</Button>}
          {result === 'saved' && <p role="status" className="text-sm text-muted-foreground">Настройки сохранены.</p>}
          {result === 'error' && <p role="alert" className="text-sm text-destructive">Не удалось сохранить. Ваш выбор сохранён на экране — попробуйте ещё раз.</p>}
        </div>
      </div>
    </fieldset>
  );
}

function PreferencesForm() {
  const [data, setData] = useState<Preferences | null>(null);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setError(false);
    notificationPreferencesService.load(controller.signal).then((result) => {
      if (!controller.signal.aborted) setData(result);
    }).catch(() => {
      if (!controller.signal.aborted) setError(true);
    });
    return () => controller.abort();
  }, [revision]);

  return (
    <section aria-labelledby="notification-preferences-title" className="border border-border bg-card p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <Bell className="mt-1 h-6 w-6 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div>
          <h2 id="notification-preferences-title" className="text-xl font-semibold">Как получать уведомления</h2>
          <p className="mt-2 text-sm text-muted-foreground">Выберите каналы для своего аккаунта в текущей организации. Обязательные сообщения отключить нельзя.</p>
        </div>
      </div>
      {error ? <div className="space-y-3"><p role="alert">Не удалось загрузить настройки уведомлений.</p><Button variant="outline" onClick={() => setRevision((value) => value + 1)}>Повторить загрузку</Button></div>
        : data ? <>
          {data.items.length === 0 && <p className="text-sm text-muted-foreground">Настройки уведомлений пока недоступны.</p>}
          {data.items.map((preference) => <PreferenceRow key={preference.notification_type} preference={preference} available={data.available_channels} />)}
          {data.available_channels.includes('telegram') && <p className="text-sm text-muted-foreground">Для доставки в Telegram нужен подключённый аккаунт Telegram.</p>}
        </> : <p role="status" className="text-sm text-muted-foreground">Загружаем настройки…</p>}
    </section>
  );
}

export function NotificationPreferences() {
  const { user } = useContext(AuthContext);
  return <PreferencesForm key={`${user?.id}:${user?.current_organization_id}`} />;
}
