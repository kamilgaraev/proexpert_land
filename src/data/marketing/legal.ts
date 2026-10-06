import type { LegalDocumentMeta } from '@/types/marketing';
import bundle from '@/data/legal/2026-10-06.json';

export const LEGAL_VERSION = bundle.version;
export const legalDocuments: Record<string, LegalDocumentMeta> = Object.fromEntries(
  Object.entries(bundle.documents).map(([key, document]) => [key, {
    ...document,
    version: bundle.version,
    updatedAt: bundle.updatedAt,
    seo: { title: `${document.title} | МОСТ`, description: document.intro, keywords: 'МОСТ, юридические документы', noIndex: true },
  }]),
);
