import React, { useState } from 'react';
import {
  PlusIcon,
  TrashIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { useSiteBlocks } from '@/hooks/useHoldingSites';
import { usePermissionsContext } from '@/contexts/PermissionsContext';
import { useTheme } from '@components/shared/ThemeProvider';
import type { SiteContentBlock, BlockType, CreateBlockRequest } from '@/types/holding-sites';

interface BlockEditorProps {
  siteId: number;
}

const BlockEditor: React.FC<BlockEditorProps> = ({ siteId }) => {
  const { can } = usePermissionsContext();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  
  const {
    blocks,
    loading,
    error,
    createBlock,
    updateBlock,
    deleteBlock,
    duplicateBlock,
    publishBlock,
    reorderBlocks
  } = useSiteBlocks(siteId);

  const [editingBlock, setEditingBlock] = useState<number | null>(null);
  const [showNewBlockModal, setShowNewBlockModal] = useState(false);
  const [newBlockType, setNewBlockType] = useState<BlockType>('hero');

  const blockTypes: Array<{ type: BlockType; name: string; description: string; icon: string }> = [
    { type: 'hero', name: 'Hero секция', description: 'Главный баннер с заголовком и кнопкой', icon: '🎯' },
    { type: 'about', name: 'О нас', description: 'Информация о компании', icon: '📋' },
    { type: 'services', name: 'Услуги', description: 'Список услуг и предложений', icon: '⚙️' },
    { type: 'projects', name: 'Проекты', description: 'Портфолио и кейсы', icon: '🏗️' },
    { type: 'team', name: 'Команда', description: 'Информация о сотрудниках', icon: '👥' },
    { type: 'contacts', name: 'Контакты', description: 'Контактная информация', icon: '📞' },
    { type: 'gallery', name: 'Галерея', description: 'Фотогалерея', icon: '🖼️' },
    { type: 'news', name: 'Новости', description: 'Лента новостей и статей', icon: '📰' },
    { type: 'custom', name: 'Кастомный', description: 'Произвольный блок', icon: '🧩' }
  ];

  const getBlockTypeName = (type: BlockType) => {
    return blockTypes.find(bt => bt.type === type)?.name || type;
  };

  const getBlockIcon = (type: BlockType) => {
    return blockTypes.find(bt => bt.type === type)?.icon || '📄';
  };

  const getStatusBadge = (block: SiteContentBlock) => {
    const isPublished = block.status === 'published';
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        {isPublished ? 'Опубликован' : 'Черновик'}
      </span>
    );
  };

  const handleCreateBlock = async () => {
    const blockData: CreateBlockRequest = {
      block_type: newBlockType,
      title: `Новый блок "${getBlockTypeName(newBlockType)}"`,
      content: getDefaultContent(newBlockType),
      sort_order: blocks.length + 1
    };

    const newBlock = await createBlock(blockData);
    if (newBlock) {
      setShowNewBlockModal(false);
      setEditingBlock(newBlock.id);
    }
  };

  const getDefaultContent = (type: BlockType) => {
    const defaults = {
      hero: { title: 'Добро пожаловать', subtitle: 'Подзаголовок', description: 'Описание' },
      about: { title: 'О нас', description: '<p>Расскажите о своей компании</p>' },
      services: { title: 'Услуги', services: [] },
      projects: { title: 'Проекты', projects: [] },
      team: { title: 'Команда', members: [] },
      contacts: { title: 'Контакты' },
      gallery: { title: 'Галерея', images: [] },
      news: { title: 'Новости', articles: [] },
      custom: {}
    };
    return defaults[type] || {};
  };

  const handleMoveBlock = async (blockId: number, direction: 'up' | 'down') => {
    const currentIndex = blocks.findIndex(b => b.id === blockId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const newOrder = [...blocks];
    [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];
    
    await reorderBlocks(newOrder.map(b => b.id));
  };

  const handlePublishBlock = async (blockId: number) => {
    await publishBlock(blockId);
  };

  const handleDuplicateBlock = async (blockId: number) => {
    await duplicateBlock(blockId);
  };

  const handleDeleteBlock = async (blockId: number) => {
    if (confirm('Вы уверены, что хотите удалить этот блок?')) {
      await deleteBlock(blockId);
    }
  };

  if (!can('multi-organization.website.blocks.edit')) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Доступ ограничен</h3>
        <p className="text-gray-600">У вас нет прав для редактирования блоков</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Блоки контента</h2>
          <p className="text-gray-600 mt-1">Управление содержимым страницы</p>
        </div>
        
        {can('multi-organization.website.blocks.create') && (
          <button
            onClick={() => setShowNewBlockModal(true)}
            className={`${theme.primary} ${theme.hover} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2`}
          >
            <PlusIcon className="h-4 w-4" />
            Добавить блок
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Список блоков */}
      {loading && blocks.length === 0 ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
          <p className="text-gray-600 mt-2">Загрузка блоков...</p>
        </div>
      ) : blocks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет блоков</h3>
          <p className="text-gray-600 mb-4">Добавьте первый блок для начала работы</p>
          {can('multi-organization.website.blocks.create') && (
            <button
              onClick={() => setShowNewBlockModal(true)}
              className={`${theme.primary} ${theme.hover} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
            >
              Добавить блок
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {blocks.map((block, index) => (
            <div
              key={block.id}
              className={`bg-white rounded-lg border-2 transition-colors ${
                editingBlock === block.id 
                  ? 'border-primary-300 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getBlockIcon(block.block_type)}</span>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-gray-900">{block.title}</h3>
                        {getStatusBadge(block)}
                      </div>
                      <p className="text-sm text-gray-500">
                        {getBlockTypeName(block.block_type)} • Порядок: {block.sort_order}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Управление порядком */}
                    <button
                      onClick={() => handleMoveBlock(block.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      title="Переместить вверх"
                    >
                      <ArrowUpIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleMoveBlock(block.id, 'down')}
                      disabled={index === blocks.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      title="Переместить вниз"
                    >
                      <ArrowDownIcon className="h-4 w-4" />
                    </button>

                    {/* Действия */}
                    <button
                      onClick={() => setEditingBlock(editingBlock === block.id ? null : block.id)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="Редактировать"
                    >
                      <Bars3Icon className="h-4 w-4" />
                    </button>

                    {can('multi-organization.website.blocks.publish') && block.status === 'draft' && (
                      <button
                        onClick={() => handlePublishBlock(block.id)}
                        className="p-2 text-green-400 hover:text-green-600"
                        title="Опубликовать"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    )}

                    {can('multi-organization.website.blocks.create') && (
                      <button
                        onClick={() => handleDuplicateBlock(block.id)}
                        className="p-2 text-blue-400 hover:text-blue-600"
                        title="Дублировать"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </button>
                    )}

                    {can('multi-organization.website.blocks.delete') && block.can_delete && (
                      <button
                        onClick={() => handleDeleteBlock(block.id)}
                        className="p-2 text-red-400 hover:text-red-600"
                        title="Удалить"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Форма редактирования */}
                {editingBlock === block.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <BlockEditForm 
                      block={block} 
                      onSave={async (data) => {
                        await updateBlock(block.id, data);
                        setEditingBlock(null);
                      }}
                      onCancel={() => setEditingBlock(null)}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно создания блока */}
      {showNewBlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Выберите тип блока</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {blockTypes.map((type) => (
                <button
                  key={type.type}
                  onClick={() => setNewBlockType(type.type)}
                  className={`p-4 text-left border-2 rounded-lg transition-colors ${
                    newBlockType === type.type
                      ? 'border-primary-300 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{type.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowNewBlockModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleCreateBlock}
                className={`${theme.primary} ${theme.hover} text-white px-4 py-2 rounded-lg transition-colors`}
              >
                Создать блок
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Компонент формы редактирования блока
const BlockEditForm: React.FC<{
  block: SiteContentBlock;
  onSave: (data: any) => void;
  onCancel: () => void;
}> = ({ block, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: block.title,
    content: block.content,
    is_active: block.is_active
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleContentChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [key]: value
      }
    }));
  };

  const renderContentFields = () => {
    switch (block.block_type) {
      case 'hero':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок</label>
              <input
                type="text"
                value={formData.content.title || ''}
                onChange={(e) => handleContentChange('title', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Подзаголовок</label>
              <input
                type="text"
                value={formData.content.subtitle || ''}
                onChange={(e) => handleContentChange('subtitle', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
              <textarea
                value={formData.content.description || ''}
                onChange={(e) => handleContentChange('description', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Текст кнопки</label>
                <input
                  type="text"
                  value={formData.content.button_text || ''}
                  onChange={(e) => handleContentChange('button_text', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ссылка кнопки</label>
                <input
                  type="url"
                  value={formData.content.button_url || ''}
                  onChange={(e) => handleContentChange('button_url', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </>
        );
      
      default:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Содержимое (JSON)</label>
            <textarea
              value={JSON.stringify(formData.content, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setFormData(prev => ({ ...prev, content: parsed }));
                } catch {}
              }}
              rows={10}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm"
            />
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Название блока</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          required
        />
      </div>

      {renderContentFields()}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`active-${block.id}`}
          checked={formData.is_active}
          onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
          className="rounded border-gray-300"
        />
        <label htmlFor={`active-${block.id}`} className="text-sm text-gray-700">
          Блок активен
        </label>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Отмена
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Сохранить
        </button>
      </div>
    </form>
  );
};

export default BlockEditor;
