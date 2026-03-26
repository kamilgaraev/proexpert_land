import { Outlet } from 'react-router-dom';
import MarketingShell from '@/components/landing/MarketingShell';

const LandingLayout = () => {
  return (
    <MarketingShell>
        <Outlet />
    </MarketingShell>
  );
};

export default LandingLayout;
