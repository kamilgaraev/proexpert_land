/**
 * API утилиты для работы с приглашениями подрядчиков
 */

import axios from 'axios';
import type {
  ContractorInvitation,
  InvitationListResponse,
  InvitationStats,
  InvitationFilters,
  InvitationAcceptResponse,
  InvitationDeclineRequest
} from '../types/contractor-invitations';

// Базовый URL для API личного кабинета
const API_BASE_DOMAIN = 'https://api.prohelper.pro';
const API_URL = `${API_BASE_DOMAIN}/api/v1/landing`;

// Создаем экземпляр axios с базовой конфигурацией
const contractorInvitationsApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Добавляем интерцептор для автоматического добавления токена авторизации
contractorInvitationsApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ответов и ошибок
contractorInvitationsApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Ошибка API приглашений подрядчиков:', error);
    
    if (error.response?.status === 401) {
      // Токен истек или недействителен
      localStorage.removeItem('token');
      sessionStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export const contractorInvitationsService = {
  /**
   * Получить список входящих приглашений
   */
  async getIncomingInvitations(filters?: InvitationFilters): Promise<InvitationListResponse> {
    const params = new URLSearchParams();
    
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.date_from) {
      params.append('date_from', filters.date_from);
    }
    if (filters?.date_to) {
      params.append('date_to', filters.date_to);
    }
    if (filters?.per_page) {
      params.append('per_page', filters.per_page.toString());
    }

    const response = await contractorInvitationsApi.get(
      `/contractor-invitations?${params.toString()}`
    );
    
    return (response.data as { data: InvitationListResponse }).data;
  },

  /**
   * Получить детали приглашения по токену
   */
  async getInvitationByToken(token: string): Promise<ContractorInvitation> {
    const response = await contractorInvitationsApi.get(
      `/contractor-invitations/${token}`
    );
    
    return (response.data as { data: ContractorInvitation }).data;
  },

  /**
   * Принять приглашение
   */
  async acceptInvitation(token: string): Promise<InvitationAcceptResponse> {
    const response = await contractorInvitationsApi.post(
      `/contractor-invitations/${token}/accept`
    );
    
    return (response.data as { data: InvitationAcceptResponse }).data;
  },

  /**
   * Отклонить приглашение
   */
  async declineInvitation(token: string, reason?: string): Promise<{ message: string }> {
    const data: InvitationDeclineRequest = {};
    if (reason) {
      data.reason = reason;
    }

    const response = await contractorInvitationsApi.post(
      `/contractor-invitations/${token}/decline`,
      data
    );
    
    return response.data as { message: string };
  },

  /**
   * Получить статистику приглашений
   */
  async getInvitationStats(): Promise<InvitationStats> {
    const response = await contractorInvitationsApi.get(
      '/contractor-invitations/stats'
    );
    
    return (response.data as { data: InvitationStats }).data;
  },

  /**
   * Получить детали приглашения по ID (для авторизованного пользователя)
   */
  async getInvitationById(id: number): Promise<ContractorInvitation> {
    const response = await contractorInvitationsApi.get(
      `/contractor-invitations/id/${id}`
    );
    
    return (response.data as { data: ContractorInvitation }).data;
  },
};

// Утилиты для работы с ошибками
export const handleContractorInvitationError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.status === 404) {
    return 'Приглашение не найдено';
  }
  
  if (error.response?.status === 410) {
    return 'Срок действия приглашения истек';
  }
  
  if (error.response?.status === 403) {
    return 'Приглашение уже обработано или недоступно';
  }
  
  if (error.response?.status === 400) {
    return 'Некорректные данные запроса';
  }
  
  return 'Произошла ошибка при обработке приглашения';
};

// Утилиты для форматирования данных
export const formatInvitationDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getTimeUntilExpiry = (expiryDate: string): string => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  
  if (diffTime <= 0) {
    return 'Истекло';
  }
  
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return 'Менее суток';
  }
  
  return `${diffDays} дн.`;
};

export const isInvitationExpiringSoon = (expiryDate: string): boolean => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  return diffDays <= 2 && diffDays > 0;
};

export default contractorInvitationsService;