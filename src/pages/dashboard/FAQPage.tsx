import { Navigate } from 'react-router-dom';

const FAQPage = () => {
  return <Navigate to="/dashboard/help?tab=faq" replace />;
};

export default FAQPage;
