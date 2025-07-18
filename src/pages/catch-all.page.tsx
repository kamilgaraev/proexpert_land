import App from '@/App';

// Основная страница, обслуживающая все URL (SSR → React Router внутри)
export const Page = () => <App />;

// Client-side routing уже включена в _default.page.client.tsx

// Поскольку SEO вычисляется в _default.page.server.tsx через slug,
// здесь никаких documentProps не задаём — хватит fallback-логики. 