import LandingPage from '@pages/landing/LandingPage';

export const Page = () => <LandingPage />;

export const prerender = true;

export const documentProps = {
  title: 'ProHelper — цифровая экосистема для стройки',
  description: 'Автоматизация учета материалов, контроль бюджета и координация команд на строительных проектах.'
}; 