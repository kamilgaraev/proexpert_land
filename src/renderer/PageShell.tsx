import React from 'react';
// Глобальные стили (Tailwind) — нужен импорт, чтобы Vite подтянул CSS и вставил <link>.
import '../index.css';

interface PageShellProps {
  children: React.ReactNode;
  pageContext?: unknown;
}

export function PageShell({ children }: PageShellProps) {
  return <React.StrictMode>{children}</React.StrictMode>;
} 