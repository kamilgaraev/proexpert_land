import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '@pages/landing/LandingPage';
import DashboardLayout from '@layouts/DashboardLayout';
import LoginPage from '@pages/dashboard/LoginPage';
import RegisterPage from '@pages/dashboard/RegisterPage';
import ForgotPasswordPage from '@pages/dashboard/ForgotPasswordPage';
import DashboardPage from '@pages/dashboard/DashboardPage';
import ProfilePage from '@pages/dashboard/ProfilePage';
import OrganizationPage from '@pages/dashboard/OrganizationPage';
import HelpPage from '@pages/dashboard/HelpPage';
import SupportPage from '@pages/dashboard/SupportPage';
import NotFoundPage from '@pages/NotFoundPage';
import ProtectedRoute from '@components/ProtectedRoute';
import AdminsPage from '@pages/dashboard/AdminsPage';
import BillingPage from '@pages/dashboard/BillingPage';
import AddFundsPage from '@pages/dashboard/billing/AddFundsPage';
import UsersList from '@pages/admin/users/UsersList';
import ProjectsList from '@pages/admin/projects/ProjectsList';
import FAQPage from '@pages/dashboard/FAQPage';
import PaidServicesPage from '@pages/dashboard/paid-services/PaidServicesPage';
import SubscriptionLimitsPage from '@pages/dashboard/SubscriptionLimitsPage';
import UserManagementPage from '@pages/dashboard/UserManagementPage';

// Новые страницы
import IntegrationsPage from '@pages/product/IntegrationsPage';
import ApiPage from '@pages/product/ApiPage';
import SmallBusinessPage from '@pages/solutions/SmallBusinessPage';
import EnterprisePage from '@pages/solutions/EnterprisePage';
import ContractorsPage from '@pages/solutions/ContractorsPage';
import BlogPage from '@pages/resources/BlogPage';
import DocsPage from '@pages/resources/DocsPage';
import AboutPage from '@pages/company/AboutPage';
import CareersPage from '@pages/company/CareersPage';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import YandexMetrika from '@components/analytics/YandexMetrika';

function App() {
  const yandexMetrikaId = 102888970;

  return (
    <>
      <YandexMetrika 
        counterId={yandexMetrikaId}
        enableWebvisor={true}
        enableClickmap={true}
        enableTrackLinks={true}
        enableAccurateTrackBounce={true}
      />
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        {/* Продуктовые страницы */}
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/api" element={<ApiPage />} />
        
        {/* Страницы решений */}
        <Route path="/small-business" element={<SmallBusinessPage />} />
        <Route path="/enterprise" element={<EnterprisePage />} />
        <Route path="/contractors" element={<ContractorsPage />} />
        <Route path="/developers" element={<EnterprisePage />} />
        
        {/* Ресурсы */}
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/help" element={<DocsPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/webinars" element={<BlogPage />} />
        
        {/* Компания */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/press" element={<BlogPage />} />
        <Route path="/partners" element={<AboutPage />} />
        
        {/* Защищенные маршруты внутри личного кабинета */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="help" element={<HelpPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="limits" element={<SubscriptionLimitsPage />} />
          
          {/* Маршруты управления организацией */}
          <Route path="billing" element={<BillingPage />} />
          <Route path="billing/add-funds" element={<AddFundsPage />} />
          <Route path="admins" element={<AdminsPage />} />
          <Route path="admins/create" element={<Navigate to="/dashboard/admins" replace />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="paid-services" element={<PaidServicesPage />} />
          <Route path="organization" element={<OrganizationPage />} />
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
      <ToastContainer 
        position="bottom-right"
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default App; 