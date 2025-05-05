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
import SupportPage from '@pages/dashboard/SupportPage';
import NotFoundPage from '@pages/NotFoundPage';
import ProtectedRoute from '@components/ProtectedRoute';
import MembersList from '@pages/dashboard/members/MembersList';
import MemberCreate from '@pages/dashboard/members/MemberCreate';
import SubscriptionsList from '@pages/dashboard/subscriptions/SubscriptionsList';
import AdminsList from '@pages/dashboard/admins/AdminsList';
import AdminCreate from '@pages/dashboard/admins/AdminCreate';
import UsersList from '@pages/admin/users/UsersList';
import ProjectsList from '@pages/admin/projects/ProjectsList';

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
        <Route path="support" element={<SupportPage />} />
        
        {/* Маршруты управления организацией */}
        <Route path="members" element={<MembersList />} />
        <Route path="members/create" element={<MemberCreate />} />
        <Route path="admins" element={<AdminsList />} />
        <Route path="admins/create" element={<AdminCreate />} />
        <Route path="subscriptions" element={<SubscriptionsList />} />
      </Route>
      
      {/* Административные маршруты */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="users" element={<UsersList />} />
        <Route path="projects" element={<ProjectsList />} />
      </Route>
      
      {/* Страница 404 для несуществующих маршрутов */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App; 