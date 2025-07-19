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
  return (
    <React.StrictMode>
      <AdminAuthProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </AdminAuthProvider>
    </React.StrictMode>
  );
} 