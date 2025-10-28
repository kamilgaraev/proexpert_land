import { useState } from 'react';
import type { Notification, NotificationAction } from '../../../types/notification';
import { formatDistanceToNow } from '../../../utils/dateFormatter';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onExecuteAction: (url: string, method: string) => void;
}

export const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
  onExecuteAction
}: NotificationItemProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAction = async (action: NotificationAction) => {
    if (action.confirm && !window.confirm(action.confirm)) {
      return;
    }
    
    await onExecuteAction(action.url, action.method);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    await onDelete(notification.id);
  };

  const handleClick = () => {
    if (!notification.read_at) {
      onMarkAsRead(notification.id);
    }
  };

  const getActionButtonClasses = (style: string) => {
    const baseClasses = "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors";
    
    switch (style) {
      case 'success':
        return `${baseClasses} bg-green-600 hover:bg-green-700 text-white`;
      case 'danger':
        return `${baseClasses} bg-red-600 hover:bg-red-700 text-white`;
      case 'warning':
        return `${baseClasses} bg-orange-600 hover:bg-orange-700 text-white`;
      case 'info':
        return `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white`;
      default:
        return `${baseClasses} bg-gray-600 hover:bg-gray-700 text-white`;
    }
  };

  const getIconColor = (color?: string) => {
    switch (color) {
      case 'orange':
        return 'text-orange-500';
      case 'red':
        return 'text-red-500';
      case 'green':
        return 'text-green-500';
      case 'blue':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        flex gap-3 p-4 border-b border-gray-100 cursor-pointer transition-colors
        hover:bg-gray-50
        ${!notification.read_at ? 'bg-blue-50' : 'bg-white'}
        ${isDeleting ? 'opacity-50' : ''}
      `}
    >
      <div className={`text-2xl ${getIconColor(notification.data.color)}`}>
        {notification.data.icon || '🔔'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <h4 className="font-semibold text-gray-900 text-sm">
            {notification.data.title}
          </h4>
          
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-600 ml-2 flex-shrink-0"
            title="Удалить"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-600 mt-1">
          {notification.data.message}
        </p>

        {notification.data.actions && notification.data.actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {notification.data.actions.map((action, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(action);
                }}
                className={getActionButtonClasses(action.style)}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500 mt-2">
          {formatDistanceToNow(notification.created_at)}
        </div>
      </div>

      {!notification.read_at && (
        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
      )}
    </div>
  );
};

