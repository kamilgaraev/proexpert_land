import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { LegalDocumentView } from '@/components/marketing/MarketingPrimitives';
import { LEGAL_CONTENT_SHA256, LEGAL_DOCUMENT_VERSION } from '@/data/legal/contentHash';
import { LEGAL_VERSION, legalDocuments, legalProvider } from '@/data/marketing/legal';

vi.mock('@/hooks/useSEO', () => ({ useSEO: vi.fn() }));
vi.mock('@/hooks/useLegalManifest', () => ({ useLegalManifest: () => ({ manifest: null, error: 'API unavailable' }) }));

describe('Public legal documents', () => {
  it.each(Object.keys(legalDocuments))('publishes provider details for %s without waiting for the API', (documentKey) => {
    const html = renderToStaticMarkup(<MemoryRouter><LegalDocumentView documentKey={documentKey} /></MemoryRouter>);
    expect(html).toContain(legalProvider.name);
    expect(html).toContain(legalProvider.inn);
    expect(html).toContain(legalProvider.registration_number);
    expect(html).toContain(legalProvider.address);
    expect(html).toContain('info@1мост.рф');
    expect(html).toContain('id="requisites"');
    expect(html).not.toContain('/legal/archive/');
    expect(html).not.toContain('Архив редакции');
    expect(html).not.toContain('__________');
  });

  it('matches the exact published bundle bytes used by the API', () => {
    const bytes = readFileSync(path.resolve(process.cwd(), 'src/data/legal/2026-10-15.json'));
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(LEGAL_CONTENT_SHA256);
    expect(LEGAL_VERSION).toBe(LEGAL_DOCUMENT_VERSION);
  });
});
