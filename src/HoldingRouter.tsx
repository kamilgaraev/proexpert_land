import { Routes, Route } from 'react-router-dom';
import { HoldingLandingPage, HoldingDashboardPage } from '@pages/holding';

const HoldingRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HoldingLandingPage />} />
      <Route path="/dashboard" element={<HoldingDashboardPage />} />
      <Route path="/organizations" element={<HoldingDashboardPage />} />
    </Routes>
  );
};

export default HoldingRouter; 