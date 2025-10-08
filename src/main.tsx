import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from '@contexts/AuthContext';
import { AdminAuthProvider } from '@contexts/AdminAuthContext';
import { PermissionsProvider } from '@/contexts/PermissionsContext';
import './index.css';

function handleDashboardRedirect() {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  const search = window.location.search;
  const hash = window.location.hash;
  
  const isMainDomain = hostname === 'prohelper.pro' || hostname === 'www.prohelper.pro';
  const isDashboardRoute = pathname.startsWith('/dashboard') || 
                          pathname === '/login' || 
                          pathname === '/register' ||
                          pathname === '/forgot-password';

  if (isMainDomain && isDashboardRoute && !hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
    window.location.href = `https://lk.prohelper.pro${pathname}${search}${hash}`;
    return true;
  }
  return false;
}

function handleSpaRedirect() {
  const redirect = localStorage.getItem('redirect_404');
  if (redirect) {
    localStorage.removeItem('redirect_404');
    window.history.replaceState({}, '', redirect);
  }
}

if (!handleDashboardRedirect()) {
  handleSpaRedirect();
  
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <BrowserRouter>
        <AdminAuthProvider>
          <AuthProvider>
            <PermissionsProvider autoLoad={true} interfaceType="lk" refreshInterval={900000}>
              <App />
            </PermissionsProvider>
          </AuthProvider>
        </AdminAuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}