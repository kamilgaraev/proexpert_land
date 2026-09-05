import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from './_default.page.server';

const mocks = vi.hoisted(() => ({
  redirect: vi.fn((url: string, status: number) => ({ url, status })),
  preparePageShell: vi.fn(),
  buildServerSeoPayload: vi.fn(() => ({ redirectTarget: null })),
}));

vi.mock('vike/abort', () => ({ redirect: mocks.redirect }));
vi.mock('./pageShellLoader', () => ({ preparePageShell: mocks.preparePageShell }));
vi.mock('./serverSeo', () => ({ buildServerSeoPayload: mocks.buildServerSeoPayload }));
vi.mock('./PageShell', () => ({ PageShell: () => null }));

const renderingReached = new Error('rendering reached');

const context = (requestHostname: string, urlOriginal: string) => ({
  requestHostname,
  urlOriginal,
  urlPathname: urlOriginal.split('?')[0],
  Page: () => null,
}) as unknown as Parameters<typeof render>[0];

beforeEach(() => {
  vi.clearAllMocks();
  mocks.preparePageShell.mockRejectedValue(renderingReached);
});

describe('server cabinet redirect', () => {
  it.each(['/login', '/register', '/verify-email', '/invitations/accept', '/dashboard/projects/42'])(
    'redirects %s before loading or rendering the page',
    async (pathname) => {
      await expect(render(context('xn--1-xtbgmf.xn--p1ai', `${pathname}?token=test&next=%2Fdashboard`)))
        .rejects.toEqual({
          url: `https://lk.xn--1-xtbgmf.xn--p1ai${pathname}?token=test&next=%2Fdashboard`,
          status: 302,
        });
      expect(mocks.preparePageShell).not.toHaveBeenCalled();
      expect(mocks.buildServerSeoPayload).not.toHaveBeenCalled();
    },
  );

  it.each([
    ['xn--1-xtbgmf.xn--p1ai', '/pricing'],
    ['lk.xn--1-xtbgmf.xn--p1ai', '/login'],
    ['localhost', '/login'],
    ['', '/login'],
    ['holding.xn--1-xtbgmf.xn--p1ai', '/login'],
  ])('keeps the existing renderer for %s%s', async (hostname, path) => {
    await expect(render(context(hostname, path))).rejects.toBe(renderingReached);
    expect(mocks.redirect).not.toHaveBeenCalled();
    expect(mocks.preparePageShell).toHaveBeenCalledWith(path);
  });
});
