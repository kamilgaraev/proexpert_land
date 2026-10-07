import bundle from '@/data/legal/2026-10-06.json';
import { LEGAL_CONTENT_SHA256 } from '@/data/legal/contentHash';
import type { LegalManifest } from '@/services/legalService';

export const legalFixture: LegalManifest = {
  version: bundle.version, content_sha256: LEGAL_CONTENT_SHA256,
  privacy_ready: false, commercial_ready: false, analytics_ready: false,
  provider: { name: '', address: '', email: '', tax_status: '' },
  subprocessors: [],
  documents: Object.fromEntries(Object.entries(bundle.documents).map(([key, document]) => [key, { path: document.path, sha256: 'a'.repeat(64) }])),
};

export const analyticsProofFixture = { receiptId: '11111111-1111-4111-8111-111111111111', visitorId: '22222222-2222-4222-8222-222222222222', documentHash: 'a'.repeat(64) };
