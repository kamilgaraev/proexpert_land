import LandingPage from '@pages/landing/LandingPage';
import { marketingSeo } from '@/data/marketingRegistry';

export const Page = () => <LandingPage />;

export const prerender = true;

export const documentProps = {
  title: marketingSeo.home.title,
  description: marketingSeo.home.description,
};
