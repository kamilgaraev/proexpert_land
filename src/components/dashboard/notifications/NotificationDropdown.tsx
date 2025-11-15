import { Link } from 'react-router-dom';
import type { Notification } from '../../../types/notification';
import { NotificationItem } from './NotificationItem';

interface NotificationDropdownProps {
  notifications: Notification[];
  loading: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onExecuteAction: (url: string, method: string) => void;
  onClose: () => void;
}

export const NotificationDropdown = ({
  notifications,
  loading,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onExecuteAction,
  onClose
}: NotificationDropdownProps) => {
  return (
    <div className="absolute right-0 top-full mt-2 w-[420px] bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Уведомления</h3>
        
        {notifications.some(n => !n.read_at) && (
          <button
            onClick={onMarkAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Отметить все
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="text-6xl mb-3">🔔</div>
              <p className="text-gray-500 text-center">
                У вас пока нет уведомлений
              </p>
            </div>
          )
        ) : (
          <div>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
                onExecuteAction={onExecuteAction}
              />
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 p-3 bg-gray-50">
        <Link
          to="/dashboard/notifications"
          onClick={onClose}
          className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Все уведомления →
        </Link>
      </div>
    </div>
  );
};

