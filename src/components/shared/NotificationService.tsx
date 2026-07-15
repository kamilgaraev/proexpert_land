import { toast } from 'react-toastify';

interface NotificationConfig {
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    text: string;
    action: () => void;
  }>;
}

class NotificationService {
  static show(config: NotificationConfig) {
    const { type, title, message, duration = 5000 } = config;
    
    const content = (
      <div>
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-sm mt-1">{message}</div>
        {config.actions && config.actions.length > 0 && (
          <div className="flex space-x-2 mt-3">
            {config.actions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
              >
                {action.text}
              </button>
            ))}
          </div>
        )}
      </div>
    );

    const toastOptions = {
      autoClose: duration === 0 ? false : duration,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    } as const;

    switch (type) {
      case 'error':
        toast.error(content, toastOptions);
        break;
      case 'warning':
        toast.warn(content, toastOptions);
        break;
      case 'info':
        toast.info(content, toastOptions);
        break;
      case 'success':
        toast.success(content, toastOptions);
        break;
    }
  }

}

export default NotificationService;
