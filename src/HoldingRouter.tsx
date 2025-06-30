import { Routes, Route } from 'react-router-dom';
import { HoldingLandingPage, HoldingDashboardPage, HoldingOrganizationsPage } from '@pages/holding';
import HoldingLoginPage from '@pages/holding/HoldingLoginPage';

const HoldingRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HoldingLandingPage />} />
      <Route path="/login" element={<HoldingLoginPage />} />
      <Route path="/dashboard" element={<HoldingDashboardPage />} />
      <Route path="/organizations" element={<HoldingOrganizationsPage />} />
      <Route path="*" element={<HoldingLandingPage />} />
    </Routes>
  );
};

export default HoldingRouter; 