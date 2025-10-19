import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  CloudArrowUpIcon,
  EyeIcon,
  EyeSlashIcon,
  Bars3Icon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import type { LandingBlock, UpdateBlockRequest } from '@/types/holding-landing';

interface Props {
  blocks: LandingBlock[];
  selectedBlockId: number | null;
  onUpdateBlock: (blockId: number, data: UpdateBlockRequest) => Promise<boolean>;
  onPublishBlock: (blockId: number) => Promise<boolean>;
  onDuplicateBlock: (blockId: number) => Promise<any>;
  onDeleteBlock: (blockId: number) => Promise<boolean>;
  onReorderBlocks: (order: { id: number; sort_order: number }[]) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export const LandingBlockEditor: React.FC<Props> = ({
  blocks,
  selectedBlockId,
  onUpdateBlock,
  onPublishBlock,
  onDuplicateBlock,
  onDeleteBlock,
  onReorderBlocks,
  loading,
  error,
}) => {
  const [editingBlockId, setEditingBlockId] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState<any>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex((block) => block.id === active.id);
    const newIndex = blocks.findIndex((block) => block.id === over.id);

    const newBlocks = arrayMove(blocks, oldIndex, newIndex);
    const newOrder = newBlocks.map((block, index) => ({
      id: block.id,
      sort_order: index + 1,
    }));

    onReorderBlocks(newOrder);
  };

  const handleStartEdit = (block: LandingBlock) => {
    setEditingBlockId(block.id);
    setEditedContent(block.content);
  };

  const handleSaveEdit = async (blockId: number) => {
    const success = await onUpdateBlock(blockId, { content: editedContent });
    if (success) {
      setEditingBlockId(null);
      setEditedContent({});
    }
  };

  const handleCancelEdit = () => {
    setEditingBlockId(null);
    setEditedContent({});
  };

  const getBlockIcon = (type: string) => {
    const icons: Record<string, string> = {
      hero: '🏆',
      about: '📋',
      services: '⚙️',
      projects: '📁',
      team: '👥',
      contacts: '📞',
      testimonials: '💬',
      gallery: '🖼️',
      news: '📰',
      custom: '🔧',
    };
    return icons[type] || '📄';
  };

  if (loading && blocks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка блоков...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-medium">Ошибка загрузки блоков</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (blocks.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Нет блоков</h3>
        <p className="text-gray-600">Добавьте первый блок из библиотеки слева</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Блоки лендинга</h3>
          <p className="text-sm text-gray-600 mt-1">
            Перетаскивайте блоки для изменения порядка отображения
          </p>
        </div>
        <div className="text-sm text-gray-600">
          Всего блоков: <span className="font-medium text-gray-900">{blocks.length}</span>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {blocks.map((block) => (
              <SortableBlockItem
                key={block.id}
                block={block}
                selectedBlockId={selectedBlockId}
                editingBlockId={editingBlockId}
                editedContent={editedContent}
                onStartEdit={handleStartEdit}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onUpdateBlock={onUpdateBlock}
                onPublishBlock={onPublishBlock}
                onDuplicateBlock={onDuplicateBlock}
                onDeleteBlock={onDeleteBlock}
                setEditedContent={setEditedContent}
                getBlockIcon={getBlockIcon}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

interface SortableBlockItemProps {
  block: LandingBlock;
  selectedBlockId: number | null;
  editingBlockId: number | null;
  editedContent: any;
  onStartEdit: (block: LandingBlock) => void;
  onSaveEdit: (blockId: number) => void;
  onCancelEdit: () => void;
  onUpdateBlock: (blockId: number, data: UpdateBlockRequest) => Promise<boolean>;
  onPublishBlock: (blockId: number) => Promise<boolean>;
  onDuplicateBlock: (blockId: number) => Promise<any>;
  onDeleteBlock: (blockId: number) => Promise<boolean>;
  setEditedContent: (content: any) => void;
  getBlockIcon: (type: string) => string;
}

const SortableBlockItem: React.FC<SortableBlockItemProps> = ({
  block,
  selectedBlockId,
  editingBlockId,
  editedContent,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onUpdateBlock,
  onPublishBlock,
  onDuplicateBlock,
  onDeleteBlock,
  setEditedContent,
  getBlockIcon,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-lg shadow-sm transition-all ${
        isDragging ? 'shadow-lg ring-2 ring-blue-500 opacity-50' : ''
      } ${selectedBlockId === block.id ? 'ring-2 ring-blue-500' : ''}`}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div
            {...attributes}
            {...listeners}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing touch-none"
          >
            <Bars3Icon className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{getBlockIcon(block.type)}</span>
              <div className="flex-1">
                <h4 className="text-base font-semibold text-gray-900 truncate">{block.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">Тип: {block.type}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500">Порядок: {block.sort_order}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {block.status === 'published' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    Опубликован
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <ClockIcon className="w-3.5 h-3.5" />
                    Черновик
                  </span>
                )}

                {block.is_active ? (
                  <button
                    onClick={() => onUpdateBlock(block.id, { is_active: false })}
                    className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Блок активен"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => onUpdateBlock(block.id, { is_active: true })}
                    className="p-1 text-gray-400 hover:bg-gray-50 rounded transition-colors"
                    title="Блок скрыт"
                  >
                    <EyeSlashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {editingBlockId === block.id ? (
              <div className="mt-3 space-y-3">
                <textarea
                  value={JSON.stringify(editedContent, null, 2)}
                  onChange={(e) => {
                    try {
                      setEditedContent(JSON.parse(e.target.value));
                    } catch {
                      
                    }
                  }}
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                  placeholder="JSON контент блока"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => onSaveEdit(block.id)}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Сохранить
                  </button>
                  <button
                    onClick={onCancelEdit}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {JSON.stringify(block.content).substring(0, 150)}...
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => onStartEdit(block)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
            Редактировать
          </button>

          {block.status === 'draft' && (
            <button
              onClick={() => onPublishBlock(block.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <CloudArrowUpIcon className="w-4 h-4" />
              Опубликовать
            </button>
          )}

          <button
            onClick={() => onDuplicateBlock(block.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <DocumentDuplicateIcon className="w-4 h-4" />
            Дублировать
          </button>

          {block.can_delete && (
            <button
              onClick={() => {
                if (confirm(`Удалить блок "${block.title}"? Это действие нельзя отменить.`)) {
                  onDeleteBlock(block.id);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors ml-auto"
            >
              <TrashIcon className="w-4 h-4" />
              Удалить
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

