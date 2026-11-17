import axios from 'axios';
import { authApi, API_URL, withRefreshedAuthSession } from '@utils/api';

const publicApi = axios.create({
  baseURL: API_URL,
  withCredentials: false,
  headers: { Accept: 'application/json' },
});

export type LandingResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type ProjectParticipantInvitation = {
  status: string;
  can_accept: boolean;
  project: { id: number | string; name: string };
  role: string | { name: string; slug?: string };
  invited_organization: { id: number | string; name: string } | null;
  expires_at: string | null;
  next_action: 'login' | 'register' | 'accept' | 'unavailable' | string;
};

export type AcceptedProjectParticipantInvitation = {
  invitation: { id: number | string; status: string; accepted_at: string | null };
  project: { id: number | string; name: string };
  organization: { id: number | string; name: string };
};

export type IncomingProjectInvitation = {
  id: number;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled' | 'declined';
  can_accept: boolean;
  project: { id: number; name: string };
  inviting_organization: { id: number; name: string } | null;
  role: { slug: string; name: string };
  message: string | null;
  created_at: string | null;
  expires_at: string | null;
  accepted_at: string | null;
  invitation_path: string | null;
};

export type IncomingProjectInvitationsResponse = LandingResponse<IncomingProjectInvitation[]> & {
  meta: { current_page: number; last_page: number; per_page: number; total: number };
};

export const projectParticipantInvitationsApi = {
  async listIncoming(page = 1, signal?: AbortSignal): Promise<IncomingProjectInvitationsResponse> {
    const response = await withRefreshedAuthSession(session => authApi.get<IncomingProjectInvitationsResponse>(
      '/project-participant-invitations',
      {
        headers: { Authorization: `Bearer ${session.token}`, 'X-CSRF-Token': session.csrfToken },
        params: { page, per_page: 20 },
        signal,
      },
    ));
    return response.data;
  },

  async getByToken(token: string): Promise<LandingResponse<ProjectParticipantInvitation>> {
    const response = await publicApi.get<LandingResponse<ProjectParticipantInvitation>>(
      `/project-participant-invitations/${encodeURIComponent(token)}`,
    );
    return response.data;
  },

  async accept(token: string): Promise<LandingResponse<AcceptedProjectParticipantInvitation>> {
    const response = await withRefreshedAuthSession(session => authApi.post<LandingResponse<AcceptedProjectParticipantInvitation>>(
      `/project-participant-invitations/${encodeURIComponent(token)}/accept`,
      undefined,
      { headers: { Authorization: `Bearer ${session.token}`, 'X-CSRF-Token': session.csrfToken } },
    ));
    return response.data;
  },
};
