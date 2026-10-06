const shared = require('./tailwind.config.js');

module.exports = {
  ...shared,
  content: {
    relative: true,
    files: [
      './src/pages/index.page.tsx',
      './src/pages/landing/{HomePage,LandingPage}.tsx',
      './src/components/landing/{MarketingShell,Navbar,Footer,ContactForm,MarketingScrollbar,HeroBridgeVideo}.tsx',
      './src/components/marketing/CookieBanner.tsx',
      './src/components/shared/{NotificationService,SuccessModal}.{ts,tsx}',
      './src/renderer/PageShell.tsx',
    ],
  },
};
