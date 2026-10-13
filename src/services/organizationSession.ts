import api, { authApi, withRefreshedAuthSession } from '../utils/api';
import { saveAuthToken, saveCsrfToken } from '../utils/authTokenStorage';

export interface OrganizationChoice { id: number; name: string }
export const organizationSession = {
  async list(): Promise<OrganizationChoice[]> {
    const response = await api.get<{ data: { organizations: OrganizationChoice[] } }>('/auth/organizations');
    return response.data.data.organizations;
  },
  async switch(id: number): Promise<void> {
    await withRefreshedAuthSession(async (session) => {
      const response = await authApi.post<{ data: { token: string; csrf_token: string } }>('/auth/organization', { organization_id: id }, {
        headers: { Authorization: `Bearer ${session.token}`, 'X-CSRF-Token': session.csrfToken },
      });
      const data = response.data.data;
      if (!data.token || !data.csrf_token) throw new Error('Не удалось обновить сессию организации');
      saveAuthToken(data.token);
      saveCsrfToken(data.csrf_token);
    });
  },
};
