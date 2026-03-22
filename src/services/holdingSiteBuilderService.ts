import { API_URL, getTokenFromStorages } from '@/utils/api';
import type {
  ApiEnvelope,
  BuilderWorkspaceData,
  EditorAsset,
  EditorCollaborator,
  EditorPage,
  EditorSection,
  LeadEntry,
  LeadSubmissionPayload,
  LeadSummary,
  PublicSitePayload,
  SiteBlogArticle,
  SiteRevision,
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

const requestJsonAuth = <T>(path: string, method: string, payload?: unknown) =>
  requestAuth<T>(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });

const requestPublicApi = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const headers = new Headers(init?.headers);
  headers.set('Accept', 'application/json');

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });

  return parseEnvelope<T>(response);
};

export const holdingSiteBuilderService = {
  getWorkspace: () => requestAuth<BuilderWorkspaceData>('/holding/site'),
  updateSite: (payload: Record<string, unknown>) => requestJsonAuth<BuilderWorkspaceData>('/holding/site', 'PUT', payload),
  publishSite: () => requestJsonAuth<BuilderWorkspaceData>('/holding/site/publish', 'POST'),
  getPages: () => requestAuth<EditorPage[]>('/holding/site/pages'),
  createPage: (payload: Record<string, unknown>) => requestJsonAuth<EditorPage>('/holding/site/pages', 'POST', payload),
  updatePage: (pageId: number | string, payload: Record<string, unknown>) =>
    requestJsonAuth<EditorPage>(`/holding/site/pages/${pageId}`, 'PUT', payload),
  deletePage: (pageId: number | string) => requestAuth<EditorPage[]>(`/holding/site/pages/${pageId}`, { method: 'DELETE' }),
  reorderPages: (pageOrder: Array<number | string>) =>
    requestJsonAuth<EditorPage[]>('/holding/site/pages/reorder', 'PUT', { page_order: pageOrder }),
  createSection: (pageId: number | string, payload: Record<string, unknown>) =>
    requestJsonAuth<EditorSection>(`/holding/site/pages/${pageId}/sections`, 'POST', payload),
  updateSection: (pageId: number | string, sectionId: number, payload: Record<string, unknown>) =>
    requestJsonAuth<EditorSection>(`/holding/site/pages/${pageId}/sections/${sectionId}`, 'PUT', payload),
  deleteSection: (pageId: number | string, sectionId: number) =>
    requestAuth<EditorPage>(`/holding/site/pages/${pageId}/sections/${sectionId}`, { method: 'DELETE' }),
  duplicateSection: (sectionId: number) =>
    requestJsonAuth<EditorSection>(`/holding/site/sections/${sectionId}/duplicate`, 'POST'),
  reorderSections: (pageId: number | string, sectionOrder: number[]) =>
    requestJsonAuth<EditorPage>(`/holding/site/pages/${pageId}/sections/reorder`, 'PUT', {
      section_order: sectionOrder,
    }),
  getRevisions: () => requestAuth<SiteRevision[]>('/holding/site/revisions'),
  rollbackRevision: (revisionId: number) =>
    requestJsonAuth<BuilderWorkspaceData>(`/holding/site/rollback/${revisionId}`, 'POST'),
  getCollaborators: () => requestAuth<EditorCollaborator[]>('/holding/site/collaborators'),
  createCollaborator: (payload: { user_id: number; role: string }) =>
    requestJsonAuth<EditorCollaborator[]>('/holding/site/collaborators', 'POST', payload),
  updateCollaborator: (collaboratorId: number, payload: { role: string }) =>
    requestJsonAuth<EditorCollaborator[]>(`/holding/site/collaborators/${collaboratorId}`, 'PUT', payload),
  deleteCollaborator: (collaboratorId: number) =>
    requestAuth<EditorCollaborator[]>(`/holding/site/collaborators/${collaboratorId}`, { method: 'DELETE' }),
  getBlogArticles: () => requestAuth<SiteBlogArticle[]>('/holding/site/blog/articles'),
  createBlogArticle: (payload: Record<string, unknown>) =>
    requestJsonAuth<SiteBlogArticle>('/holding/site/blog/articles', 'POST', payload),
  updateBlogArticle: (articleId: number, payload: Record<string, unknown>) =>
    requestJsonAuth<SiteBlogArticle>(`/holding/site/blog/articles/${articleId}`, 'PUT', payload),
  deleteBlogArticle: (articleId: number) =>
    requestAuth<SiteBlogArticle[]>(`/holding/site/blog/articles/${articleId}`, { method: 'DELETE' }),
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
    requestJsonAuth<EditorAsset>(`/holding/site/assets/${assetId}`, 'PUT', { metadata }),
  deleteAsset: (assetId: number) =>
    requestAuth<{ deleted_asset_id: number }>(`/holding/site/assets/${assetId}`, { method: 'DELETE' }),
  getLeads: () => requestAuth<LeadEntry[]>('/holding/site/leads'),
  getLeadSummary: () => requestAuth<LeadSummary>('/holding/site/leads/summary'),
};

export const publicHoldingSiteService = {
  getSiteData: (pathname = window.location.pathname, search = window.location.search) => {
    const params = new URLSearchParams(search);
    params.set('site_domain', window.location.hostname);
    params.set('path', pathname || '/');

    return requestPublicApi<PublicSitePayload>(`/holding/public/site-data?${params.toString()}`);
  },
  submitLead: (payload: LeadSubmissionPayload) =>
    requestPublicApi<LeadEntry>('/holding/public/site-leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        site_domain: window.location.hostname,
        source_url: payload.source_url ?? window.location.href,
      }),
    }),
};

export { BuilderApiError };
