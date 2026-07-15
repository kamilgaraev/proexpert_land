import { API_URL } from '@/utils/api';
import { getJsonAuthHeaders } from '@/utils/authTokenStorage';
import { CommercialApiError } from '@/types/commercialBilling';
import type { EnterpriseInquiryInput } from '@/types/enterpriseInquiry';

export const createEnterpriseInquiry = async (input: EnterpriseInquiryInput): Promise<void> => {
  const response = await fetch(`${API_URL}/billing/commercial/enterprise-inquiries`, {
    method: 'POST',
    headers: {
      ...getJsonAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_request_id: globalThis.crypto.randomUUID(),
      contact_phone: input.contactPhone,
      company_size: input.companySize,
      preferred_contact: input.preferredContact,
      needs: input.needs,
      comment: input.comment || null,
    }),
  });

  const payload = await response.json().catch(() => ({})) as {
    success?: boolean;
    message?: string;
    errors?: Record<string, string[]>;
  };

  if (!response.ok || payload.success === false) {
    throw new CommercialApiError(
      payload.message || 'Не удалось отправить заявку. Попробуйте ещё раз.',
      response.status,
      payload.errors,
    );
  }
};

