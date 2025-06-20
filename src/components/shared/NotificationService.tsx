import { toast } from 'react-toastify';
import { SubscriptionWarning } from '@utils/api';

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

  static showLimitNotification(warning: SubscriptionWarning) {
    const config: NotificationConfig = {
      type: warning.level === 'critical' ? 'error' : 'warning',
      title: 'Внимание к лимитам',
      message: warning.message,
      duration: warning.level === 'critical' ? 0 : 5000,
      actions: warning.level === 'critical' ? [
        {
          text: 'Обновить тариф',
          action: () => {
            window.location.href = '/dashboard/billing';
          }
        },
        {
          text: 'Подробнее',
          action: () => {
            window.location.href = '/dashboard/limits';
          }
        }
      ] : [
        {
          text: 'Посмотреть лимиты',
          action: () => {
            window.location.href = '/dashboard/limits';
          }
        }
      ]
    };

    NotificationService.show(config);
  }

  static showCriticalLimitsAlert(warnings: SubscriptionWarning[]) {
    const config: NotificationConfig = {
      type: 'error',
      title: 'Критические лимиты превышены!',
      message: `${warnings.length} ${warnings.length === 1 ? 'ресурс требует' : 'ресурсов требуют'} немедленного внимания`,
      duration: 0,
      actions: [
        {
          text: 'Обновить тариф',
          action: () => {
            window.location.href = '/dashboard/billing';
          }
        },
        {
          text: 'Подробности',
          action: () => {
            window.location.href = '/dashboard/limits';
          }
        }
      ]
    };

    NotificationService.show(config);
  }

  static showUpgradeSuccess() {
    const config: NotificationConfig = {
      type: 'success',
      title: 'Тариф успешно обновлен!',
      message: 'Ваши лимиты увеличены. Обновите страницу для получения актуальной информации.',
      duration: 5000,
      actions: [
        {
          text: 'Обновить',
          action: () => {
            window.location.reload();
          }
        }
      ]
    };

    NotificationService.show(config);
  }

  static showLimitApproaching(limitType: string, percentage: number) {
    const limitNames: Record<string, string> = {
      foremen: 'прорабов',
      projects: 'проектов',
      storage: 'хранилища'
    };

    const config: NotificationConfig = {
      type: 'warning',
      title: 'Приближение к лимиту',
      message: `Использование ${limitNames[limitType] || limitType} составляет ${percentage}%`,
      duration: 5000,
      actions: [
        {
          text: 'Посмотреть лимиты',
          action: () => {
            window.location.href = '/dashboard/limits';
          }
        }
      ]
    };

    NotificationService.show(config);
  }
}

export default NotificationService; 