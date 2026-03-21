import { useNavigate } from 'react-router-dom';
import { OnboardingWizard } from '@/components/dashboard/onboarding/OnboardingWizard';

export const OnboardingPage = () => {
  const navigate = useNavigate();

  const handleComplete = (defaultRoute?: string) => {
    navigate(defaultRoute || '/dashboard');
  };

  return <OnboardingWizard onComplete={handleComplete} />;
};

