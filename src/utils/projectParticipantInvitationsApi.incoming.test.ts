import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('@utils/api', async () => {
  const { default: httpClient } = await vi.importActual<typeof import('axios')>('axios');
  return {
    API_URL: 'https://api.test/api/v1/landing',
    authApi: httpClient.create({ baseURL: 'https://api.test/api/v1/landing', adapter: 'http' }),
    withRefreshedAuthSession: async (operation: (session: { token: string; csrfToken: string }) => unknown) => operation({ token: 'current-owner-token', csrfToken: 'current-csrf-token' }),
  };
});
import { projectParticipantInvitationsApi } from './projectParticipantInvitationsApi';

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('API списка входящих приглашений', () => {
  it('использует текущую сессию и сохраняет метаданные пагинации LandingResponse', async () => {
    const payload = { success: true, data: [], meta: { current_page: 2, last_page: 2, total: 21, per_page: 20 } };
    server.use(http.get('https://api.test/api/v1/landing/project-participant-invitations', ({ request }) => {
      const url = new URL(request.url);
      expect(request.headers.get('Authorization')).toBe('Bearer current-owner-token');
      expect(request.headers.get('X-CSRF-Token')).toBe('current-csrf-token');
      expect(url.searchParams.get('page')).toBe('2');
      expect(url.searchParams.get('per_page')).toBe('20');
      expect(url.searchParams.has('organization_id')).toBe(false);
      return HttpResponse.json(payload);
    }));

    expect(await projectParticipantInvitationsApi.listIncoming(2)).toEqual(payload);
  });
});
