import { Routes, Route, Navigate } from 'react-router-dom';
import { HoldingLandingPage, HoldingDashboardPage, HoldingOrganizationsPage } from '@pages/holding';
import HoldingLoginPage from '@pages/holding/HoldingLoginPage';
import HoldingReportsPage from '@pages/holding/HoldingReportsPage';
import LandingEditorPage from '@pages/holding/LandingEditorPage';
import { ThemeProvider } from '@components/shared/ThemeProvider';
import { HoldingPanelLayout } from '@layouts/HoldingPanelLayout';
import { HoldingProjectsList, HoldingProjectDetails } from '@/components/holding';

const HoldingRouter = () => {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<HoldingLandingPage />} />
        <Route path="/login" element={<HoldingLoginPage />} />
        
        <Route element={<HoldingPanelLayout />}>
          <Route path="/dashboard" element={<HoldingDashboardPage />} />
          <Route path="/organizations" element={<HoldingOrganizationsPage />} />
          <Route path="/reports/:holdingId" element={<HoldingReportsPage />} />
          <Route path="/projects" element={<HoldingProjectsList />} />
          <Route path="/projects/:projectId" element={<HoldingProjectDetails />} />
          <Route path="/contracts" element={<Navigate to="/dashboard" replace />} />
          <Route path="/settings" element={<Navigate to="/dashboard" replace />} />
        </Route>
        
        <Route path="/holding/:holdingId/landing/edit" element={<LandingEditorPage />} />
        <Route path="*" element={<HoldingLandingPage />} />
      </Routes>
    </ThemeProvider>
  );
};

export default HoldingRouter;
