import React, { useState, useRef } from 'react';
import {
  PhotoIcon,
  CloudArrowUpIcon,
  TrashIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  DocumentIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import type { LandingAsset, UpdateAssetRequest, AssetUsageContext } from '@/types/holding-landing';

interface Props {
  assets: LandingAsset[];
  onUpload: (file: File, context?: AssetUsageContext, metadata?: any) => Promise<any>;
  onUpdate: (assetId: number, metadata: UpdateAssetRequest['metadata']) => Promise<boolean>;
  onDelete: (assetId: number) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

const usageContextLabels: Record<AssetUsageContext, string> = {
  hero: 'Главный баннер',
  logo: 'Логотип',
  gallery: 'Галерея',
  about: 'О компании',
  team: 'Команда',
  projects: 'Проекты',
  favicon: 'Favicon',
  general: 'Общее',
};

export const LandingMediaManager: React.FC<Props> = ({
  assets,
  onUpload,
  onUpdate,
  onDelete,
  loading,
  error,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterContext, setFilterContext] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<LandingAsset | null>(null);
  const [editingAsset, setEditingAsset] = useState<LandingAsset | null>(null);
  const [editMetadata, setEditMetadata] = useState<any>({});
  const [uploading, setUploading] = useState(false);
  const [uploadContext, setUploadContext] = useState<AssetUsageContext>('general');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await onUpload(file, uploadContext, {
          alt_text: file.name.replace(/\.[^/.]+$/, ''),
        });
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleStartEdit = (asset: LandingAsset) => {
    setEditingAsset(asset);
    setEditMetadata(asset.metadata || {});
  };

  const handleSaveEdit = async () => {
    if (!editingAsset) return;
    const success = await onUpdate(editingAsset.id, editMetadata);
    if (success) {
      setEditingAsset(null);
      setEditMetadata({});
    }
  };

  const filteredAssets = assets.filter((asset) => {
    if (filterType !== 'all' && asset.asset_type !== filterType) return false;
    if (filterContext !== 'all' && asset.usage_context !== filterContext) return false;
    if (searchQuery && !asset.filename.toLowerCase().includes(searchQuery.toLowerCase()))
      return false;
    return true;
  });

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <PhotoIcon className="w-8 h-8 text-gray-400" />;
      case 'video':
        return <VideoCameraIcon className="w-8 h-8 text-gray-400" />;
      case 'document':
        return <DocumentIcon className="w-8 h-8 text-gray-400" />;
      default:
        return <PhotoIcon className="w-8 h-8 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Медиафайлы</h3>
          <p className="text-sm text-gray-600 mt-1">
            Управление изображениями и документами лендинга
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CloudArrowUpIcon className="w-5 h-5" />
          {uploading ? 'Загрузка...' : 'Загрузить файл'}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Контекст загрузки
          </label>
          <select
            value={uploadContext}
            onChange={(e) => setUploadContext(e.target.value as AssetUsageContext)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.entries(usageContextLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Тип файла</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Все типы</option>
            <option value="image">Изображения</option>
            <option value="video">Видео</option>
            <option value="document">Документы</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Контекст</label>
          <select
            value={filterContext}
            onChange={(e) => setFilterContext(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Все контексты</option>
            {Object.entries(usageContextLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск по имени файла..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {loading && assets.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка файлов...</p>
          </div>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет файлов</h3>
          <p className="text-gray-600 mb-4">Загрузите первый файл для использования на лендинге</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Загрузить файл
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => setSelectedAsset(asset)}
              className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                {asset.asset_type === 'image' ? (
                  <img
                    src={asset.optimized_url?.thumbnail || asset.public_url}
                    alt={asset.metadata?.alt_text || asset.filename}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getAssetIcon(asset.asset_type)
                )}
              </div>

              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate">{asset.filename}</p>
                <p className="text-xs text-gray-500 mt-1">{asset.human_size}</p>
                <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                  {usageContextLabels[asset.usage_context]}
                </span>
              </div>

              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartEdit(asset);
                  }}
                  className="p-1.5 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
                  title="Редактировать"
                >
                  <PencilIcon className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Удалить файл "${asset.filename}"?`)) {
                      onDelete(asset.id);
                    }
                  }}
                  className="p-1.5 bg-white rounded-lg shadow-lg hover:bg-red-50 transition-colors"
                  title="Удалить"
                >
                  <TrashIcon className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Редактировать метаданные</h3>
              <button
                onClick={() => setEditingAsset(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alt текст (для SEO)
                </label>
                <input
                  type="text"
                  value={editMetadata.alt_text || ''}
                  onChange={(e) =>
                    setEditMetadata({ ...editMetadata, alt_text: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Описание изображения"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Подпись</label>
                <input
                  type="text"
                  value={editMetadata.caption || ''}
                  onChange={(e) => setEditMetadata({ ...editMetadata, caption: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Подпись к изображению"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                <textarea
                  value={editMetadata.description || ''}
                  onChange={(e) =>
                    setEditMetadata({ ...editMetadata, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Детальное описание"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Сохранить
                </button>
                <button
                  onClick={() => setEditingAsset(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedAsset && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedAsset(null)}
        >
          <div className="max-w-4xl max-h-full">
            {selectedAsset.asset_type === 'image' && (
              <img
                src={selectedAsset.public_url}
                alt={selectedAsset.metadata?.alt_text || selectedAsset.filename}
                className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

