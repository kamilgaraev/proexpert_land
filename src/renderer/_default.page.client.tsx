import { hydrateRoot } from 'react-dom/client';
// @ts-expect-error vite-plugin-ssr предоставляет типы в рантайме
import type { PageContextClient } from 'vite-plugin-ssr/client';
import { PageShell } from './PageShell';
import { BrowserRouter } from 'react-router-dom';

export const clientRouting = true;

export async function render(pageContext: PageContextClient) {
  const { Page, pageProps } = pageContext;
  hydrateRoot(
    document.getElementById('root') as HTMLElement,
    <BrowserRouter>
      <PageShell pageContext={pageContext}>
        <Page {...pageProps} />
      </PageShell>
    </BrowserRouter>,
  );
} 