import React, { Component, ReactNode } from 'react';
import { ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { MultiOrgApiError } from '@/utils/multiOrgErrorHandler';

interface Props {
  children: ReactNode;
  fallbackPath?: string;
}

interface State {
  hasError: boolean;
  error: MultiOrgApiError | Error | null;
}

export class MultiOrgErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('MultiOrg Error Boundary caught an error:', error, errorInfo);
  }

  handleGoBack = () => {
    const { fallbackPath } = this.props;
    window.location.href = fallbackPath || '/dashboard';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const error = this.state.error;
      const isMultiOrgError = error instanceof MultiOrgApiError;

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-10 h-10 text-red-600" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
                {isMultiOrgError && error.code === 'NOT_HOLDING_ORG'
                  ? 'Доступ запрещен'
                  : isMultiOrgError && error.code === 'MODULE_NOT_ACTIVE'
                  ? 'Модуль недоступен'
                  : 'Произошла ошибка'}
              </h2>

              <p className="text-gray-600 text-center mb-6">
                {error.message}
              </p>

              {isMultiOrgError && error.code && (
                <div className="bg-gray-100 rounded p-3 mb-6">
                  <p className="text-sm text-gray-500 text-center">
                    Код ошибки: <span className="font-mono font-semibold">{error.code}</span>
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={this.handleGoBack}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  На главную
                </button>

                <button
                  onClick={this.handleReload}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Обновить страницу
                </button>
              </div>

              {isMultiOrgError && error.code === 'NOT_HOLDING_ORG' && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Совет:</strong> Панель холдинга доступна только для организаций с типом "Холдинг". 
                    Обратитесь к администратору для активации функций холдинга.
                  </p>
                </div>
              )}

              {isMultiOrgError && error.code === 'MODULE_NOT_ACTIVE' && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Совет:</strong> Активируйте модуль "Мультиорганизация" в настройках вашей организации.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

