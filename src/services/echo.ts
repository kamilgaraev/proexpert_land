import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo?: Echo;
  }
}

window.Pusher = Pusher;

const getToken = () => localStorage.getItem('lk_token');

const echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY || '',
  wsHost: import.meta.env.VITE_REVERB_HOST || 'api.prohelper.pro',
  wsPort: import.meta.env.VITE_REVERB_PORT || 443,
  wssPort: import.meta.env.VITE_REVERB_PORT || 443,
  forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'https') === 'https',
  enabledTransports: ['ws', 'wss'],
  authEndpoint: `${import.meta.env.VITE_API_URL || 'https://api.prohelper.pro'}/broadcasting/auth`,
  auth: {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Accept': 'application/json',
    }
  }
});

window.Echo = echo;

export default echo;

