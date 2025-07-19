import React from 'react';
import { AuthProvider } from '@contexts/AuthContext';
import { AdminAuthProvider } from '@contexts/AdminAuthContext';
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
          <AuthProvider>{children}</AuthProvider>
        </AdminAuthProvider>
      ) : (
        <>{children}</>
      )}
    </React.StrictMode>
  );
} 