import ReactDOMServer from 'react-dom/server';
// @ts-ignore vite-plugin-ssr может не предоставлять типы в версии 0.4.x
import { escapeInject, dangerouslySkipEscape, type PageContextServer } from 'vite-plugin-ssr/server';
// @ts-ignore типы для server-рендера есть в react-router-dom, могут конфликтовать с TS
import { StaticRouter } from 'react-router-dom/server';
import { PageShell } from './PageShell';

export async function render(pageContext: PageContextServer) {
  const { Page, pageProps, documentProps } = pageContext;

  const html = ReactDOMServer.renderToString(
    <StaticRouter location={pageContext.urlPathname || '/'}>
      <PageShell pageContext={pageContext}>
        <Page {...pageProps} />
      </PageShell>
    </StaticRouter>,
  );

  const { title, description } = documentProps || {};

  return escapeInject`<!DOCTYPE html>
    <html lang="ru">
      <head>
        <meta charset="UTF-8" />
        ${title ? escapeInject`<title>${title}</title>` : ''}
        ${description ? escapeInject`<meta name="description" content="${description}" />` : ''}
      </head>
      <body>
        <div id="root">${dangerouslySkipEscape(html)}</div>
      </body>
    </html>`;
}

export const passToClient = ['pageProps', 'documentProps']; 