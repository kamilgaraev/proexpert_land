import { describe, expect, it, vi } from 'vitest';
import type { Plugin, ResolvedConfig } from 'vite';
import { ssrBuildCompatibility } from './ssrBuildCompatibility';

type Transform = Extract<NonNullable<Plugin['transform']>, (...args: never[]) => unknown>;

function configure(ssr: boolean, command: 'build' | 'serve' = 'build') {
  const transform = vi.fn(function (this: unknown, code: string, _id: string, options?: { ssr?: boolean }) {
    if (options && options.ssr !== ssr) throw new Error('SSR environment mismatch');
    return `${code}:${ssr ? 'server' : 'client'}`;
  });
  const target: Plugin = { name: 'vite-plugin-ssr:env', transform };
  const unrelated: Plugin = { name: 'unrelated', transform: vi.fn() };
  const adapter = ssrBuildCompatibility();
  const hook = adapter.configResolved;
  if (typeof hook !== 'function') throw new Error('Missing config hook');
  hook({ command, build: { ssr }, plugins: [target, unrelated] } as ResolvedConfig);
  return { target, transform, unrelated, adapter };
}

function invoke(target: Plugin, options?: Record<string, unknown>) {
  const context = { marker: 'original plugin context' };
  const transform = target.transform as Transform;
  return { result: transform.call(context as ThisParameterType<Transform>, 'source', '/entry.ts', options), context };
}

describe('SSR build transform compatibility', () => {
  it.each([false, true])('preserves build environment %s with Rollup attributes', ssr => {
    const { target, transform } = configure(ssr);
    const options = { attributes: { type: 'json' } };
    const { context, result } = invoke(target, options);
    expect(result).toBe(`source:${ssr ? 'server' : 'client'}`);
    expect(transform).toHaveBeenCalledWith('source', '/entry.ts', { attributes: { type: 'json' }, ssr });
    expect(transform.mock.contexts[0]).toBe(context);
    expect(options).toEqual({ attributes: { type: 'json' } });
  });

  it('does not suppress a conflicting explicit SSR environment', () => {
    const { target } = configure(false);
    expect(() => invoke(target, { ssr: true })).toThrow('SSR environment mismatch');
  });

  it('preserves calls without transform options', () => {
    const { target, transform } = configure(false);
    invoke(target);
    expect(transform).toHaveBeenCalledWith('source', '/entry.ts', undefined);
  });

  it('leaves dev transforms and unrelated plugins untouched', () => {
    const { target, transform, unrelated, adapter } = configure(false, 'serve');
    expect(target.transform).toBe(transform);
    expect(adapter.apply).toBe('build');
    expect(unrelated.transform).not.toHaveBeenCalled();
  });
});
