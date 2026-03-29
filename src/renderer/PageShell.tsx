import React from 'react';
import { AuthProvider } from '@contexts/AuthContext';
import { PermissionsProvider } from '@/contexts/PermissionsContext';
import { isMarketingPublicPath } from '@/utils/publicSite';
import '../index.css';

interface PageShellProps {
  children: React.ReactNode;
  pageContext?: {
    urlPathname?: string;
  };
}

const resolvePathname = (pageContext?: PageShellProps['pageContext']) => {
  if (pageContext?.urlPathname) {
    return pageContext.urlPathname;
  }

  if (typeof window !== 'undefined') {
    return window.location.pathname;
  }

  return '/';
};

export function PageShell({ children, pageContext }: PageShellProps) {
  const pathname = resolvePathname(pageContext);

  if (isMarketingPublicPath(pathname)) {
    return <React.StrictMode>{children}</React.StrictMode>;
  }

  return (
    <React.StrictMode>
      <AuthProvider>
        <PermissionsProvider autoLoad={true} interfaceType="lk" refreshInterval={900000}>
          {children}
        </PermissionsProvider>
      </AuthProvider>
    </React.StrictMode>
  );
}
