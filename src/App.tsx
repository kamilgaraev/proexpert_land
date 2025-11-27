import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Критические компоненты загружаем сразу (Landing + Auth)
import LandingLayout from '@layouts/LandingLayout';
import HomePage from '@pages/landing/HomePage';
import SolutionsPage from '@pages/landing/SolutionsPage';
import FeaturesPage from '@pages/landing/FeaturesPage';
import PricingPage from '@pages/landing/PricingPage';

import LoginPage from '@pages/dashboard/LoginPage';
import RegisterPage from '@pages/dashboard/RegisterPage';
import ForgotPasswordPage from '@pages/dashboard/ForgotPasswordPage';
import NotFoundPage from '@pages/NotFoundPage';
import DashboardProtectedRoute from '@components/DashboardProtectedRoute';
import AdminProtectedRoute from '@components/AdminProtectedRoute';
import { ProtectedComponent } from '@/components/permissions/ProtectedComponent';

// Layouts - загружаем статически (нужны для структуры)
import DashboardLayout from '@layouts/DashboardLayout';
import AdminLayout from '@layouts/AdminLayout';

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
const UsersList = lazy(() => import('@pages/admin/users/UsersList'));
const ProjectsList = lazy(() => import('@pages/admin/projects/ProjectsList'));
const AdminLoginPage = lazy(() => import('@pages/admin/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('@pages/admin/AdminDashboardPage'));

// Lazy loading для blog модуля (очень тяжелый)
const BlogDashboardPage = lazy(() => import('@pages/admin/blog').then(m => ({ default: m.BlogDashboardPage })));
const BlogArticlesPage = lazy(() => import('@pages/admin/blog').then(m => ({ default: m.BlogArticlesPage })));
const BlogArticleEditorPage = lazy(() => import('@pages/admin/blog').then(m => ({ default: m.BlogArticleEditorPage })));
const BlogCategoriesPage = lazy(() => import('@pages/admin/blog').then(m => ({ default: m.BlogCategoriesPage })));
const BlogCommentsPage = lazy(() => import('@pages/admin/blog').then(m => ({ default: m.BlogCommentsPage })));
const BlogSEOPage = lazy(() => import('@pages/admin/blog').then(m => ({ default: m.BlogSEOPage })));
const BlogPublicPage = lazy(() => import('@components/blog/public/BlogPublicPage'));
const BlogArticlePage = lazy(() => import('@components/blog/public/BlogArticlePage'));
const BlogCategoryPage = lazy(() => import('@components/blog/public/BlogCategoryPage'));
const BlogTagPage = lazy(() => import('@components/blog/public/BlogTagPage'));

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
const DocsPage = lazy(() => import('@pages/resources/DocsPage'));

// Lazy loading для Company
const AboutPage = lazy(() => import('@pages/company/AboutPage'));
const PressPage = lazy(() => import('@pages/company/PressPage'));
const PartnersPage = lazy(() => import('@pages/company/PartnersPage'));
const ContactPage = lazy(() => import('@pages/company/ContactPage'));

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
        </Route>
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Админка: страница логина */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        {/* Продуктовые страницы - Moved to LandingLayout */}
        {/* Страницы решений - Moved to LandingLayout /solutions */}
        
        {/* Ресурсы */}
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/help" element={<DocsPage />} />
        <Route path="/blog" element={<BlogPublicPage />} />
        <Route path="/blog/category/:slug" element={<BlogCategoryPage />} />
        <Route path="/blog/tag/:slug" element={<BlogTagPage />} />
        <Route path="/blog/:slug" element={<BlogArticlePage />} />
        {/* <Route path="/webinars" element={<WebinarsPage />} /> */}
        
        {/* Компания */}
        <Route path="/about" element={<AboutPage />} />
        {/* <Route path="/careers" element={<CareersPage />} /> */}
        <Route path="/press" element={<PressPage />} />
        <Route path="/partners" element={<PartnersPage />} />
        <Route path="/contact" element={<ContactPage />} />
        
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
        
        {/* Административные маршруты */}
        <Route path="/admin" element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }>
          {/* Здесь добавляются страницы админки */}
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<UsersList />} />
          <Route path="projects" element={<ProjectsList />} />
          {/* Блог админка */}
          <Route path="blog" element={<BlogDashboardPage />} />
          <Route path="blog/articles" element={<BlogArticlesPage />} />
          <Route path="blog/articles/create" element={<BlogArticleEditorPage />} />
          <Route path="blog/articles/:id/edit" element={<BlogArticleEditorPage />} />
          <Route path="blog/articles/:id" element={<BlogArticleEditorPage />} />
          <Route path="blog/categories" element={<BlogCategoriesPage />} />
          <Route path="blog/comments" element={<BlogCommentsPage />} />
          <Route path="blog/seo" element={<BlogSEOPage />} />
          {/* Плейсхолдеры для будущих страниц */}
          <Route path="vacancies" element={<div>Вакансии админка (скоро)</div>} />
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