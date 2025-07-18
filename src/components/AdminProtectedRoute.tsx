import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';

interface AdminProtectedRouteProps {
  children: ReactNode;
}

const adminRoles = new Set([
  'admin',
  'super_admin',
  'web_admin',
  'content_admin',
  'support_admin',
]);

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Пока проверяем авторизацию
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  // Если не авторизован
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Проверяем роль
  if (!adminRoles.has(user?.user_type || '')) {
    // Авторизован, но не администратор – перенаправим в личный кабинет
    return <Navigate to="/dashboard" replace />;
  }

  // Всё ок – рендерим контент
  return <>{children}</>;
};

export default AdminProtectedRoute; 