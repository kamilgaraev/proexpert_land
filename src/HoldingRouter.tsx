import { Routes, Route } from 'react-router-dom';
import { HoldingLandingPage, HoldingDashboardPage, HoldingOrganizationsPage } from '@pages/holding';
import HoldingLoginPage from '@pages/holding/HoldingLoginPage';
import HoldingReportsPage from '@pages/holding/HoldingReportsPage';
import LandingEditorPage from '@pages/holding/LandingEditorPage';
import { ThemeProvider } from '@components/shared/ThemeProvider';

const HoldingRouter = () => {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<HoldingLandingPage />} />
        <Route path="/login" element={<HoldingLoginPage />} />
        <Route path="/dashboard" element={<HoldingDashboardPage />} />
        <Route path="/organizations" element={<HoldingOrganizationsPage />} />
        <Route path="/reports/:holdingId" element={<HoldingReportsPage />} />
        <Route path="/holding/:holdingId/landing/edit" element={<LandingEditorPage />} />
        <Route path="*" element={<HoldingLandingPage />} />
      </Routes>
    </ThemeProvider>
  );
};

export default HoldingRouter; 