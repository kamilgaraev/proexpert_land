import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { PageLoading } from '@/components/common/PageLoading';
import { useAuth } from '@/hooks/useAuth';

interface HoldingPanelRouteGuardProps {
  children: ReactNode;
  deniedPath?: string;
}

export const HoldingPanelRouteGuard = ({
  children,
  deniedPath = '/dashboard/multi-organization',
}: HoldingPanelRouteGuardProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoading message="Загрузка панели холдинга..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const organization = user && 'organization' in user ? (user.organization as any) : null;
  const isHoldingOrganization = organization?.organization_type === 'parent' || organization?.is_holding === true;

  if (!isHoldingOrganization) {
    return <Navigate to={deniedPath} replace state={{ from: location }} />;
  }

  return <>{children}</>;
};
