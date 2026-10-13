import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ post: vi.fn(), mutate: vi.fn() }));
vi.mock('@utils/api', () => ({ API_URL: 'https://api.test', authApi: { post: mocks.post }, withRefreshedAuthSession: mocks.mutate }));
import { projectParticipantInvitationsApi } from './projectParticipantInvitationsApi';

describe('project invitation CSRF proof', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mutate.mockImplementation(async operation => operation({ token: 'fresh-access', csrfToken: 'fresh-csrf' }));
  });

  it('accepts an invitation with current credentials under the shared auth operation', async () => {
    const payload = { success: true, data: { invitation: { id: 1, status: 'accepted', accepted_at: null }, project: { id: 2, name: 'Project' }, organization: { id: 3, name: 'Company' } } };
    mocks.post.mockResolvedValue({ data: payload });
    expect(await projectParticipantInvitationsApi.accept('private/token')).toEqual(payload);
    expect(mocks.mutate).toHaveBeenCalledTimes(1);
    expect(mocks.post).toHaveBeenCalledWith('/project-participant-invitations/private%2Ftoken/accept', undefined,
      { headers: { Authorization: 'Bearer fresh-access', 'X-CSRF-Token': 'fresh-csrf' } });
  });
});
