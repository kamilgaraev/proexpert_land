// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  attachAuthorizationHeader,
  clearAuthToken,
  clearAuthTokenIfCurrent,
  clearCsrfToken,
  getAuthToken,
  getAuthTokenPersistence,
  getCsrfToken,
  invalidateAuthSession,
  saveAuthToken,
  saveCsrfToken,
  subscribeAuthSessionInvalidation,
} from './authTokenStorage';

afterEach(() => {
  clearAuthToken();
  clearCsrfToken();
  vi.unstubAllGlobals();
});

describe('authTokenStorage', () => {
  it('принимает logout только для текущей сессии и не передаёт credentials', async () => {
    let receive!: (event: MessageEvent) => void;
    const postMessage = vi.fn();
    vi.stubGlobal('BroadcastChannel', class {
      postMessage = postMessage;
      addEventListener(_type: string, listener: (event: MessageEvent) => void) { receive = listener; }
    });
    vi.resetModules();
    const storage = await import('./authTokenStorage');
    const token = `header.${btoa(JSON.stringify({ session_uuid: 'current-session' }))}.signature`;
    storage.saveAuthToken(token);
    storage.saveCsrfToken('private-csrf');
    const listener = vi.fn();
    const unsubscribe = storage.subscribeAuthSessionInvalidation(listener);
    receive(new MessageEvent('message', { data: { type: 'logout', sessionId: 'previous-session' } }));
    receive(new MessageEvent('message', { data: { type: 'logout' } }));
    expect(storage.getAuthToken()).toBe(token);
    expect(listener).not.toHaveBeenCalled();
    storage.invalidateAuthSession(true);
    expect(postMessage).toHaveBeenCalledWith({ type: 'logout', sessionId: 'current-session' });
    storage.saveAuthToken(token);
    storage.saveCsrfToken('private-csrf');
    receive(new MessageEvent('message', { data: { type: 'logout', sessionId: 'current-session' } }));
    expect(storage.getAuthToken()).toBeNull();
    expect(storage.getCsrfToken()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(2);
    expect(postMessage).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
  it('держит access- и CSRF-токены только в памяти', () => {
    saveAuthToken('access-token');
    saveCsrfToken('csrf-token');

    expect(getAuthToken()).toBe('access-token');
    expect(getCsrfToken()).toBe('csrf-token');
    expect(getAuthTokenPersistence()).toBe('memory');
    expect(window.localStorage.getItem('authToken')).toBeNull();
    expect(window.sessionStorage.getItem('authToken')).toBeNull();
  });

  it('не очищает более новый токен по устаревшему снимку logout', () => {
    saveAuthToken('old-token');
    const logoutSnapshot = getAuthToken();

    saveAuthToken('new-token');

    expect(clearAuthTokenIfCurrent(logoutSnapshot)).toBe(false);
    expect(getAuthToken()).toBe('new-token');
  });

  it('оповещает подписчиков и очищает память при инвалидировании сессии', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeAuthSessionInvalidation(listener);
    saveAuthToken('access-token');
    saveCsrfToken('csrf-token');

    invalidateAuthSession();
    unsubscribe();

    expect(listener).toHaveBeenCalledOnce();
    expect(getAuthToken()).toBeNull();
    expect(getCsrfToken()).toBeNull();
  });

  it('сохраняет явный Authorization для snapshot logout-запроса', () => {
    saveAuthToken('new-token');
    const config = {
      headers: {
        Authorization: 'Bearer old-token',
      },
    };

    attachAuthorizationHeader(config);

    expect(config.headers.Authorization).toBe('Bearer old-token');
  });

  it('не добавляет токен, когда авторизация явно отключена', () => {
    saveAuthToken('new-token');
    const config = {
      headers: {},
      skipAuth: true,
    };

    attachAuthorizationHeader(config);

    expect(config.headers).not.toHaveProperty('Authorization');
  });
});
