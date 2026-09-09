import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { organizationSession, type OrganizationChoice } from '../services/organizationSession';
import './OrganizationBoundary.css';

const choiceKey = 'most-organization-choice';
const OrganizationSwitchContext = createContext<(() => void) | null>(null);
export function OrganizationSwitchButton() {
  const open = useContext(OrganizationSwitchContext);
  return open ? <button className="most-org-switch" onClick={open}>Сменить организацию</button> : null;
}
export function resetOrganizationChoice(): void {
  try { sessionStorage.removeItem(choiceKey); } catch { }
}
function savedChoice(): string | null {
  try { return sessionStorage.getItem(choiceKey); } catch { return null; }
}
function saveChoice(userId: number, organizationId: number): void {
  try { sessionStorage.setItem(choiceKey, `${userId}:${organizationId}`); } catch { }
}

interface Props {
  user: { id: number; current_organization_id?: number | null } | null;
  ready: boolean;
  children: ReactNode;
  logout: () => Promise<void>;
  onSwitching?: (busy: boolean) => void;
}

export default function OrganizationBoundary({ user, ready, children, logout, onSwitching }: Props) {
  const [choices, setChoices] = useState<OrganizationChoice[] | null>(null);
  const [loadedUserId, setLoadedUserId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [choosing, setChoosing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState('');
  const [choice, setChoice] = useState(savedChoice);
  const userId = user?.id ?? null;
  const organizationId = user?.current_organization_id ?? null;

  useEffect(() => {
    if (!ready || !userId) return;
    let active = true;
    setChoices(null);
    setError('');
    void organizationSession.list().then((items) => {
      if (active) { setChoices(items); setLoadedUserId(userId); }
    }).catch(() => { if (active) setError('Не удалось загрузить организации. Повторите попытку.'); });
    return () => { active = false; };
  }, [ready, userId, retry]);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel('most-organization-session');
    const reload = () => window.location.reload();
    channel.addEventListener('message', reload);
    return () => { channel.removeEventListener('message', reload); channel.close(); };
  }, []);

  if (!user || !ready) return <>{children}</>;

  const loaded = choices !== null && loadedUserId === user.id;
  const requiresChoice = loaded && choices.length > 1 && choice !== `${user.id}:${organizationId}`;
  const select = async (organization: OrganizationChoice) => {
    if (busy) return;
    setBusy(true);
    setError('');
    onSwitching?.(true);
    try {
      if (organization.id !== organizationId) {
        await organizationSession.switch(organization.id);
        saveChoice(user.id, organization.id);
        if (typeof BroadcastChannel !== 'undefined') {
          const channel = new BroadcastChannel('most-organization-session');
          channel.postMessage({ type: 'changed' });
          channel.close();
        }
        window.location.assign('/dashboard');
        return;
      }
      saveChoice(user.id, organization.id);
      setChoice(`${user.id}:${organization.id}`);
      setChoosing(false);
      setQuery('');
    } catch {
      setError('Не удалось сменить организацию. Повторите попытку или войдите заново.');
    } finally {
      setBusy(false);
      onSwitching?.(false);
    }
  };

  if (!loaded || requiresChoice || choosing) {
    return (
      <main className="most-org-screen">
        <section className="most-org-card" aria-labelledby="most-org-heading">
          <span className="most-org-brand">МОСТ</span>
          <h1 id="most-org-heading">Выберите организацию</h1>
          <p>Продолжите работу в нужной организации. Позже ее можно будет сменить.</p>
          {error && <p role="alert" className="most-org-error">{error}</p>}
          {!loaded && !error && <p role="status">Загрузка организаций…</p>}
          {!loaded && error && <button onClick={() => setRetry((value) => value + 1)}>Повторить</button>}
          {loaded && <>
            {choices.length > 5 && <input aria-label="Поиск организации" placeholder="Название организации" value={query} onChange={(event) => setQuery(event.target.value)} />}
            <div className="most-org-options">
              {choices.filter((item) => item.name.toLocaleLowerCase('ru').includes(query.toLocaleLowerCase('ru'))).map((item) => (
                <button className="most-org-option" key={item.id} disabled={busy} onClick={() => void select(item)}>
                  <span>{item.name}</span><span>{item.id === organizationId ? 'Текущая' : 'Выбрать'}</span>
                </button>
              ))}
            </div>
            {choosing && !requiresChoice && <button disabled={busy} onClick={() => setChoosing(false)}>Отмена</button>}
          </>}
          <button className="most-org-logout" disabled={busy} onClick={() => void logout()}>Выйти из аккаунта</button>
        </section>
      </main>
    );
  }

  return <OrganizationSwitchContext.Provider value={choices.length > 1 ? () => setChoosing(true) : null}>
    {children}
  </OrganizationSwitchContext.Provider>;
}
