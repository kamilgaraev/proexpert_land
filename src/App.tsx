import { Routes, Route } from 'react-router-dom';
import LandingPage from '@pages/landing/LandingPage';
import DashboardLayout from '@layouts/DashboardLayout';
import LoginPage from '@pages/dashboard/LoginPage';
import RegisterPage from '@pages/dashboard/RegisterPage';
import DashboardPage from '@pages/dashboard/DashboardPage';
import ProfilePage from '@pages/dashboard/ProfilePage';
import ProjectsPage from '@pages/dashboard/ProjectsPage';
import FinancePage from '@pages/dashboard/FinancePage';
import DocumentsPage from '@pages/dashboard/DocumentsPage';
import TeamPage from '@pages/dashboard/TeamPage';
import CalendarPage from '@pages/dashboard/CalendarPage';
import SettingsPage from '@pages/dashboard/SettingsPage';
import NotificationsPage from '@pages/dashboard/NotificationsPage';
import HelpPage from '@pages/dashboard/HelpPage';
import NotFoundPage from '@pages/NotFoundPage';
import ProtectedRoute from '@components/ProtectedRoute';

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
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="finance" element={<FinancePage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="help" element={<HelpPage />} />
      </Route>
      
      {/* Страница 404 для несуществующих маршрутов */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App; 