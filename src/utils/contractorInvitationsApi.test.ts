import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { contractorInvitationsService } from './contractorInvitationsApi';

const invitationFixture = {
  id: 10,
  token: 'invite-token',
  status: 'pending',
  invitation_message: 'Join as contractor',
  expires_at: '2026-05-01T10:00:00.000000Z',
  created_at: '2026-04-25T10:00:00.000000Z',
  is_expired: false,
  can_be_accepted: true,
  from_organization: {
    id: 4,
    name: 'Builder LLC',
    city: 'Kazan',
    is_verified: true,
  },
  invited_by: {
    name: 'Manager',
    email: 'manager@example.test',
  },
};

const server = setupServer(
  http.get('https://api.prohelper.pro/api/v1/landing/contractor-invitations', () =>
    HttpResponse.json({
      success: true,
      message: null,
      data: {
        data: {
          data: [invitationFixture],
          pagination: {
            current_page: 1,
            last_page: 1,
            per_page: 15,
            total: 1,
            from: 1,
            to: 1,
            has_more_pages: false,
          },
        },
        meta: {
          type: 'received',
          filters: {},
        },
      },
    }),
  ),
);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe('contractorInvitationsService', () => {
  it('unwraps nested LandingResponse collection payload for incoming invitations', async () => {
    const response = await contractorInvitationsService.getIncomingInvitations();

    expect(response.data).toHaveLength(1);
    expect(response.data[0]?.id).toBe(10);
    expect(response.pagination.current_page).toBe(1);
    expect(response.pagination.has_more_pages).toBe(false);
    expect(response.meta.type).toBe('received');
  });
});
