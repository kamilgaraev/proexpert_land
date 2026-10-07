import type { LegalDocumentMeta } from '@/types/marketing';
import bundle from '@/data/legal/2026-10-07.json';
import previousBundle from '@/data/legal/2026-10-06.json';

export const LEGAL_VERSION = bundle.version;
export const legalDocuments: Record<string, LegalDocumentMeta> = Object.fromEntries(
  Object.entries(bundle.documents).map(([key, document]) => [key, {
    ...document,
    version: bundle.version,
    updatedAt: bundle.updatedAt,
    seo: { title: `${document.title} | МОСТ`, description: document.intro, keywords: 'МОСТ, юридические документы', noIndex: true },
  }]),
);

export const archivedLegalDocuments: Record<string, LegalDocumentMeta> = Object.fromEntries(
  Object.entries(previousBundle.documents).map(([key, document]) => [`2026-10-06:${key}`, {
    ...document,
    path: `/legal/archive/2026-10-06${document.path}`,
    version: previousBundle.version,
    updatedAt: previousBundle.updatedAt,
    seo: { title: `${document.title} | Архив МОСТ`, description: document.intro, keywords: 'МОСТ, архив юридических документов', noIndex: true },
  }]),
);
