import { expect, it, vi } from 'vitest';

const imports = vi.hoisted(() => ({ loaded: vi.fn(), styles: vi.fn() }));
vi.mock('../index.css', () => { imports.styles(); return {}; });
vi.mock('./PrivatePageShell', () => { imports.loaded(); return { default: () => null }; });

it('loads full styles and private providers for a holding home page', async () => {
  const loader = await import('./pageShellLoader');
  await loader.preparePageShell('/', 'company.xn--1-xtbgmf.xn--p1ai');
  expect(imports.styles).toHaveBeenCalledOnce();
  expect(imports.loaded).toHaveBeenCalledOnce();
});
