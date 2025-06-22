import { useState, useCallback } from 'react';

export interface OrganizationData {
  id?: number;
  name: string;
  legal_name?: string;
  tax_number?: string;
  registration_number?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  description?: string;
  logo_path?: string;
  is_active?: boolean;
  subscription_expires_at?: string;
  verification?: VerificationData;
  created_at?: string;
  updated_at?: string;
}

export interface VerificationData {
  is_verified: boolean;
  verified_at?: string;
  verification_status: 'pending' | 'verified' | 'partially_verified' | 'needs_review' | 'failed';
  verification_status_text: string;
  verification_score: number;
  verification_data?: any;
  verification_notes?: string;
  can_be_verified: boolean;
}

export interface VerificationResult {
  inn_verification?: {
    success: boolean;
    message: string;
    data?: any;
  };
  address_verification?: {
    success: boolean;
    message: string;
    data?: any;
  };
  overall_status: string;
  verification_score: number;
  errors: string[];
  warnings: string[];
}

const API_BASE_URL = '/api/v1/landing';

export const useOrganizationVerification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [organization, setOrganization] = useState<OrganizationData | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const getOrganization = useCallback(async (): Promise<OrganizationData | null> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/organization/verification`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Ошибка при получении данных организации');
      }

      const result = await response.json();
      if (result.success) {
        const orgData = result.data.organization;
        setOrganization(orgData);
        return orgData;
      } else {
        throw new Error(result.message || 'Ошибка получения данных');
      }
    } catch (error) {
      console.error('Ошибка получения организации:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateOrganization = useCallback(async (data: Partial<OrganizationData>): Promise<OrganizationData> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/organization/verification`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 422 && errorData.errors) {
          const error = new Error('Ошибки валидации');
          (error as any).errors = errorData.errors;
          throw error;
        }
        throw new Error(errorData.message || 'Ошибка при обновлении данных');
      }

      const result = await response.json();
      if (result.success) {
        const orgData = result.data.organization;
        setOrganization(orgData);
        return orgData;
      } else {
        throw new Error(result.message || 'Ошибка обновления данных');
      }
    } catch (error) {
      console.error('Ошибка обновления организации:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestVerification = useCallback(async (): Promise<{ 
    verification_result: VerificationResult; 
    organization: OrganizationData; 
  }> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/organization/verification/request`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при запросе верификации');
      }

      const result = await response.json();
      if (result.success) {
        const orgData = result.data.organization;
        setOrganization(orgData);
        return {
          verification_result: result.data.verification_result,
          organization: orgData
        };
      } else {
        throw new Error(result.message || 'Ошибка верификации');
      }
    } catch (error) {
      console.error('Ошибка запроса верификации:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'partially_verified':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'needs_review':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getVerificationStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return '🟢';
      case 'partially_verified':
        return '🟡';
      case 'needs_review':
        return '🔴';
      case 'failed':
        return '❌';
      default:
        return '⚪';
    }
  };

  return {
    organization,
    isLoading,
    getOrganization,
    updateOrganization,
    requestVerification,
    getVerificationStatusColor,
    getVerificationStatusIcon,
  };
};

export default useOrganizationVerification; 