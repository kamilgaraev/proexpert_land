import type { LegalDocumentMeta } from '@/types/marketing';
import bundle from '@/data/legal/2026-10-10.json';
import previousBundle from '@/data/legal/2026-10-06.json';
import previousOctoberBundle from '@/data/legal/2026-10-07.json';
import previousOctoberSecondBundle from '@/data/legal/2026-10-07.2.json';

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
  [{ date: '2026-10-06', bundle: previousBundle }, { date: '2026-10-07', bundle: previousOctoberBundle }, { date: '2026-10-07.2', bundle: previousOctoberSecondBundle }].flatMap(({ date, bundle: archivedBundle }) => Object.entries(archivedBundle.documents).map(([key, document]) => [`${date}:${key}`, {
    ...document,
    path: `/legal/archive/${date}${document.path}`,
    version: archivedBundle.version,
    updatedAt: archivedBundle.updatedAt,
    seo: { title: `${document.title} | Архив МОСТ`, description: document.intro, keywords: 'МОСТ, архив юридических документов', noIndex: true },
  }])),
);
