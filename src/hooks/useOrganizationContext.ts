import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export type OrganizationMode = 'admin' | 'holding';

interface OrganizationContextInfo {
  id: number;
  name: string;
  is_holding: boolean;
  parent_organization_id?: number;
  mode: OrganizationMode;
}

export const useOrganizationContext = () => {
  const { user } = useAuth();
  const [context, setContext] = useState<OrganizationContextInfo | null>(null);

  useEffect(() => {
    if (user?.organization) {
      const isHolding = user.organization.organization_type === 'holding' || false;
      
      setContext({
        id: user.organization.id,
        name: user.organization.name,
        is_holding: isHolding,
        parent_organization_id: user.organization.parent_organization_id,
        mode: 'admin',
      });
    }
  }, [user]);

  const switchToHoldingMode = useCallback(() => {
    if (context && context.is_holding) {
      setContext(prev => prev ? { ...prev, mode: 'holding' } : null);
    }
  }, [context]);

  const switchToAdminMode = useCallback(() => {
    if (context) {
      setContext(prev => prev ? { ...prev, mode: 'admin' } : null);
    }
  }, [context]);

  const canAccessHoldingPanel = useCallback(() => {
    return context?.is_holding || false;
  }, [context]);

  const isHolding = useCallback(() => {
    return context?.is_holding || false;
  }, [context]);

  const isChildOrganization = useCallback(() => {
    return context?.parent_organization_id !== undefined && context?.parent_organization_id !== null;
  }, [context]);

  const isSingleOrganization = useCallback(() => {
    return !context?.is_holding && !context?.parent_organization_id;
  }, [context]);

  return {
    context,
    switchToHoldingMode,
    switchToAdminMode,
    canAccessHoldingPanel,
    isHolding,
    isChildOrganization,
    isSingleOrganization,
  };
};

