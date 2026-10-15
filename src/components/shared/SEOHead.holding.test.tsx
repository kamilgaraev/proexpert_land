import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SEOHead } from './SEOHead';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); document.head.innerHTML = ''; document.documentElement.lang = 'ru'; });

describe('holding client metadata', () => {
  it.each(['locale=en', 'lang=en'])('keeps normalized locale in the canonical after hydration for %s', (query) => {
    vi.stubGlobal('location', new URL(`https://company.1мост.рф/about?${query}&token=private&tracking=discard`));
    render(<SEOHead title="About" lang="en" />);
    const canonical = 'https://company.xn--1-xtbgmf.xn--p1ai/about?locale=en';
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(canonical);
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(canonical);
  });
  it('updates the document language when localized content changes', () => {
    vi.stubGlobal('location', new URL('https://company.1мост.рф/about?locale=en'));
    const { rerender } = render(<SEOHead title="About" lang="en" />);
    expect(document.documentElement.lang).toBe('en');
    rerender(<SEOHead title="О компании" lang="ru" />);
    expect(document.documentElement.lang).toBe('ru');
  });
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
