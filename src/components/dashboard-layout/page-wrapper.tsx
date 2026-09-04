
import { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const PageWrapper = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return (
    <div key={location.pathname} className="most-workspace-page flex-1">
      {children}
    </div>
  );
};

