const RETURN_TO_INVITATION_KEY = 'most.project-participant-invitation-return';
const RETURN_PATH_TTL_MS = 2 * 60 * 60 * 1000;

export const getProjectParticipantInvitationPath = (token: string): string => (
  `/project-invitations/${encodeURIComponent(token)}`
);

export const getSafeProjectInvitationReturnPath = (value: unknown): string | null => {
  if (typeof value !== 'string' || !value.startsWith('/project-invitations/')) return null;
  if (value.startsWith('//') || value.includes('\\')) return null;

  try {
    const parsed = new URL(value, 'https://most.invalid');
    if (parsed.origin !== 'https://most.invalid' || !/^\/project-invitations\/[^/]+$/.test(parsed.pathname)) return null;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
};

export const storeProjectInvitationReturnPath = (value: unknown): string | null => {
  const safePath = getSafeProjectInvitationReturnPath(value);
  if (!safePath || typeof window === 'undefined') return null;

  try {
    window.sessionStorage.setItem(RETURN_TO_INVITATION_KEY, JSON.stringify({ path: safePath, storedAt: Date.now() }));
    return safePath;
  } catch {
    return safePath;
  }
};

export const readProjectInvitationReturnPath = (): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    const storedValue = window.sessionStorage.getItem(RETURN_TO_INVITATION_KEY);
    if (!storedValue) return null;
    const record = JSON.parse(storedValue) as { path?: unknown; storedAt?: unknown };
    if (typeof record.storedAt !== 'number' || Date.now() - record.storedAt > RETURN_PATH_TTL_MS) {
      window.sessionStorage.removeItem(RETURN_TO_INVITATION_KEY);
      return null;
    }
    return getSafeProjectInvitationReturnPath(record.path);
  } catch {
    return null;
  }
};

export const clearProjectInvitationReturnPath = (): void => {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(RETURN_TO_INVITATION_KEY);
  } catch {
    return;
  }
};
