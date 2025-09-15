import { Routes, Route } from 'react-router-dom';
import { HoldingLandingPage, HoldingDashboardPage, HoldingOrganizationsPage } from '@pages/holding';
import HoldingLoginPage from '@pages/holding/HoldingLoginPage';
import HoldingReportsPage from '@pages/holding/HoldingReportsPage';
import HoldingSitesPage from '@pages/holding/HoldingSitesPage';
import CreateSitePage from '@pages/holding/CreateSitePage';
import EditSitePage from '@pages/holding/EditSitePage';
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
        <Route path="/holding/:holdingId/sites" element={<HoldingSitesPage />} />
        <Route path="/holding/:holdingId/sites/create" element={<CreateSitePage />} />
        <Route path="/holding/:holdingId/sites/:siteId/edit" element={<EditSitePage />} />
        <Route path="*" element={<HoldingLandingPage />} />
      </Routes>
    </ThemeProvider>
  );
};

export default HoldingRouter; 