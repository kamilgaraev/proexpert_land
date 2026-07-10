interface ServerRouterPageContext {
  urlOriginal?: unknown;
  urlPathname?: unknown;
}

export const resolveServerRouterLocation = (pageContext: ServerRouterPageContext) => {
  if (typeof pageContext.urlOriginal === 'string' && pageContext.urlOriginal.startsWith('/')) {
    return pageContext.urlOriginal;
  }

  if (typeof pageContext.urlPathname === 'string' && pageContext.urlPathname.startsWith('/')) {
    return pageContext.urlPathname;
  }

  return '/';
};
