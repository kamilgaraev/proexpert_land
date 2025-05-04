import { Routes, Route } from 'react-router-dom';
import LandingPage from '@pages/landing/LandingPage';
import DashboardLayout from '@layouts/DashboardLayout';
import LoginPage from '@pages/dashboard/LoginPage';
import RegisterPage from '@pages/dashboard/RegisterPage';
import DashboardPage from '@pages/dashboard/DashboardPage';
import NotFoundPage from '@pages/NotFoundPage';
import ProtectedRoute from '@components/ProtectedRoute';
import ProfilePage from '@pages/dashboard/ProfilePage';

function App() {
  return (
    <Routes>
      {/* Публичные маршруты */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Защищенные маршруты внутри личного кабинета */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        {/* Другие маршруты личного кабинета */}
      </Route>
      
      {/* Страница 404 для несуществующих маршрутов */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App; 