import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from '@contexts/AuthContext';
import { AdminAuthProvider } from '@contexts/AdminAuthContext';
import { PermissionsProvider } from '@/contexts/PermissionsContext';
import './index.css';

function handleSpaRedirect() {
  const redirect = localStorage.getItem('redirect_404');
  if (redirect) {
    localStorage.removeItem('redirect_404');
    window.history.replaceState({}, '', redirect);
  }
}

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