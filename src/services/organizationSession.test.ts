import { afterEach, describe, expect, it, vi } from 'vitest';
import { authApi } from '../utils/api';
import { organizationSession } from './organizationSession';
import { clearAuthToken, clearCsrfToken, getAuthToken, getCsrfToken, saveAuthToken, saveCsrfToken } from '../utils/authTokenStorage';

afterEach(() => { clearAuthToken(); clearCsrfToken(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('organization auth operation', () => {
  it('keeps refresh and switch in one lock and stores the returned credential pair', async () => {
    const request = vi.fn(async (_name: string, operation: () => Promise<unknown>) => operation());
    vi.stubGlobal('navigator', { locks: { request } });
    saveAuthToken('initial-token');
    saveCsrfToken('stale-csrf');
    vi.spyOn(authApi, 'get').mockResolvedValue({ data: { csrf_token: 'current-csrf' } } as never);
    const post = vi.spyOn(authApi, 'post').mockResolvedValueOnce({ data: { token: 'fresh-access', csrf_token: 'fresh-csrf' } } as never)
      .mockResolvedValueOnce({ data: { data: { token: 'organization-access', csrf_token: 'organization-csrf' } } } as never);
    await organizationSession.switch(7);
    expect(request).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenLastCalledWith('/auth/organization', { organization_id: 7 },
      { headers: { Authorization: 'Bearer fresh-access', 'X-CSRF-Token': 'fresh-csrf' } });
    expect(getAuthToken()).toBe('organization-access');
    expect(getCsrfToken()).toBe('organization-csrf');
  });
});
