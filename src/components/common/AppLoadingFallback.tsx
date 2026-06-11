import { useEffect, useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { reloadWithCacheBust } from '@/utils/preloadRecovery';

interface AppLoadingFallbackProps {
  slowAfterMs?: number;
}

export const AppLoadingFallback = ({ slowAfterMs = 15_000 }: AppLoadingFallbackProps) => {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsSlow(true), slowAfterMs);

    return () => window.clearTimeout(timeoutId);
  }, [slowAfterMs]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="flex max-w-sm flex-col items-center space-y-4 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
        <p className="font-medium text-gray-600">Загрузка...</p>

        {isSlow ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Загрузка заняла больше обычного. Обновите страницу, чтобы открыть актуальную версию кабинета.
            </p>
            <button
              type="button"
              onClick={() => reloadWithCacheBust()}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Обновить страницу
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
