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

    debugPermissions('Initializing Echo with auth token');
    
    echoInstance = new Echo({
      broadcaster: 'reverb',
      key: import.meta.env.VITE_REVERB_APP_KEY || '',
      wsHost: import.meta.env.VITE_REVERB_HOST || 'api.prohelper.pro',
      wsPort: import.meta.env.VITE_REVERB_PORT || 443,
      wssPort: import.meta.env.VITE_REVERB_PORT || 443,
      forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'https') === 'https',
      enabledTransports: ['ws', 'wss'],
      authEndpoint: `${import.meta.env.VITE_API_URL || 'https://api.prohelper.pro'}/api/v1/landing/broadcasting/auth`,
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

