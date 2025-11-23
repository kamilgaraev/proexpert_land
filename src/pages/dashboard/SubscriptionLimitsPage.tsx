import { Navigate } from 'react-router-dom';

const SubscriptionLimitsPage = () => {
  return <Navigate to="/dashboard/billing?tab=limits" replace />;
};

export default SubscriptionLimitsPage;
