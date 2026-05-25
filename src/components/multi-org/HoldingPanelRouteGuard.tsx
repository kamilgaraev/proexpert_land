import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { PageLoading } from '@/components/common/PageLoading';
import { useAuth } from '@/hooks/useAuth';

interface HoldingPanelRouteGuardProps {
  children: ReactNode;
}

export const HoldingPanelRouteGuard = ({ children }: HoldingPanelRouteGuardProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoading message="Загрузка панели холдинга..." />;
  }

  const organization = user && 'organization' in user ? (user.organization as any) : null;
  const isHoldingOrganization = organization?.organization_type === 'parent' || organization?.is_holding === true;

  if (!isHoldingOrganization) {
    return <Navigate to="/dashboard/multi-organization" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};
