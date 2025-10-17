import { useState } from 'react';

interface CertificationsListProps {
  certifications: string[];
  onChange: (certifications: string[]) => void;
  disabled?: boolean;
}

export const CertificationsList = ({
  certifications,
  onChange,
  disabled = false
}: CertificationsListProps) => {
  const [newCertification, setNewCertification] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (newCertification.trim() && !certifications.includes(newCertification.trim())) {
      onChange([...certifications, newCertification.trim()]);
      setNewCertification('');
      setIsAdding(false);
    }
  };

  const handleRemove = (certification: string) => {
    onChange(certifications.filter(c => c !== certification));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewCertification('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {certifications.length > 0 ? (
          <div className="space-y-2">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{cert}</span>
                </div>
                {!disabled && (
                  <button
                    onClick={() => handleRemove(cert)}
                    className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Удалить"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 rounded-lg">
            <svg className="mx-auto w-12 h-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm text-gray-500">
              Сертификаты не добавлены
            </p>
          </div>
        )}
      </div>

      {!disabled && (
        <div className="pt-4 border-t border-gray-200">
          {isAdding ? (
            <div className="space-y-2">
              <input
                type="text"
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Название сертификата (например, ISO 9001)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleAdd}
                  disabled={!newCertification.trim()}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Добавить
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewCertification('');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Добавить сертификат</span>
            </button>
          )}
        </div>
      )}

      {certifications.length > 0 && (
        <p className="text-xs text-gray-500">
          Добавлено сертификатов: <span className="font-semibold">{certifications.length}</span>
        </p>
      )}
    </div>
  );
};

