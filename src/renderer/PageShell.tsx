import React from 'react';
import { AuthProvider } from '@contexts/AuthContext';
import { AdminAuthProvider } from '@contexts/AdminAuthContext';
import { PermissionsProvider } from '@/contexts/PermissionsContext';
// Глобальные стили (Tailwind) — нужен импорт, чтобы Vite подтянул CSS и вставил <link>.
import '../index.css';

interface PageShellProps {
  children: React.ReactNode;
  pageContext?: unknown;
}

export function PageShell({ children }: PageShellProps) {
  const isBrowser = typeof window !== 'undefined';
  return (
    <React.StrictMode>
      {isBrowser ? (
        <AdminAuthProvider>
          <AuthProvider>
            <PermissionsProvider autoLoad={true} interfaceType="lk" refreshInterval={900000}>
              {children}
            </PermissionsProvider>
          </AuthProvider>
        </AdminAuthProvider>
      ) : (
        <>{children}</>
      )}
    </React.StrictMode>
  );
} 