import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from '@contexts/AuthContext';
import './index.css';

// Обработка перенаправления с 404 страницы
const handleSpaRedirect = () => {
  // Проверяем параметр redirect в URL
  const redirectParam = new URLSearchParams(window.location.search).get('redirect');
  
  if (redirectParam === 'true') {
    // Получаем сохраненный путь из sessionStorage
    const redirectPath = sessionStorage.getItem('spa_redirect_path');
    
    if (redirectPath) {
      // Удаляем из sessionStorage
      sessionStorage.removeItem('spa_redirect_path');
      
      // Перенаправляем на сохраненный путь без перезагрузки страницы
      window.history.replaceState(null, '', redirectPath);
    }
  }
};

// Выполняем обработку перенаправления
handleSpaRedirect();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
); 