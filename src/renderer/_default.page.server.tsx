import React from 'react';
import ReactDOMServer from 'react-dom/server';
// @ts-expect-error vite-plugin-ssr 0.4.x не экспортирует типы, но они нужны
import { escapeInject, dangerouslySkipEscape, type PageContextServer } from 'vite-plugin-ssr/server';
// @ts-expect-error типы для server-рендера есть в react-router-dom, но могут конфликтовать с версиями TS
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