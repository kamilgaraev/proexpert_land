import React, { useState, useRef, useCallback } from 'react';
import {
  PhotoIcon,
  DocumentIcon,
  VideoCameraIcon,
  TrashIcon,
  PencilIcon,
  ClipboardDocumentIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { useSiteAssets } from '@/hooks/useHoldingSites';
import { usePermissionsContext } from '@/contexts/PermissionsContext';
import { useTheme } from '@components/shared/ThemeProvider';
import type { SiteAsset, AssetFilters } from '@/types/holding-sites';

interface MediaManagerProps {
  siteId: number;
  onSelectAsset?: (asset: SiteAsset) => void;
  selectionMode?: boolean;
  allowedTypes?: string[];
}

const MediaManager: React.FC<MediaManagerProps> = ({ 
  siteId, 
  onSelectAsset, 
  selectionMode = false,
  allowedTypes
}) => {
  const { can } = usePermissionsContext();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  
  const {
    assets,
    loading,
    error,
    uploadProgress,
    fetchAssets,
    uploadAsset,
    updateAsset,
    deleteAsset
  } = useSiteAssets(siteId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filters, setFilters] = useState<AssetFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingAsset, setEditingAsset] = useState<SiteAsset | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = !searchTerm || 
      asset.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.metadata.alt_text?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filters.asset_type || asset.asset_type === filters.asset_type;
    const matchesContext = !filters.usage_context || asset.usage_context === filters.usage_context;
    const matchesAllowed = !allowedTypes || allowedTypes.includes(asset.mime_type);
    
    return matchesSearch && matchesType && matchesContext && matchesAllowed;
  });

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!can('multi-organization.website.assets.upload')) {
      alert('У вас нет прав для загрузки файлов');
      return;
    }

    Array.from(files).forEach(async (file) => {
      await uploadAsset(file, filters.usage_context);
    });
  }, [uploadAsset, filters.usage_context, can]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const getAssetIcon = (asset: SiteAsset) => {
    if (asset.asset_type === 'image') {
      return <PhotoIcon className="h-6 w-6" />;
    } else if (asset.asset_type === 'video') {
      return <VideoCameraIcon className="h-6 w-6" />;
    }
    return <DocumentIcon className="h-6 w-6" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('URL скопирован в буфер обмена');
    });
  };

  const handleUpdateAsset = async (assetId: number, metadata: any) => {
    await updateAsset(assetId, metadata);
    setEditingAsset(null);
  };

  const handleDeleteConfirm = async (assetId: number) => {
    const success = await deleteAsset(assetId);
    if (success) {
      setDeleteConfirmId(null);
    }
  };

  if (!can('multi-organization.website.view')) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Доступ ограничен</h3>
        <p className="text-gray-600">У вас нет прав для просмотра медиафайлов</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и контролы */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Медиафайлы</h2>
          <p className="text-gray-600 mt-1">Управление изображениями и документами</p>
        </div>

        {can('multi-organization.website.assets.upload') && (
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`${theme.primary} ${theme.hover} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2`}
            >
              <CloudArrowUpIcon className="h-4 w-4" />
              Загрузить файлы
            </button>
          </div>
        )}
      </div>

      {/* Фильтры и поиск */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск файлов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <select
          value={filters.asset_type || ''}
          onChange={(e) => setFilters({ ...filters, asset_type: e.target.value as any })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Все типы</option>
          <option value="image">Изображения</option>
          <option value="video">Видео</option>
          <option value="document">Документы</option>
          <option value="other">Другое</option>
        </select>

        <select
          value={filters.usage_context || ''}
          onChange={(e) => setFilters({ ...filters, usage_context: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Все контексты</option>
          <option value="hero">Hero секция</option>
          <option value="gallery">Галерея</option>
          <option value="team">Команда</option>
          <option value="logo">Логотипы</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Прогресс загрузки */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-800">Загрузка файла...</span>
            <span className="text-blue-800">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Область перетаскивания */}
      {can('multi-organization.website.assets.upload') && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors"
        >
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-lg font-medium text-gray-900">Перетащите файлы сюда</p>
          <p className="mt-1 text-sm text-gray-600">
            или <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-primary-600 hover:text-primary-700 underline"
            >
              выберите на компьютере
            </button>
          </p>
          <p className="mt-2 text-xs text-gray-500">
            PNG, JPG, GIF, MP4, PDF до 10MB
          </p>
        </div>
      )}

      {/* Список файлов */}
      {loading && assets.length === 0 ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
          <p className="text-gray-600 mt-2">Загрузка файлов...</p>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            {assets.length === 0 ? 'Нет файлов' : 'Файлы не найдены'}
          </h3>
          <p className="mt-1 text-gray-600">
            {assets.length === 0 
              ? 'Загрузите первые файлы для вашего сайта'
              : 'Попробуйте изменить фильтры или поисковый запрос'
            }
          </p>
        </div>
      ) : (
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6' 
            : 'grid-cols-1'
        }`}>
          {filteredAssets.map((asset) => (
            <div 
              key={asset.id} 
              className={`bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow ${
                selectionMode ? 'cursor-pointer hover:border-primary-300' : ''
              }`}
              onClick={selectionMode ? () => onSelectAsset?.(asset) : undefined}
            >
              {viewMode === 'grid' ? (
                <>
                  <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                    {asset.asset_type === 'image' ? (
                      <img
                        src={asset.optimized_url || asset.public_url}
                        alt={asset.metadata.alt_text || asset.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        {getAssetIcon(asset)}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {asset.metadata.alt_text || asset.original_filename}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{asset.human_size}</p>
                    
                    {!selectionMode && (
                      <div className="flex items-center gap-1 mt-2">
                        <button
                          onClick={() => copyToClipboard(asset.public_url)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Копировать URL"
                        >
                          <ClipboardDocumentIcon className="h-3 w-3" />
                        </button>
                        
                        {can('multi-organization.website.assets.edit') && (
                          <button
                            onClick={() => setEditingAsset(asset)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Редактировать"
                          >
                            <PencilIcon className="h-3 w-3" />
                          </button>
                        )}
                        
                        {can('multi-organization.website.assets.delete') && (
                          <button
                            onClick={() => setDeleteConfirmId(asset.id)}
                            className="p-1 text-red-400 hover:text-red-600"
                            title="Удалить"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {asset.asset_type === 'image' ? (
                      <img
                        src={asset.optimized_url || asset.public_url}
                        alt={asset.metadata.alt_text || asset.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        {getAssetIcon(asset)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {asset.metadata.alt_text || asset.original_filename}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {asset.human_size} • {formatDate(asset.uploaded_at)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {asset.uploader.name} • {asset.usage_context || 'Без контекста'}
                    </p>
                  </div>
                  
                  {!selectionMode && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(asset.public_url)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Копировать URL"
                      >
                        <ClipboardDocumentIcon className="h-4 w-4" />
                      </button>
                      
                      {can('multi-organization.website.assets.edit') && (
                        <button
                          onClick={() => setEditingAsset(asset)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="Редактировать"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      )}
                      
                      {can('multi-organization.website.assets.delete') && (
                        <button
                          onClick={() => setDeleteConfirmId(asset.id)}
                          className="p-2 text-red-400 hover:text-red-600"
                          title="Удалить"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно редактирования */}
      {editingAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Редактирование файла
            </h3>
            
            <AssetEditForm
              asset={editingAsset}
              onSave={(metadata) => handleUpdateAsset(editingAsset.id, metadata)}
              onCancel={() => setEditingAsset(null)}
            />
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения удаления */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Подтвердите удаление
            </h3>
            <p className="text-gray-600 mb-6">
              Вы уверены, что хотите удалить этот файл? Это действие нельзя отменить.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => handleDeleteConfirm(deleteConfirmId)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Компонент формы редактирования метаданных файла
const AssetEditForm: React.FC<{
  asset: SiteAsset;
  onSave: (metadata: any) => void;
  onCancel: () => void;
}> = ({ asset, onSave, onCancel }) => {
  const [metadata, setMetadata] = useState(asset.metadata);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(metadata);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Альтернативный текст
        </label>
        <input
          type="text"
          value={metadata.alt_text || ''}
          onChange={(e) => setMetadata({ ...metadata, alt_text: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Описание изображения"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Подпись
        </label>
        <input
          type="text"
          value={metadata.caption || ''}
          onChange={(e) => setMetadata({ ...metadata, caption: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Подпись к файлу"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Заголовок
        </label>
        <input
          type="text"
          value={metadata.title || ''}
          onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Заголовок файла"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Описание
        </label>
        <textarea
          value={metadata.description || ''}
          onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Подробное описание"
        />
      </div>

      <div className="flex items-center gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Отмена
        </button>
        <button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Сохранить
        </button>
      </div>
    </form>
  );
};

export default MediaManager;
