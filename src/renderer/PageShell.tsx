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
  return (
    <React.StrictMode>
      <AdminAuthProvider>
        <AuthProvider>
          <PermissionsProvider autoLoad={true} interfaceType="lk" refreshInterval={900000}>
            {children}
          </PermissionsProvider>
        </AuthProvider>
      </AdminAuthProvider>
    </React.StrictMode>
  );
} 
