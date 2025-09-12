import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCanAccess, usePermissionsReady, usePermissionsLoading } from '@/hooks/usePermissions';
import { CanAccessOptions } from '@/types/permissions';

interface ProtectedRouteProps extends CanAccessOptions {
  children: React.ReactNode;
  redirectTo?: string;
  loadingComponent?: React.ReactNode;
  noAccessComponent?: React.ReactNode;
}

/**
 * Компонент для защиты маршрутов на основе прав доступа
 * 
 * @example
 * <ProtectedRoute permission="billing.manage" redirectTo="/no-access">
 *   <BillingPage />
 * </ProtectedRoute>
 * 
 * @example  
 * <ProtectedRoute 
 *   role="organization_owner"
 *   module="projects" 
 *   requireAll={true}
 *   redirectTo="/dashboard"
 * >
 *   <AdminProjectsPage />
 * </ProtectedRoute>
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/dashboard',
  loadingComponent,
  noAccessComponent,
  ...options
}) => {
  const location = useLocation();
  const isReady = usePermissionsReady();
  const isLoading = usePermissionsLoading();
  const hasAccess = useCanAccess(options);

  // Показываем загрузку пока права не загружены
  if (isLoading || !isReady) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🔄</div>
          <p className="text-gray-600">Проверка прав доступа...</p>
        </div>
      </div>
    );
  }

  // Если нет доступа, показываем компонент или редиректим
  if (!hasAccess) {
    if (noAccessComponent) {
      return <>{noAccessComponent}</>;
    }

    return (
      <Navigate 
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    );
  }

  // Есть доступ - рендерим компонент
  return <>{children}</>;
};

/**
 * Компонент для показа страницы "Нет доступа"
 */
interface NoAccessPageProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
  backText?: string;
  onBack?: () => void;
  className?: string;
}

export const NoAccessPage: React.FC<NoAccessPageProps> = ({
  title = 'Доступ запрещен',
  message = 'У вас недостаточно прав для просмотра этой страницы.',
  showBackButton = true,
  backText = 'Назад к дашборду',
  onBack,
  className = 'min-h-screen flex items-center justify-center'
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className={className}>
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-6xl mb-6">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600 mb-6">{message}</p>
        
        {showBackButton && (
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            {backText}
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * HOC для создания защищенных маршрутов
 */
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options: CanAccessOptions,
  redirectTo?: string
) {
  return function ProtectedRouteComponent(props: P) {
    return (
      <ProtectedRoute {...options} redirectTo={redirectTo}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

/**
 * Компонент для условного рендера в зависимости от прав на маршрут
 */
interface ConditionalRouteProps {
  condition: CanAccessOptions;
  whenTrue: React.ReactNode;
  whenFalse?: React.ReactNode;
  loading?: React.ReactNode;
}

export const ConditionalRoute: React.FC<ConditionalRouteProps> = ({
  condition,
  whenTrue,
  whenFalse = <NoAccessPage />,
  loading
}) => {
  const isReady = usePermissionsReady();
  const isLoading = usePermissionsLoading();
  const hasAccess = useCanAccess(condition);

  if (isLoading || !isReady) {
    return <>{loading || <div>Loading permissions...</div>}</>;
  }

  return hasAccess ? <>{whenTrue}</> : <>{whenFalse}</>;
};
