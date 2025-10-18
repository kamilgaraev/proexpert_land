import type { MultiOrgError } from '@/types/multi-organization-v2';

export class MultiOrgApiError extends Error implements MultiOrgError {
  code: string;
  statusCode: number;

  constructor(message: string, code: string, statusCode: number) {
    super(message);
    this.name = 'MultiOrgApiError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export const handleMultiOrgApiError = (error: any): never => {
  if (error.response) {
    const { status, data } = error.response;
    const errorMessage = data?.message || data?.error || 'Неизвестная ошибка';

    if (status === 403 && errorMessage.toLowerCase().includes('holding')) {
      throw new MultiOrgApiError(
        'Доступ к панели холдинга ограничен. Доступно только для холдинговых организаций.',
        'NOT_HOLDING_ORG',
        403
      );
    }

    if (status === 403 && errorMessage.toLowerCase().includes('module')) {
      throw new MultiOrgApiError(
        'Модуль мультиорганизации не активирован для вашей организации.',
        'MODULE_NOT_ACTIVE',
        403
      );
    }

    if (status === 404) {
      throw new MultiOrgApiError(
        'Организация или ресурс не найдены',
        'ORG_NOT_FOUND',
        404
      );
    }

    if (status === 422) {
      throw new MultiOrgApiError(
        data?.message || 'Ошибка валидации данных',
        'VALIDATION_ERROR',
        422
      );
    }

    if (status === 500) {
      throw new MultiOrgApiError(
        'Внутренняя ошибка сервера. Попробуйте позже.',
        'SERVER_ERROR',
        500
      );
    }
  }

  if (error.request) {
    throw new MultiOrgApiError(
      'Не удалось связаться с сервером. Проверьте подключение к интернету.',
      'NETWORK_ERROR',
      0
    );
  }

  throw new MultiOrgApiError(
    error.message || 'Неизвестная ошибка при работе с API',
    'UNKNOWN_ERROR',
    500
  );
};

export const getErrorMessage = (error: any): string => {
  if (error instanceof MultiOrgApiError) {
    return error.message;
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.message) {
    return error.message;
  }

  return 'Произошла неизвестная ошибка';
};

export const isNotHoldingError = (error: any): boolean => {
  return error instanceof MultiOrgApiError && error.code === 'NOT_HOLDING_ORG';
};

export const isModuleNotActiveError = (error: any): boolean => {
  return error instanceof MultiOrgApiError && error.code === 'MODULE_NOT_ACTIVE';
};

