import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '@pages/landing/LandingPage';
import DashboardLayout from '@layouts/DashboardLayout';
import LoginPage from '@pages/dashboard/LoginPage';
import RegisterPage from '@pages/dashboard/RegisterPage';
import DashboardPage from '@pages/dashboard/DashboardPage';
import ProfilePage from '@pages/dashboard/ProfilePage';
import HelpPage from '@pages/dashboard/HelpPage';
import SupportPage from '@pages/dashboard/SupportPage';
import NotFoundPage from '@pages/NotFoundPage';
import ProtectedRoute from '@components/ProtectedRoute';
import SubscriptionsList from '@pages/dashboard/subscriptions/SubscriptionsList';
import AdminsPage from '@pages/dashboard/AdminsPage';
import BillingPage from '@pages/dashboard/BillingPage';
import AddFundsPage from '@pages/dashboard/billing/AddFundsPage';
import UsersList from '@pages/admin/users/UsersList';
import ProjectsList from '@pages/admin/projects/ProjectsList';
import FAQPage from '@pages/dashboard/FAQPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
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
          <Route path="help" element={<HelpPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="faq" element={<FAQPage />} />
          
          {/* Маршруты управления организацией */}
          <Route path="billing" element={<BillingPage />} />
          <Route path="billing/add-funds" element={<AddFundsPage />} />
          <Route path="admins" element={<AdminsPage />} />
          <Route path="admins/create" element={<Navigate to="/dashboard/admins" replace />} />
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