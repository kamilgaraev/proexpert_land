import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { usePermissions } from '@hooks/usePermissions';

interface DashboardProtectedRouteProps {
  children: ReactNode;
}

const DashboardProtectedRoute = ({ children }: DashboardProtectedRouteProps) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isLoaded: permissionsLoaded, isLoading: permissionsLoading, error: permissionsError } = usePermissions();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-concrete-50 to-steel-50">
        <div className="flex flex-col items-center space-y-4">
          <svg className="animate-spin h-10 w-10 text-construction-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-steel-600 text-sm">Проверяем авторизацию...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (permissionsLoading || !permissionsLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-concrete-50 to-steel-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <svg className="animate-spin h-10 w-10 text-construction-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-construction-600 rounded-full animate-ping"></div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-steel-900 font-medium">Настраиваем личный кабинет</p>
            <p className="text-steel-600 text-sm">Загружаем права доступа...</p>
          </div>
        </div>
      </div>
    );
  }

  if (permissionsError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-concrete-50 to-steel-50">
        <div className="flex flex-col items-center space-y-6 max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-steel-900 mb-2">Ошибка загрузки</h3>
            <p className="text-steel-600 mb-4">
              Не удалось загрузить права доступа. Попробуйте обновить страницу.
            </p>
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {permissionsError}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-construction-600 text-white rounded-xl hover:bg-construction-700 font-medium transition-colors"
          >
            Обновить страницу
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default DashboardProtectedRoute;
