import { useState } from 'react';
import type { Notification, NotificationAction } from '../../../types/notification';
import { formatDistanceToNow } from '../../../utils/dateFormatter';
import { 
  BellIcon, 
  ShieldCheckIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BoltIcon,
  UserIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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

  const handleMouseEnter = () => {
    // Optional: Mark as read on hover logic can remain if desired, 
    // or removed for manual click only. keeping it for now as per previous logic.
    if (!notification.read_at) {
      onMarkAsRead(notification.id);
    }
  };

  const getActionButtonVariant = (style: string): "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" => {
    switch (style) {
      case 'success':
        return 'default'; // or a custom green variant if added, usually default (primary) is fine
      case 'danger':
        return 'destructive';
      case 'warning':
        return 'secondary'; // orange-ish usually
      case 'info':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getIconColor = (color?: string, priority?: string) => {
    if (priority === 'critical') return 'text-red-500 bg-red-50';
    if (priority === 'high') return 'text-orange-500 bg-orange-50';
    if (priority === 'low') return 'text-slate-500 bg-slate-50';
    
    switch (color) {
      case 'orange':
        return 'text-orange-500 bg-orange-50';
      case 'red':
        return 'text-red-500 bg-red-50';
      case 'green':
        return 'text-emerald-500 bg-emerald-50';
      case 'blue':
        return 'text-blue-500 bg-blue-50';
      default:
        return 'text-primary bg-primary/10';
    }
  };

  const getIconComponent = (iconName?: string) => {
    const iconClass = "w-5 h-5";
    
    switch (iconName) {
      case 'bell':
        return <BellIcon className={iconClass} />;
      case 'shield-alert':
      case 'shield-check':
        return <ShieldCheckIcon className={iconClass} />;
      case 'check-circle':
      case 'check':
        return <CheckCircleIcon className={iconClass} />;
      case 'exclamation-triangle':
      case 'alert':
        return <ExclamationTriangleIcon className={iconClass} />;
      case 'info':
      case 'information-circle':
        return <InformationCircleIcon className={iconClass} />;
      case 'zap':
      case 'bolt':
        return <BoltIcon className={iconClass} />;
      case 'user':
        return <UserIcon className={iconClass} />;
      default:
        return <BellIcon className={iconClass} />;
    }
  };

  const priority = (notification as any).priority || notification.data?.priority;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={cn(
        "relative flex gap-4 p-4 border-b border-border/50 cursor-pointer transition-all duration-200 group",
        "hover:bg-muted/50",
        !notification.read_at && "bg-primary/5"
      )}
    >
      {/* Status Indicator Dot */}
      {!notification.read_at && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
      )}

      {/* Icon */}
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300",
        getIconColor(notification.data.color, priority)
      )}>
        {getIconComponent(notification.data.icon)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={cn(
              "text-sm leading-none",
              !notification.read_at ? "font-bold text-foreground" : "font-medium text-foreground/80"
            )}>
              {notification.data.title}
            </h4>
            {priority === 'critical' && (
              <Badge variant="destructive" className="h-5 px-1.5 text-[10px] tracking-wide uppercase">
                Срочно
              </Badge>
            )}
            {priority === 'high' && (
              <Badge variant="outline" className="h-5 px-1.5 text-[10px] tracking-wide uppercase border-orange-200 text-orange-600 bg-orange-50">
                Важно
              </Badge>
            )}
          </div>
          
          <span className="text-[10px] text-muted-foreground whitespace-nowrap font-medium flex-shrink-0">
            {formatDistanceToNow(notification.created_at)}
          </span>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {notification.data.message}
        </p>

        {/* Actions */}
        {notification.data.actions && notification.data.actions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {notification.data.actions.map((action, index) => (
              <Button
                key={index}
                variant={getActionButtonVariant(action.style)}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(action);
                }}
                className={cn(
                  "h-8 px-3 text-xs font-bold rounded-lg shadow-sm",
                  action.style === 'success' && "bg-emerald-600 hover:bg-emerald-700 text-white",
                  action.style === 'warning' && "bg-orange-500 hover:bg-orange-600 text-white",
                )}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Delete Button (appears on hover) */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleDelete}
          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          title="Удалить"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

