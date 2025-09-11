import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CancelModulePreviewModal } from './CancelModulePreviewModal';
import type { ActivatedModule, CancelPreviewResponse } from '@utils/api';

interface ModuleCancelButtonProps {
  module: ActivatedModule;
  onCancelPreview: (moduleSlug: string) => Promise<CancelPreviewResponse | null>;
  onCancel: (moduleSlug: string, reason: string) => Promise<void>;
  loading?: boolean;
}

export const ModuleCancelButton: React.FC<ModuleCancelButtonProps> = ({
  module,
  onCancelPreview,
  onCancel,
  loading = false
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [preview, setPreview] = useState<CancelPreviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCancelClick = async () => {
    setIsLoading(true);
    try {
      const previewData = await onCancelPreview(module.module.slug);
      if (previewData) {
        setPreview(previewData);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Ошибка получения предварительного просмотра:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmCancel = async (reason: string) => {
    try {
      await onCancel(module.module.slug, reason);
      setShowPreview(false);
      setPreview(null);
    } catch (error) {
      console.error('Ошибка отмены модуля:', error);
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreview(null);
  };

  // Проверяем, можно ли отменить модуль
  const canCancel = module.status === 'active' && module.payment_method !== 'free';

  if (!canCancel) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleCancelClick}
        disabled={loading || isLoading}
        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2" />
            Загрузка...
          </>
        ) : (
          <>
            <XMarkIcon className="w-4 h-4 mr-1.5" />
            Отменить
          </>
        )}
      </button>

      {preview && (
        <CancelModulePreviewModal
          isOpen={showPreview}
          onClose={handleClosePreview}
          onConfirm={handleConfirmCancel}
          preview={preview}
          moduleName={module.module.name}
          loading={loading}
        />
      )}
    </>
  );
};
