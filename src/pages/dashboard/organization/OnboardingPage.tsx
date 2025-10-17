import { useNavigate } from 'react-router-dom';
import { OnboardingWizard } from '@/components/dashboard/onboarding/OnboardingWizard';

export const OnboardingPage = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate('/dashboard');
  };

  return <OnboardingWizard onComplete={handleComplete} />;
};

