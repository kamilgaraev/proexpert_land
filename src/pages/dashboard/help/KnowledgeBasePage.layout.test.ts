import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const currentDir = dirname(fileURLToPath(import.meta.url));
const pageSource = readFileSync(join(currentDir, 'KnowledgeBasePage.tsx'), 'utf8');

describe('KnowledgeBasePage layout', () => {
  it('keeps search and featured materials in the main flow before the article tree', () => {
    const searchIndex = pageSource.indexOf('<KnowledgeHubSearch');
    const treeIndex = pageSource.indexOf('<ArticleTree nodes={tree} />');

    expect(searchIndex).toBeGreaterThan(-1);
    expect(treeIndex).toBeGreaterThan(-1);
    expect(searchIndex).toBeLessThan(treeIndex);
  });

  it('does not use the tree/sidebar grid that compresses the whole knowledge base flow', () => {
    expect(pageSource).not.toContain('xl:grid-cols-[280px_minmax(0,1fr)]');
  });
});
