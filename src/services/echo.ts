import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { debugPermissions } from './debugPermissions';
import { getAuthToken } from '../utils/authTokenStorage';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo?: Echo<'reverb'>;
  }
}

if (typeof window !== 'undefined') {
  window.Pusher = Pusher;
}

let echoInstance: Echo<'reverb'> | null = null;
let authFingerprint: string | null = null;

const PLACEHOLDER_REVERB_KEYS = new Set([
  '1234567890abcdef1234567890abcdef',
]);

export const resolveReverbAppKey = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const key = value.trim();

  return key.length > 0 && !PLACEHOLDER_REVERB_KEYS.has(key.toLowerCase()) ? key : null;
};

export const disconnectEcho = (): void => {
  const echo = echoInstance;

  try {
    echo?.disconnect();
  } finally {
    echoInstance = null;
    authFingerprint = null;

    if (typeof window !== 'undefined') {
      window.Echo = undefined;
    }
  }
};

const getEcho = (userId: string | number | null = null): Echo<'reverb'> | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const token = getAuthToken();

  if (!token) {
    try {
      disconnectEcho();
    } catch {
      return null;
    }

    return null;
  }

  const nextFingerprint = `${token}\u0000${userId ?? ''}`;

  if (echoInstance && authFingerprint === nextFingerprint) {
    return echoInstance;
  }

  if (echoInstance) {
    try {
      disconnectEcho();
    } catch (error) {
      debugPermissions('Previous Echo disconnect failed:', error);
    }
  }

  const appKey = resolveReverbAppKey(import.meta.env.VITE_REVERB_APP_KEY);

  if (!appKey) {
    return null;
  }

  let nextEcho: Echo<'reverb'> | null = null;

  try {
    nextEcho = new Echo<'reverb'>({
      broadcaster: 'reverb',
      key: appKey,
      wsHost: import.meta.env.VITE_REVERB_HOST || 'api.1мост.рф',
      wsPort: import.meta.env.VITE_REVERB_PORT || 443,
      wssPort: import.meta.env.VITE_REVERB_PORT || 443,
      forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'https') === 'https',
      enabledTransports: ['ws', 'wss'],
      authEndpoint: `${import.meta.env.VITE_API_URL || 'https://api.1мост.рф'}/api/v1/landing/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    });

    nextEcho.connector.pusher.connection.bind('connected', () => {
      debugPermissions('WebSocket connected to Reverb');
    });
    nextEcho.connector.pusher.connection.bind('error', (error: unknown) => {
      debugPermissions('WebSocket connection error:', error);
    });

    echoInstance = nextEcho;
    authFingerprint = nextFingerprint;
    window.Echo = nextEcho;

    return nextEcho;
  } catch (error) {
    try {
      nextEcho?.disconnect();
    } catch (disconnectError) {
      debugPermissions('Partial Echo disconnect failed:', disconnectError);
    }

    echoInstance = null;
    authFingerprint = null;
    window.Echo = undefined;
    debugPermissions('Echo initialization failed:', error);

    return null;
  }
};

export default getEcho;
