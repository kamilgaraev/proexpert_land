import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import AdminProtectedRoute from '@components/AdminProtectedRoute';
import AdminLayout from '@layouts/AdminLayout';
import AdminsPage from '@pages/dashboard/AdminsPage';
import BillingPage from '@pages/dashboard/BillingPage';
import AddFundsPage from '@pages/dashboard/billing/AddFundsPage';
import UsersList from '@pages/admin/users/UsersList';
import ProjectsList from '@pages/admin/projects/ProjectsList';
import AdminLoginPage from '@pages/admin/AdminLoginPage';
import FAQPage from '@pages/dashboard/FAQPage';
import PaidServicesPage from '@pages/dashboard/paid-services/PaidServicesPage';
import SubscriptionLimitsPage from '@pages/dashboard/SubscriptionLimitsPage';
import ModulesPage from '@pages/dashboard/ModulesPage';
import MultiOrganizationPage from '@pages/dashboard/MultiOrganizationPage';
import HoldingRouter from '@/HoldingRouter';

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
import AdminHomePage from '@pages/admin/AdminHomePage';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import YandexMetrika from '@components/analytics/YandexMetrika';
import { initSEOTracking } from '@utils/seoTracking';

function App() {
  const location = useLocation();
  const yandexMetrikaId = 102888970;

  useEffect(() => {
    initSEOTracking();
  }, []);

  useEffect(() => {
    import('@utils/seoTracking').then(({ seoTracker }) => {
      seoTracker.trackPageView();
    });
  }, [location.pathname]);

  const isHoldingSubdomain = () => {
    // На сервере объекта window нет, поэтому холдинг-лендинг никогда не рендерим
    if (typeof window === 'undefined') {
      return false;
    }

    const hostname = window.location.hostname;
    const mainDomain = 'prohelper.pro';

    if (
      hostname.includes('localhost') ||
      hostname.includes('127.0.0.1')
    ) {
      return false;
    }

    // Зарезервированные субдомены, которые НЕ считаются холдингами
    const reserved = new Set(['lk', 'api', 'www']);
    if (reserved.has(hostname.split('.')[0])) {
      return false;
    }

    return hostname !== mainDomain && hostname.endsWith(`.${mainDomain}`);
  };

  if (isHoldingSubdomain()) {
    return (
      <>
        <YandexMetrika 
          counterId={yandexMetrikaId}
          enableWebvisor={true}
          enableClickmap={true}
          enableTrackLinks={true}
          enableAccurateTrackBounce={true}
        />
        <HoldingRouter />
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
        {/* Админка: страница логина */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
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
          <Route path="settings" element={<ProfilePage />} />
          <Route path="help" element={<HelpPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="limits" element={<SubscriptionLimitsPage />} />
          
          {/* Маршруты управления организацией */}
          <Route path="billing" element={<BillingPage />} />
          <Route path="billing/add-funds" element={<AddFundsPage />} />
          <Route path="admins" element={<AdminsPage />} />
          <Route path="admins/create" element={<Navigate to="/dashboard/admins" replace />} />

          <Route path="paid-services" element={<PaidServicesPage />} />
          <Route path="modules" element={<ModulesPage />} />
          <Route path="multi-organization" element={<MultiOrganizationPage />} />
          <Route path="organization" element={<OrganizationPage />} />
        </Route>
        
        {/* Административные маршруты */}
        <Route path="/admin" element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }>
          {/* Здесь добавляются страницы админки */}
          <Route index element={<AdminHomePage />} />
          <Route path="users" element={<UsersList />} />
          <Route path="projects" element={<ProjectsList />} />
          {/* Плейсхолдеры для будущих страниц */}
          <Route path="blog" element={<div>Блог админка (скоро)</div>} />
          <Route path="vacancies" element={<div>Вакансии админка (скоро)</div>} />
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