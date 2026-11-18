import { useEffect, useState } from 'react';
import { holdingSiteBuilderService } from '@/services/holdingSiteBuilderService';
import type { SiteCrmSettings, SiteWorkType } from '@/types/holding-site-builder';

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900';
const message = (error: unknown) => error instanceof Error ? error.message : 'Не удалось загрузить данные.';

export default function SiteCrmSettingsPanel() {
  const [settings, setSettings] = useState<SiteCrmSettings | null>(null);
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [picked, setPicked] = useState<number[]>([]);
  const [types, setTypes] = useState<SiteWorkType[]>([]);
  const [typesReady, setTypesReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let current = true;
    void holdingSiteBuilderService.getCrmSettings().then(result => {
      if (!current) return;
      setSettings(result);
      setOrganizationId(result.organization_id);
      setPicked(result.work_type_ids);
    }).catch(error => {
      if (current) setError(message(error));
    });
    return () => { current = false; };
  }, []);

  useEffect(() => {
    let current = true;
    if (organizationId !== null) {
      void holdingSiteBuilderService.getCrmWorkTypes(organizationId).then(result => {
        if (current) { setTypes(result); setTypesReady(true); }
      }).catch(error => {
        if (current) setError(message(error));
      });
    }
    return () => { current = false; };
  }, [organizationId]);

  const save = async () => {
    if (!settings || busy || (organizationId !== null && (!typesReady || picked.length === 0))) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await holdingSiteBuilderService.saveCrmSettings({
        organization_id: organizationId,
        work_type_ids: organizationId === null ? [] : picked,
      });
      setSettings(result);
      setPicked(result.work_type_ids);
      setNotice('Настройки сохранены.');
    } catch (error) {
      setError(message(error));
    } finally {
      setBusy(false);
    }
  };

  const eligibleIds = new Set(types.map(item => item.id));
  const validPick = picked.length > 0 && picked.every(id => eligibleIds.has(id));

  return (
    <div className="space-y-3 border-t border-slate-200 pt-5">
      <h3 className="text-sm font-semibold text-slate-900">Приём заявок на услуги</h3>
      {error && <p className="text-sm text-rose-700" role="alert">{error}</p>}
      {notice && <p className="text-sm text-emerald-700" role="status">{notice}</p>}
      {!settings && !error && <p className="text-sm text-slate-500">Загрузка настроек…</p>}
      {settings && <>
        <p className="text-xs leading-relaxed text-slate-600">
          Опубликованный блок «Форма заявки» будет передавать заявки в CRM выбранной компании. На сайте появятся только отмеченные виды работ.
        </p>
        <label className="grid gap-1.5 text-sm text-slate-800">
          Организация-получатель
          <select className={inputClass} value={organizationId ?? ''} disabled={busy} onChange={event => {
            setOrganizationId(event.target.value ? Number(event.target.value) : null);
            setPicked([]);
            setTypes([]);
            setTypesReady(false);
            setError('');
            setNotice('');
          }}>
            <option value="">Без передачи в CRM</option>
            {organizationId !== null && !settings.organizations.some(item => item.id === organizationId) && (
              <option value={organizationId} disabled>Текущий получатель недоступен</option>
            )}
            {settings.organizations.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        {organizationId !== null && typesReady && <>
          <fieldset className="max-h-44 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-3" disabled={busy}>
            <legend className="px-1 text-xs font-semibold text-slate-700">Виды работ на сайте</legend>
            {types.map(item => <label key={item.id} className="flex items-start gap-2 py-1 text-sm text-slate-800">
              <input type="checkbox" className="mt-1" checked={picked.includes(item.id)} onChange={event => {
                const checked = event.target.checked;
                setPicked(previous => checked ? [...previous, item.id] : previous.filter(id => id !== item.id));
              }} />
              {item.name}
            </label>)}
            {types.length === 0 && <p className="text-xs text-slate-600">В справочнике компании пока нет активных видов работ.</p>}
          </fieldset>
          {picked.some(id => !eligibleIds.has(id)) && <button type="button" className="text-sm text-slate-700 underline" onClick={() => setPicked(picked.filter(id => eligibleIds.has(id)))}>Убрать недоступные виды работ</button>}
        </>}
        <button type="button" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={busy || (organizationId !== null && (!typesReady || !validPick))} onClick={() => void save()}>
          {busy ? 'Сохранение…' : 'Сохранить настройки заявок'}
        </button>
      </>}
    </div>
  );
}
