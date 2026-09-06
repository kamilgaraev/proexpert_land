import { useRef, useState } from 'react';
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
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCanAccess } from '@/hooks/usePermissions';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onExecuteAction: (url: string, method: string) => void | Promise<void>;
}

export const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
  onExecuteAction
}: NotificationItemProps) => {
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);
  const pendingRef = useRef(false);
  const itemRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const hasBillingView = useCanAccess({ permission: 'billing.view' });
  const hasBillingManage = useCanAccess({ permission: 'billing.manage' });
  const canViewBilling = hasBillingView || hasBillingManage;
  const isCommercialBilling = notification.type.startsWith('commercial_');

  const runAction = async (name: string, operation: () => void | Promise<void>) => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPendingAction(name);
    setOperationError(null);
    itemRef.current?.focus();
    try {
      await operation();
    } catch {
      setOperationError('Не удалось выполнить действие. Попробуйте ещё раз.');
    } finally {
      pendingRef.current = false;
      setPendingAction(null);
    }
  };

  const handleAction = (action: NotificationAction, index: number) => {
    if (action.confirm && !window.confirm(action.confirm)) return;
    void runAction(`action-${index}`, () => onExecuteAction(action.url, action.method));
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

  const getIconColor = (priority?: string) => {
    if (priority === 'critical') return 'text-destructive bg-destructive/5';
    return 'text-muted-foreground bg-secondary/50';
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

  const priority = notification.priority || notification.data.priority;

  if (isCommercialBilling && !canViewBilling) {
    return null;
  }

  return (
    <motion.div
      ref={itemRef}
      role="article"
      aria-label={notification.data.title}
      tabIndex={-1}
      layout={!reducedMotion}
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
      transition={{ duration: reducedMotion ? 0 : 0.15 }}
      className={cn(
        "relative flex gap-3 border-b border-border/50 p-4 transition-colors duration-200",
        !notification.read_at && "bg-primary/5"
      )}
    >
      {/* Status Indicator Dot */}
      {!notification.read_at && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
      )}

      {/* Icon */}
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
        getIconColor(priority)
      )}>
        {getIconComponent(notification.data.icon)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={cn(
              "text-sm leading-snug break-words",
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

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">{notification.read_at ? 'Прочитано' : 'Новое'}</span>
          {!notification.read_at && (
            <Button variant="ghost" size="sm" disabled={pendingAction !== null} onClick={() => void runAction('read', () => onMarkAsRead(notification.id))}>
              {pendingAction === 'read' ? 'Отмечаем…' : 'Отметить прочитанным'}
            </Button>
          )}
          <Button variant="ghost" size="icon" className="ml-auto h-10 w-10 text-muted-foreground hover:text-destructive" disabled={pendingAction !== null} aria-label={`Удалить уведомление «${notification.data.title}»`} onClick={() => void runAction('delete', () => onDelete(notification.id))}>
            <XMarkIcon aria-hidden="true" className="h-5 w-5" />
          </Button>
        </div>
        {operationError && <p role="alert" className="text-sm text-destructive">{operationError}</p>}

        {/* Actions */}
        {isCommercialBilling ? (
          <div className="pt-2">
            <Button asChild size="sm" className="h-8 rounded-lg px-3 text-xs font-bold">
              <Link to="/dashboard/billing">Открыть пакеты и оплату</Link>
            </Button>
          </div>
        ) : notification.data.actions && notification.data.actions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {notification.data.actions.map((action, index) => (
              <Button
                key={index}
                variant={getActionButtonVariant(action.style)}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(action, index);
                }}
                disabled={pendingAction !== null}
                className="min-h-10 whitespace-normal px-3 text-sm"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>


    </motion.div>
  );
};

