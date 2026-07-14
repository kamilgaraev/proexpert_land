import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { debugPermissions } from './debugPermissions';
import { getAuthToken } from '../utils/authTokenStorage';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo?: any;
  }
}

// SSR-safe: присваиваем только на клиенте
if (typeof window !== 'undefined') {
  window.Pusher = Pusher;
}

let echoInstance: any = null;

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

const getEcho = () => {
  // SSR-safe: Echo работает только на клиенте
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!echoInstance) {
    const token = getAuthToken();
    
    if (!token) {
      debugPermissions('Echo initialization skipped: auth token is missing');
      return null;
    }

    const appKey = resolveReverbAppKey(import.meta.env.VITE_REVERB_APP_KEY);

    if (!appKey) {
      debugPermissions('Echo initialization skipped: Reverb app key is missing');
      return null;
    }

    debugPermissions('Initializing Echo with auth token');
    
    echoInstance = new Echo({
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
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      }
    });

    window.Echo = echoInstance;
    
    echoInstance.connector.pusher.connection.bind('connected', () => {
      debugPermissions('WebSocket connected to Reverb');
    });

    echoInstance.connector.pusher.connection.bind('error', (err: any) => {
      debugPermissions('WebSocket connection error:', err);
    });
  }
  
  return echoInstance;
};

export default getEcho;

