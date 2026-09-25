import axios from 'axios';
import api, { API_URL } from '@utils/api';

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

export const projectParticipantInvitationsApi = {
  async getByToken(token: string): Promise<LandingResponse<ProjectParticipantInvitation>> {
    const response = await publicApi.get<LandingResponse<ProjectParticipantInvitation>>(
      `/project-participant-invitations/${encodeURIComponent(token)}`,
    );
    return response.data;
  },

  async accept(token: string): Promise<LandingResponse<AcceptedProjectParticipantInvitation>> {
    const response = await api.post<LandingResponse<AcceptedProjectParticipantInvitation>>(
      `/project-participant-invitations/${encodeURIComponent(token)}/accept`,
    );
    return response.data;
  },
};
