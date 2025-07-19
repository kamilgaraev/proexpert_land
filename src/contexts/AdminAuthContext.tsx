import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { adminAuthService, getAdminToken, saveAdminToken, clearAdminToken } from '@utils/adminApi';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  is_super: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminAuthContextType {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchAdmin: () => Promise<void>;
}

export const AdminAuthContext = createContext<AdminAuthContextType>({
  admin: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  fetchAdmin: async () => {},
});

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(getAdminToken());
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdmin = useCallback(async () => {
    if (!getAdminToken()) return;
    try {
      const res = await adminAuthService.me();
      const resData: any = res.data;
      const adminInfo = resData?.data || resData;
      setAdmin(adminInfo as AdminUser);
    } catch (e) {
      console.error('[AdminAuth] fetchAdmin error', e);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      if (getAdminToken()) {
        try {
          await fetchAdmin();
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    init();
  }, [fetchAdmin]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await adminAuthService.login(email, password);
      const resData: any = res.data;
      const newToken = resData?.data?.token || resData?.token;
      if (newToken) {
        saveAdminToken(newToken);
        setToken(newToken);
      }
      const adminData = resData?.data?.user || resData?.user;
      if (adminData) setAdmin(adminData);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await adminAuthService.logout();
    } catch {}
    clearAdminToken();
    setToken(null);
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        fetchAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}; 