import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LEGAL_CONTENT_SHA256, LEGAL_DOCUMENT_VERSION } from './contentHash';
import bundle from './2026-10-15.bank.json';

describe('Оферта банковской оплаты', () => {
  it('сохраняет точный хеш опубликованного bundle', () => {
    const bytes = readFileSync(resolve(process.cwd(), 'src/data/legal/2026-10-15.bank.json'));
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(LEGAL_CONTENT_SHA256);
    expect(bundle.version).toBe(LEGAL_DOCUMENT_VERSION);
  });
});
