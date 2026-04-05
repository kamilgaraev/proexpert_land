import ReactDOMServer from 'react-dom/server';
// @ts-ignore
import { escapeInject, dangerouslySkipEscape, type PageContextServer } from 'vite-plugin-ssr';
// @ts-ignore
import { StaticRouter } from 'react-router-dom/server';
import { PageShell } from './PageShell';
import { buildServerSeoPayload } from './serverSeo';

export async function render(pageContext: PageContextServer) {
  const pathname = pageContext.urlPathname || '/';
  const seoPayload = buildServerSeoPayload(pathname, pageContext.documentProps as any);

  if (seoPayload.redirectTarget) {
    return {
      documentHtml: '',
      pageContext: {
        httpResponse: {
          statusCode: 301,
          headers: {
            Location: seoPayload.redirectTarget,
            'Content-Type': 'text/plain; charset=utf-8',
          },
          body: '',
        },
      },
    };
  }

  const { Page, pageProps } = pageContext;
  const html = ReactDOMServer.renderToString(
    <StaticRouter location={pathname}>
      <PageShell pageContext={pageContext}>
        <Page {...pageProps} />
      </PageShell>
    </StaticRouter>,
  );

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="${seoPayload.lang}">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        ${escapeInject`<title>${seoPayload.title}</title>`}
        ${dangerouslySkipEscape(seoPayload.allMeta)}
        ${dangerouslySkipEscape(seoPayload.faviconTags)}
        <link rel="canonical" href="${seoPayload.canonicalUrl}" />
        ${dangerouslySkipEscape(seoPayload.structuredDataTag)}
      </head>
      <body>
        <div id="root">${dangerouslySkipEscape(html)}</div>
      </body>
    </html>`;

  return {
    documentHtml,
    pageContext: {
      httpResponse: {
        statusCode: seoPayload.statusCode,
        contentType: 'text/html; charset=utf-8',
      },
    },
  };
}

export const passToClient = ['pageProps', 'documentProps'];
