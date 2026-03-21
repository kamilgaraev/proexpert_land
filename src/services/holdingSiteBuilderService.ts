import { API_URL, getTokenFromStorages } from '@/utils/api';
import type {
  ApiEnvelope,
  BuilderWorkspaceData,
  EditorAsset,
  EditorBlock,
  LeadEntry,
  LeadSubmissionPayload,
  LeadSummary,
  PublicSitePayload,
} from '@/types/holding-site-builder';

class BuilderApiError extends Error {
  status: number;
  errors?: unknown;

  constructor(message: string, status: number, errors?: unknown) {
    super(message);
    this.name = 'BuilderApiError';
    this.status = status;
    this.errors = errors;
  }
}

const parseEnvelope = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !payload.success) {
    throw new BuilderApiError(payload.message ?? 'Ошибка API конструктора сайта', response.status, payload.errors);
  }

  return payload.data;
};

const requestAuth = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const token = getTokenFromStorages();

  if (!token) {
    throw new BuilderApiError('Требуется авторизация', 401);
  }

  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('Accept', 'application/json');

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });

  return parseEnvelope<T>(response);
};

const requestPublic = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const headers = new Headers(init?.headers);
  headers.set('Accept', 'application/json');

  const response = await fetch(path, {
    ...init,
    headers,
  });

  return parseEnvelope<T>(response);
};

export const holdingSiteBuilderService = {
  getWorkspace: () => requestAuth<BuilderWorkspaceData>('/holding/site'),
  updateSite: (payload: Record<string, unknown>) =>
    requestAuth<BuilderWorkspaceData>('/holding/site', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }),
  publishSite: () =>
    requestAuth<BuilderWorkspaceData>('/holding/site/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  createBlock: (payload: Record<string, unknown>) =>
    requestAuth<EditorBlock>('/holding/site/blocks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }),
  updateBlock: (blockId: number, payload: Record<string, unknown>) =>
    requestAuth<EditorBlock>(`/holding/site/blocks/${blockId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }),
  duplicateBlock: (blockId: number) =>
    requestAuth<EditorBlock>(`/holding/site/blocks/${blockId}/duplicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  deleteBlock: (blockId: number) =>
    requestAuth<{ deleted_block_id: number; blocks: EditorBlock[] }>(`/holding/site/blocks/${blockId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  reorderBlocks: (blockOrder: number[]) =>
    requestAuth<EditorBlock[]>('/holding/site/blocks/reorder', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ block_order: blockOrder }),
    }),
  getAssets: () => requestAuth<EditorAsset[]>('/holding/site/assets'),
  uploadAsset: async (file: File, usageContext: string, metadata?: Record<string, unknown>) => {
    const token = getTokenFromStorages();

    if (!token) {
      throw new BuilderApiError('Требуется авторизация', 401);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('usage_context', usageContext);
    if (metadata && Object.keys(metadata).length > 0) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await fetch(`${API_URL}/holding/site/assets`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      body: formData,
    });

    return parseEnvelope<EditorAsset>(response);
  },
  updateAsset: (assetId: number, metadata: Record<string, unknown>) =>
    requestAuth<EditorAsset>(`/holding/site/assets/${assetId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ metadata }),
    }),
  deleteAsset: (assetId: number) =>
    requestAuth<{ deleted_asset_id: number }>(`/holding/site/assets/${assetId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  getLeads: () => requestAuth<LeadEntry[]>('/holding/site/leads'),
  getLeadSummary: () => requestAuth<LeadSummary>('/holding/site/leads/summary'),
};

export const publicHoldingSiteService = {
  getSiteData: (search = window.location.search) =>
    requestPublic<PublicSitePayload>(`/api/site-data${search}`),
  submitLead: (payload: LeadSubmissionPayload) =>
    requestPublic<LeadEntry>('/api/site-leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }),
};

export { BuilderApiError };
