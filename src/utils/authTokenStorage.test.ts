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
});

describe('authTokenStorage', () => {
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
