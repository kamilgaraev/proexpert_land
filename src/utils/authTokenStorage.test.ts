// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';

import { clearAuthToken, getAuthToken, saveAuthToken } from './authTokenStorage';

afterEach(() => {
  clearAuthToken();
  window.localStorage.clear();
  window.sessionStorage.clear();
});

describe('authTokenStorage', () => {
  it('persists token in session storage by default', () => {
    saveAuthToken('session-token');

    expect(getAuthToken()).toBe('session-token');
    expect(window.sessionStorage.getItem('authToken')).toBe('session-token');
    expect(window.localStorage.getItem('authToken')).toBeNull();
  });

  it('persists token in local storage when remember me is enabled', () => {
    saveAuthToken('local-token', 'local');

    expect(getAuthToken()).toBe('local-token');
    expect(window.localStorage.getItem('authToken')).toBe('local-token');
    expect(window.sessionStorage.getItem('authToken')).toBeNull();
  });

  it('clears active and legacy token keys', () => {
    window.localStorage.setItem('token', 'legacy-local');
    window.localStorage.setItem('authToken', 'active-local');
    window.sessionStorage.setItem('token', 'legacy-session');
    window.sessionStorage.setItem('authToken', 'active-session');

    clearAuthToken();

    expect(getAuthToken()).toBeNull();
    expect(window.localStorage.getItem('token')).toBeNull();
    expect(window.localStorage.getItem('authToken')).toBeNull();
    expect(window.sessionStorage.getItem('token')).toBeNull();
    expect(window.sessionStorage.getItem('authToken')).toBeNull();
  });
});
