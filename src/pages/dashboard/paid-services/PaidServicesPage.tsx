import { Navigate } from 'react-router-dom';

const PaidServicesPage = () => {
  return <Navigate to="/dashboard/billing?tab=plans" replace />;
};

export default PaidServicesPage;
