import React from 'react';

interface OrangeModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: () => void | Promise<void>;
  onSecondary?: () => void;
  onClose: () => void;
  isProcessing?: boolean;
  widthClassName?: string;
}

const OrangeModal: React.FC<OrangeModalProps> = ({
  isOpen,
  title,
  children,
  primaryLabel = 'Сохранить',
  secondaryLabel = 'Отменить',
  onPrimary,
  onSecondary,
  onClose,
  isProcessing = false,
  widthClassName = 'max-w-2xl'
}) => {
  if (!isOpen) return null;

  const handleSecondary = () => {
    if (onSecondary) onSecondary();
    else onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${widthClassName} mx-4 overflow-hidden`}>
        <div className="px-6 py-4 border-b border-orange-200 bg-gradient-to-r from-orange-50 to-white">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
        <div className="p-6">
          {children}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleSecondary}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            disabled={isProcessing}
          >
            {secondaryLabel}
          </button>
          <button
            type="button"
            onClick={onPrimary}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
            disabled={isProcessing}
          >
            {isProcessing ? 'Сохранение...' : primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrangeModal;


