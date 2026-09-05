import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Link, MemoryRouter } from 'react-router-dom';
import { CabinetDomainGuard } from './CabinetDomainGuard';
import { getCabinetRedirect } from '../utils/cabinetRedirect';

const cabinetOrigin = 'https://lk.xn--1-xtbgmf.xn--p1ai';

vi.mock('./common/AppLoadingFallback', () => ({
  AppLoadingFallback: () => <div>Переход в кабинет</div>,
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('cabinet domain navigation', () => {
  it.each(['1мост.рф', 'www.1мост.рф', 'xn--1-xtbgmf.xn--p1ai', 'www.xn--1-xtbgmf.xn--p1ai'])(
    'moves login from %s to the cabinet',
    (hostname) => {
      expect(getCabinetRedirect(hostname, '/login')).toBe(`${cabinetOrigin}/login`);
    },
  );

  it.each(['/login/', '/LOGIN', '/register', '/forgot-password', '/verify-email', '/email-sent', '/invitations/accept', '/dashboard', '/dashboard/projects/42', '/landing/multi-organization/dashboard'])(
    'preserves the destination and parameters for %s',
    (pathname) => {
      expect(getCabinetRedirect('1мост.рф', pathname, '?token=test&next=%2Fdashboard', '#step'))
        .toBe(`${cabinetOrigin}${pathname}?token=test&next=%2Fdashboard#step`);
    },
  );

  it.each(['lk.xn--1-xtbgmf.xn--p1ai', 'admin.xn--1-xtbgmf.xn--p1ai', 'customer.xn--1-xtbgmf.xn--p1ai', 'holding.xn--1-xtbgmf.xn--p1ai', 'localhost', '127.0.0.1', '1мост.рф.attacker.test'])(
    'leaves %s unchanged',
    (hostname) => expect(getCabinetRedirect(hostname, '/login')).toBeNull(),
  );

  it.each(['/', '/pricing', '/blog/article', '/dashboard-public', '/login-help', '//attacker.test/login'])(
    'leaves public or unrelated path %s unchanged',
    (pathname) => expect(getCabinetRedirect('1мост.рф', pathname)).toBeNull(),
  );

  it('redirects before mounting the login form', () => {
    const replace = vi.fn();
    vi.stubGlobal('location', { hostname: 'xn--1-xtbgmf.xn--p1ai', replace });
    const Login = vi.fn(() => <div>Форма входа</div>);

    render(<MemoryRouter initialEntries={['/login?next=%2Fdashboard']}>
      <CabinetDomainGuard><Login /></CabinetDomainGuard>
    </MemoryRouter>);

    expect(replace).toHaveBeenCalledWith(`${cabinetOrigin}/login?next=%2Fdashboard`);
    expect(Login).not.toHaveBeenCalled();
  });

  it('handles navigation from a public page without mounting cabinet content', () => {
    const replace = vi.fn();
    vi.stubGlobal('location', { hostname: 'xn--1-xtbgmf.xn--p1ai', replace });
    render(<MemoryRouter initialEntries={['/']}>
      <CabinetDomainGuard><Link to="/login">Войти</Link></CabinetDomainGuard>
    </MemoryRouter>);

    expect(replace).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('link', { name: 'Войти' }));
    expect(replace).toHaveBeenCalledWith(`${cabinetOrigin}/login`);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('renders the login form on the cabinet domain without a redirect loop', () => {
    const replace = vi.fn();
    vi.stubGlobal('location', { hostname: 'lk.xn--1-xtbgmf.xn--p1ai', replace });
    render(<MemoryRouter initialEntries={['/login']}>
      <CabinetDomainGuard><div>Форма входа</div></CabinetDomainGuard>
    </MemoryRouter>);

    expect(screen.getByText('Форма входа')).toBeTruthy();
    expect(replace).not.toHaveBeenCalled();
  });
});
