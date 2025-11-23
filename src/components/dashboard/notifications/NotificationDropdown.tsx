import { Link } from 'react-router-dom';
import type { Notification } from '../../../types/notification';
import { NotificationItem } from './NotificationItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { BellIcon, CheckCheckIcon } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

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
  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <div className="absolute right-0 top-full mt-2 w-[420px] bg-background rounded-2xl shadow-2xl border border-border z-50 max-h-[650px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-foreground">Уведомления</h3>
          {unreadCount > 0 && (
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        
        {notifications.some(n => !n.read_at) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllAsRead}
            className="text-xs h-8 text-muted-foreground hover:text-primary"
          >
            <CheckCheckIcon className="w-3.5 h-3.5 mr-1.5" />
            Все прочитаны
          </Button>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 h-[400px]">
        {notifications.length === 0 ? (
          loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 bg-secondary rounded-3xl flex items-center justify-center mb-4 text-muted-foreground">
                <BellIcon className="w-8 h-8" />
              </div>
              <h4 className="text-foreground font-bold mb-1">Нет новых уведомлений</h4>
              <p className="text-muted-foreground text-sm">
                Здесь будут появляться важные сообщения о ваших проектах и задачах
              </p>
            </div>
          )
        ) : (
          <div className="flex flex-col">
            <AnimatePresence initial={false}>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                  onDelete={onDelete}
                  onExecuteAction={onExecuteAction}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border bg-secondary/30 backdrop-blur-sm">
        <Button 
          variant="outline" 
          className="w-full justify-center rounded-xl border-border hover:bg-background font-bold text-muted-foreground hover:text-foreground transition-all"
          asChild
        >
          <Link
            to="/dashboard/notifications"
            onClick={onClose}
          >
            Посмотреть все уведомления
          </Link>
        </Button>
      </div>
    </div>
  );
};

