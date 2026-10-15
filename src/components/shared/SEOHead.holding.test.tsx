import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SEOHead } from './SEOHead';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); document.head.innerHTML = ''; });

describe('holding client metadata', () => {
  it('preserves the tenant canonical and og:url after hydration', () => {
    const url = new URL('https://company.1мост.рф/about');
    vi.stubGlobal('location', url);
    render(<SEOHead title="О компании" />);
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(url.href);
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(url.href);
  });

  it.each(['/login', '/dashboard', '/reports/projects', '/landing/editor', '/holding/7/landing/edit'])(
    'keeps the protected path %s out of the index', (pathname) => {
      vi.stubGlobal('location', new URL(`https://company.1мост.рф${pathname}`));
      render(<SEOHead title="Панель холдинга" />);
      expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow');
      expect(document.querySelector('meta[name="googlebot"]')?.getAttribute('content')).toBe('noindex, nofollow');
    },
  );
});
