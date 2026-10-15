import { expect, it, vi } from 'vitest';

const imports = vi.hoisted(() => ({ loaded: vi.fn(), styles: vi.fn() }));
vi.mock('../index.css', () => { imports.styles(); return {}; });
vi.mock('./PrivatePageShell', () => { imports.loaded(); return { default: () => null }; });

it('loads holding styles publicly and prepares providers only for private routes', async () => {
  const loader = await import('./pageShellLoader');
  await loader.preparePageShell('/', 'company.xn--1-xtbgmf.xn--p1ai');
  expect(imports.styles).toHaveBeenCalledOnce();
  expect(imports.loaded).not.toHaveBeenCalled();
  await loader.preparePageShell('/login', 'company.xn--1-xtbgmf.xn--p1ai');
  expect(imports.loaded).toHaveBeenCalledOnce();
  await loader.preparePageShell('/about', 'company.xn--1-xtbgmf.xn--p1ai');
  expect(imports.loaded).toHaveBeenCalledOnce();
});
