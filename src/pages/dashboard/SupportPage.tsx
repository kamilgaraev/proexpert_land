import { Navigate } from 'react-router-dom';

const SupportPage = () => {
  return <Navigate to="/dashboard/help?tab=support" replace />;
};

export default SupportPage;
