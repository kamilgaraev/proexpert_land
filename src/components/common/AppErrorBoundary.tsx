import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ArrowLeftIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { reloadWithCacheBust } from '@/utils/preloadRecovery';

interface AppErrorBoundaryProps {
  children: ReactNode;
  resetKey?: string;
}

interface AppErrorBoundaryState {
  error: Error | null;
}

const isAssetLoadError = (error: Error): boolean => {
  const message = error.message.toLowerCase();

  return (
    message.includes('failed to fetch dynamically imported module') ||
    message.includes('importing a module script failed') ||
    message.includes('error loading dynamically imported module') ||
    message.includes('unable to preload css') ||
    message.includes('chunkloaderror') ||
    message.includes('loading chunk')
  );
};

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidUpdate(previousProps: AppErrorBoundaryProps) {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('App error boundary caught an error:', error, errorInfo);
    }
  }

  private goToDashboard = () => {
    window.location.href = '/dashboard';
  };

  render() {
    const { error } = this.state;

    if (!error) {
      return this.props.children;
    }

    const assetLoadError = isAssetLoadError(error);
    const title = assetLoadError ? 'Кабинет обновился' : 'Раздел не открылся';
    const description = assetLoadError
      ? 'Не удалось загрузить актуальную версию раздела. Обновите страницу, чтобы продолжить работу.'
      : 'Не удалось открыть этот раздел. Обновите страницу или вернитесь в кабинет.';

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100">
            <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
          </div>

          <h1 className="mb-3 text-2xl font-bold text-gray-900">{title}</h1>
          <p className="mb-6 text-sm leading-6 text-gray-600">{description}</p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => reloadWithCacheBust()}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Обновить
            </button>
            <button
              type="button"
              onClick={this.goToDashboard}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              В кабинет
            </button>
          </div>
        </div>
      </div>
    );
  }
}
