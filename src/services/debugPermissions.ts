export const isPermissionsDebugEnabled = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.localStorage.getItem('debug_permissions') === '1';
  } catch {
    return false;
  }
};

export const debugPermissions = (...args: unknown[]): void => {
  if (isPermissionsDebugEnabled()) {
    console.debug(...args);
  }
};
