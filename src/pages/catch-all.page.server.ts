export function onBeforeRender(pageContext: any) {
  const url = pageContext.urlPathname || '/';
  
  const validRoutes = [
    '/',
    '/solutions',
    '/features',
    '/pricing',
    '/login',
    '/register',
    '/forgot-password',
    '/docs',
    '/help',
    '/about',
    '/press',
    '/partners',
    '/contact',
    '/admin/login',
  ];

  const validPrefixes = [
    '/dashboard',
    '/admin',
    '/blog',
    '/landing',
  ];

  const isValidRoute = validRoutes.includes(url) || 
    validPrefixes.some(prefix => url.startsWith(prefix));

  if (!isValidRoute) {
    return {
      pageContext: {
        httpResponse: {
          statusCode: 404,
          contentType: 'text/html',
        }
      }
    };
  }

  return {
    pageContext: {}
  };
}

