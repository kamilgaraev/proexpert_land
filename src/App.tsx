import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Критические компоненты загружаем сразу (Landing + Auth)
import LandingLayout from '@layouts/LandingLayout';
import HomePage from '@pages/landing/HomePage';
import SolutionsPage from '@pages/landing/SolutionsPage';
import FeaturesPage from '@pages/landing/FeaturesPage';
import PricingPage from '@pages/landing/PricingPage';
import SeoClusterPage from '@pages/landing/SeoClusterPage';
import AboutPage from '@pages/company/AboutPage';
import ContactPage from '@pages/company/ContactPage';
import SecurityPage from '@pages/company/SecurityPage';
import PrivacyPage from '@pages/legal/PrivacyPage';
import OfferPage from '@pages/legal/OfferPage';
import CookiesPage from '@pages/legal/CookiesPage';
import IntegrationsPage from '@pages/product/IntegrationsPage';
import ContractorsPage from '@pages/solutions/ContractorsPage';
import DevelopersPage from '@pages/solutions/DevelopersPage';
import EnterprisePage from '@pages/solutions/EnterprisePage';
import BlogPublicPage from '@components/blog/public/BlogPublicPage';
import BlogArticlePage from '@components/blog/public/BlogArticlePage';
import BlogCategoryPage from '@components/blog/public/BlogCategoryPage';
import BlogTagPage from '@components/blog/public/BlogTagPage';

import LoginPage from '@pages/dashboard/LoginPage';
import RegisterPage from '@pages/dashboard/RegisterPage';
import ForgotPasswordPage from '@pages/dashboard/ForgotPasswordPage';
import NotFoundPage from '@pages/NotFoundPage';
import EmailSentPage from '@pages/dashboard/EmailSentPage';

const VerifyEmailPage = lazy(() => import('@pages/dashboard/VerifyEmailPage'));
import DashboardProtectedRoute from '@components/DashboardProtectedRoute';
import { ProtectedComponent } from '@/components/permissions/ProtectedComponent';

// Layouts - загружаем статически (нужны для структуры)
import DashboardLayout from '@layouts/DashboardLayout';

// Lazy loading для dashboard страниц (тяжелые компоненты)
const DashboardPage = lazy(() => import('@pages/dashboard/DashboardPage'));
const ProfilePage = lazy(() => import('@pages/dashboard/ProfilePage'));
const OrganizationPage = lazy(() => import('@pages/dashboard/OrganizationPage'));
const HelpPage = lazy(() => import('@pages/dashboard/HelpPage'));
const SupportPage = lazy(() => import('@pages/dashboard/SupportPage'));
const AdminsPage = lazy(() => import('@pages/dashboard/AdminsPage'));
const BillingPage = lazy(() => import('@pages/dashboard/BillingPage'));
const FAQPage = lazy(() => import('@pages/dashboard/FAQPage'));
const PaidServicesPage = lazy(() => import('@pages/dashboard/paid-services/PaidServicesPage'));
const SubscriptionLimitsPage = lazy(() => import('@pages/dashboard/SubscriptionLimitsPage'));
const ModulesPage = lazy(() => import('@pages/dashboard/ModulesPage'));
const CustomRolesPage = lazy(() => import('@pages/dashboard/CustomRolesPage'));
const MultiOrganizationPage = lazy(() => import('@pages/dashboard/MultiOrganizationPage'));
const NotificationsPage = lazy(() => import('@pages/dashboard/NotificationsPage').then(m => ({ default: m.Page })));

// Lazy loading для admin панели

// Lazy loading для blog модуля (очень тяжелый)

// Lazy loading для Multi-Organization / Holding
const HoldingRouter = lazy(() => import('@/HoldingRouter'));
const HoldingPanelLayout = lazy(() => import('@layouts/HoldingPanelLayout').then(m => ({ default: m.HoldingPanelLayout })));
const HoldingDashboard = lazy(() => import('@components/multi-org').then(m => ({ default: m.HoldingDashboard })));
const HoldingProjectsList = lazy(() => import('@components/multi-org').then(m => ({ default: m.HoldingProjectsList })));
const HoldingProjectDetail = lazy(() => import('@components/multi-org').then(m => ({ default: m.HoldingProjectDetail })));
const HoldingContractsList = lazy(() => import('@components/multi-org').then(m => ({ default: m.HoldingContractsList })));

// Lazy loading для Contractor Invitations
const ContractorInvitationsPage = lazy(() => import('@pages/dashboard/contractor-invitations/ContractorInvitationsPage'));
const ContractorInvitationTokenPage = lazy(() => import('@pages/dashboard/contractor-invitations/ContractorInvitationTokenPage'));

// Lazy loading для Project-Based RBAC
const OrganizationSettingsPage = lazy(() => import('@pages/dashboard/organization').then(m => ({ default: m.OrganizationSettingsPage })));
const OnboardingPage = lazy(() => import('@pages/dashboard/organization').then(m => ({ default: m.OnboardingPage })));
const MyProjectsPage = lazy(() => import('@pages/dashboard/projects').then(m => ({ default: m.MyProjectsPage })));
const ProjectDetailsPage = lazy(() => import('@pages/dashboard/projects/ProjectDetailsPage'));

// Lazy loading для Resources

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

    const reserved = new Set(['lk', 'api', 'www']);
    if (reserved.has(hostname.split('.')[0])) {
      return false;
    }

    return hostname !== mainDomain && hostname.endsWith(`.${mainDomain}`);
  };

  // Компонент загрузки для Suspense 
  const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium">Загрузка...</p>
      </div>
    </div>
  );

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
        <Suspense fallback={<LoadingFallback />}>
          <HoldingRouter />
        </Suspense>
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
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
        {/* Публичные маршруты */}
        <Route element={<LandingLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/solutions" element={<SolutionsPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="/contractors" element={<ContractorsPage />} />
          <Route path="/developers" element={<DevelopersPage />} />
          <Route path="/enterprise" element={<EnterprisePage />} />
          <Route path="/foreman-software" element={<SeoClusterPage pageKey="foreman-software" />} />
          <Route path="/construction-crm" element={<SeoClusterPage pageKey="construction-crm" />} />
          <Route path="/construction-erp" element={<SeoClusterPage pageKey="construction-erp" />} />
          <Route path="/material-accounting" element={<SeoClusterPage pageKey="material-accounting" />} />
          <Route path="/pto-software" element={<SeoClusterPage pageKey="pto-software" />} />
          <Route path="/contractor-control" element={<SeoClusterPage pageKey="contractor-control" />} />
          <Route path="/construction-documents" element={<SeoClusterPage pageKey="construction-documents" />} />
          <Route path="/construction-budget-control" element={<SeoClusterPage pageKey="construction-budget-control" />} />
          <Route path="/mobile-app" element={<SeoClusterPage pageKey="mobile-app" />} />
          <Route path="/ai-estimates" element={<SeoClusterPage pageKey="ai-estimates" />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/offer" element={<OfferPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
        </Route>
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Админка: страница логина */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/email-sent" element={<EmailSentPage />} />
        
        {/* Продуктовые страницы - Moved to LandingLayout */}
        {/* Страницы решений - Moved to LandingLayout /solutions */}
        
        {/* Ресурсы */}
        <Route path="/docs" element={<Navigate to="/features" replace />} />
        <Route path="/help" element={<Navigate to="/contact" replace />} />
        <Route path="/terms" element={<Navigate to="/offer" replace />} />
        <Route path="/blog" element={<BlogPublicPage />} />
        <Route path="/blog/preview/:articleId" element={<BlogArticlePage />} />
        <Route path="/blog/category/:slug" element={<BlogCategoryPage />} />
        <Route path="/blog/tag/:slug" element={<BlogTagPage />} />
        <Route path="/blog/:slug" element={<BlogArticlePage />} />
        {/* <Route path="/webinars" element={<WebinarsPage />} /> */}
        
        {/* Компания */}
        {/* <Route path="/careers" element={<CareersPage />} /> */}
        <Route path="/press" element={<Navigate to="/about" replace />} />
        <Route path="/partners" element={<Navigate to="/contact" replace />} />
        
        {/* Защищенные маршруты внутри личного кабинета */}
        <Route path="/dashboard" element={
          <DashboardProtectedRoute>
            <DashboardLayout />
          </DashboardProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<ProfilePage />} />
          <Route path="help" element={<HelpPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="limits" element={<SubscriptionLimitsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          
          {/* Маршруты управления организацией с проверкой прав */}
          <Route path="billing" element={
            <ProtectedComponent 
              permission="billing.view"
              role="organization_owner"
              requireAll={false}
              fallback={<Navigate to="/dashboard" replace />}
            >
              <BillingPage />
            </ProtectedComponent>
          } />
          <Route path="admins" element={
            <ProtectedComponent 
              permission="users.manage"
              role="organization_owner"
              requireAll={false}
              fallback={<Navigate to="/dashboard" replace />}
            >
              <AdminsPage />
            </ProtectedComponent>
          } />
          <Route path="admins/create" element={<Navigate to="/dashboard/admins" replace />} />
          
          <Route path="custom-roles" element={
            <ProtectedComponent 
              permission="roles.view_custom"
              role="organization_owner"
              requireAll={false}
              fallback={<Navigate to="/dashboard" replace />}
            >
              <CustomRolesPage />
            </ProtectedComponent>
          } />

          <Route path="paid-services" element={
            <ProtectedComponent 
              permission="billing.manage"
              role="organization_owner"
              requireAll={false}
              fallback={<Navigate to="/dashboard" replace />}
            >
              <PaidServicesPage />
            </ProtectedComponent>
          } />
          <Route path="modules" element={
            <ProtectedComponent 
              permission="modules.manage"
              role="organization_owner"
              requireAll={false}
              fallback={<Navigate to="/dashboard" replace />}
            >
              <ModulesPage />
            </ProtectedComponent>
          } />
          <Route path="organization" element={
            <ProtectedComponent 
              permission="organization.view"
              role="organization_owner"
              requireAll={false}
              fallback={<Navigate to="/dashboard" replace />}
            >
              <OrganizationPage />
            </ProtectedComponent>
          } />
          
          <Route path="organization/settings" element={<OrganizationSettingsPage />} />
          <Route path="organization/onboarding" element={<OnboardingPage />} />
          
          <Route path="projects" element={<MyProjectsPage />} />
          <Route path="projects/:id" element={<ProjectDetailsPage />} />
          
          {/* Приглашения подрядчиков */}
          <Route path="contractor-invitations" element={
            <ProtectedComponent 
              permission="users.invite"
              role="organization_owner"
              requireAll={false}
              fallback={<Navigate to="/dashboard" replace />}
            >
              <ContractorInvitationsPage />
            </ProtectedComponent>
          } />
          <Route path="contractor-invitations/token/:token" element={<ContractorInvitationTokenPage />} />

          {/* Мультиорганизация */}
          <Route path="multi-organization" element={
            <ProtectedComponent 
              permission="multi-organization.manage"
              fallback={<Navigate to="/dashboard" replace />}
            >
              <MultiOrganizationPage />
            </ProtectedComponent>
          } />
        </Route>

        {/* Holding Panel v2.0 - Панель управления холдингом */}
        <Route path="/landing/multi-organization" element={
          <DashboardProtectedRoute>
            <HoldingPanelLayout />
          </DashboardProtectedRoute>
        }>
          <Route index element={<Navigate to="/landing/multi-organization/dashboard" replace />} />
          <Route path="dashboard" element={<HoldingDashboard />} />
          <Route path="projects" element={<HoldingProjectsList />} />
          <Route path="projects/:id" element={<HoldingProjectDetail />} />
          <Route path="contracts" element={<HoldingContractsList />} />
        </Route>
        
        {/* Страница 404 для несуществующих маршрутов */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
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
