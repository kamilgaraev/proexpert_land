import LandingPage from '@pages/landing/LandingPage';
import MarketingShell from '@/components/landing/MarketingShell';
import { marketingSeo } from '@/data/marketingRegistry';

export const Page = () => (
  <MarketingShell>
    <LandingPage />
  </MarketingShell>
);

export const prerender = true;

export const documentProps = {
  title: marketingSeo.home.title,
  description: marketingSeo.home.description,
};
