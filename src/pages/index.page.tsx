import LandingPage from '@pages/landing/LandingPage';

export const Page = () => <LandingPage />;

export const prerender = true;

export const documentProps = {
  title: 'ProHelper - цифровая система для строительных компаний',
  description:
    'ProHelper помогает строительным компаниям связать проекты, снабжение, документы, финансы, аналитику и AI в одной платформе.',
};
