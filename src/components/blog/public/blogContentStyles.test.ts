import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import { describe, expect, it } from 'vitest';

const compileBlogStyles = async (): Promise<string> => {
  const source = await readFile(resolve(process.cwd(), 'src/index.css'), 'utf8');
  const result = await postcss([
    tailwindcss(resolve(process.cwd(), 'tailwind.config.js')),
  ]).process(source, { from: resolve(process.cwd(), 'src/index.css') });

  return result.css;
};

const includesRule = (css: string, pattern: RegExp): boolean => pattern.test(css);

describe('blog article typography', () => {
  it('renders unordered and ordered lists with visible markers', async () => {
    const css = await compileBlogStyles();

    expect(includesRule(css, /\.blog-content ul[^}]*list-style-type:\s*disc/s)).toBe(true);
    expect(includesRule(css, /\.blog-content ol[^}]*list-style-type:\s*decimal/s)).toBe(true);
  });

  it('styles figures, captions, nested lists and notes as article elements', async () => {
    const css = await compileBlogStyles();

    expect(includesRule(css, /\.blog-content figure[^}]*margin-top:/s)).toBe(true);
    expect(includesRule(css, /\.blog-content figcaption[^}]*text-align:\s*center/s)).toBe(true);
    expect(includesRule(css, /\.blog-content li\s*>\s*ul/s)).toBe(true);
    expect(includesRule(css, /\.blog-content small[^}]*font-size:/s)).toBe(true);
  });
});
