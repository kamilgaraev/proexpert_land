import React, { useState } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, ClockIcon, CurrencyDollarIcon, CalendarIcon } from '@heroicons/react/24/outline';
import type { CancelPreviewResponse } from '@utils/api';

interface CancelModulePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  preview: CancelPreviewResponse;
  moduleName: string;
  loading?: boolean;
}

export const CancelModulePreviewModal: React.FC<CancelModulePreviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  preview,
  moduleName,
  loading = false
}) => {
  const [reason, setReason] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    if (!reason.trim()) {
      return;
    }
    
    setIsConfirming(true);
    try {
      await onConfirm(reason);
    } finally {
      setIsConfirming(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Отмена модуля "{moduleName}"
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Предупреждение */}
          <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Внимание!</p>
              <p>После отмены модуль будет немедленно отключен, и вы потеряете доступ ко всем его функциям.</p>
            </div>
          </div>

          {/* Информация о возврате */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Информация о возврате средств</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <CurrencyDollarIcon className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">К возврату</p>
                  <p className="font-semibold text-green-600">
                    {preview.refund_amount.toLocaleString('ru-RU')} ₽
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Использовано дней</p>
                  <p className="font-semibold text-blue-600">{preview.days_used}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Осталось дней</p>
                  <p className="font-semibold text-purple-600">{preview.days_remaining}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <CurrencyDollarIcon className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Стоимость в день</p>
                  <p className="font-semibold text-gray-600">
                    {preview.daily_cost.toLocaleString('ru-RU')} ₽
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Сообщение */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">{preview.message}</p>
          </div>

          {/* Причина отмены */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Причина отмены <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Укажите причину отмены модуля..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
              disabled={loading}
            />
            {!reason.trim() && (
              <p className="mt-1 text-sm text-red-600">Пожалуйста, укажите причину отмены</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            disabled={loading}
          >
            Отмена
          </button>
          <button
            onClick={handleConfirm}
            disabled={!reason.trim() || loading || isConfirming}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isConfirming ? 'Отменяем...' : 'Подтвердить отмену'}
          </button>
        </div>
      </div>
    </div>
  );
};
