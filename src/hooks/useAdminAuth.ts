import { useContext } from 'react';
import { AdminAuthContext, AdminAuthContextType } from '@contexts/AdminAuthContext';

export const useAdminAuth = (): AdminAuthContextType => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return ctx;
}; 