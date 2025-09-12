import React from 'react';
import { useCanAccess } from '@/hooks/usePermissions';
import { CanAccessOptions } from '@/types/permissions';

interface ProtectedComponentProps extends CanAccessOptions {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
  className?: string;
}

/**
 * Компонент для условного рендера на основе прав доступа
 * 
 * @example
 * <ProtectedComponent permission="billing.manage">
 *   <button>Управление биллингом</button>
 * </ProtectedComponent>
 * 
 * @example
 * <ProtectedComponent 
 *   role="organization_owner" 
 *   fallback={<div>Недостаточно прав</div>}
 * >
 *   <AdminPanel />
 * </ProtectedComponent>
 * 
 * @example
 * <ProtectedComponent 
 *   module="projects" 
 *   permission="projects.view"
 *   requireAll={true}
 * >
 *   <ProjectsList />
 * </ProtectedComponent>
 */
export const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  children,
  fallback = null,
  showFallback = true,
  className,
  ...options
}) => {
  const hasAccess = useCanAccess(options);

  if (hasAccess) {
    return <div className={className}>{children}</div>;
  }

  if (showFallback && fallback) {
    return <div className={className}>{fallback}</div>;
  }

  return null;
};

/**
 * Компонент для скрытия элементов без прав (display: none)
 */
export const HiddenComponent: React.FC<ProtectedComponentProps> = ({
  children,
  className,
  ...options
}) => {
  const hasAccess = useCanAccess(options);

  return (
    <div 
      className={className}
      style={{ display: hasAccess ? 'block' : 'none' }}
    >
      {children}
    </div>
  );
};

/**
 * Компонент для отключения элементов без прав (disabled state)
 */
interface DisabledComponentProps extends ProtectedComponentProps {
  disabledClassName?: string;
  children: React.ReactElement;
}

export const DisabledComponent: React.FC<DisabledComponentProps> = ({
  children,
  className,
  disabledClassName = 'opacity-50 pointer-events-none cursor-not-allowed',
  ...options
}) => {
  const hasAccess = useCanAccess(options);

  return React.cloneElement(children, {
    className: `${children.props.className || ''} ${className || ''} ${
      hasAccess ? '' : disabledClassName
    }`.trim(),
    disabled: hasAccess ? children.props.disabled : true,
    'aria-disabled': !hasAccess
  });
};

/**
 * HOC для защиты компонентов
 */
export function withPermissions<P extends object>(
  Component: React.ComponentType<P>,
  options: CanAccessOptions,
  fallback?: React.ReactNode
) {
  return function PermissionWrappedComponent(props: P) {
    const hasAccess = useCanAccess(options);

    if (!hasAccess) {
      return fallback ? <>{fallback}</> : null;
    }

    return <Component {...props} />;
  };
}

/**
 * Компонент для показа индикатора загрузки прав
 */
interface PermissionsLoadingProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export const PermissionsGuard: React.FC<PermissionsLoadingProps> = ({
  children,
  fallback = <div className="flex items-center justify-center p-4">🔄 Загрузка прав...</div>,
  className
}) => {
  const { isLoaded, isLoading } = useCanAccess.length ? { isLoaded: true, isLoading: false } : 
    require('@/hooks/usePermissions').usePermissions();

  if (isLoading || !isLoaded) {
    return <div className={className}>{fallback}</div>;
  }

  return <div className={className}>{children}</div>;
};
