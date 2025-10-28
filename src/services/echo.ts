import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo?: any;
  }
}

window.Pusher = Pusher;

const getToken = () => {
  return localStorage.getItem('token') || 
         sessionStorage.getItem('authToken') || 
         null;
};

let echoInstance: any = null;

const getEcho = () => {
  if (!echoInstance) {
    const token = getToken();
    
    if (!token) {
      console.warn('⚠️ Токен не найден, WebSocket не инициализирован');
      return null;
    }

    console.log('🔌 Инициализация Echo с токеном...');
    
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
      console.log('✅ WebSocket успешно подключен к Reverb');
    });

    echoInstance.connector.pusher.connection.bind('error', (err: any) => {
      console.error('❌ Ошибка WebSocket подключения:', err);
    });
  }
  
  return echoInstance;
};

export default getEcho();

