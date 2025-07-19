import React, { useState, useEffect } from 'react';
import { blogApi } from '../../../utils/blogApi';
import type { BlogCategory, BlogCategoryCreateRequest } from '../../../types/blog';

interface CategoryCardProps {
  category: BlogCategory;
  onEdit: (category: BlogCategory) => void;
  onDelete: (id: number) => void;
  onDragStart: (e: React.DragEvent, id: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetId: number) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category, 
  onEdit, 
  onDelete, 
  onDragStart, 
  onDragOver, 
  onDrop 
}) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, category.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, category.id)}
      className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 cursor-move"
    >
      <div 
        className="h-2 rounded-t-lg"
        style={{ backgroundColor: category.color }}
      />
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {category.name}
          </h3>
          <div className="flex space-x-1">
            <button
              onClick={() => onEdit(category)}
              className="text-gray-400 hover:text-blue-600 p-1"
              title="Редактировать"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(category.id)}
              className="text-gray-400 hover:text-red-600 p-1"
              title="Удалить"
            >
              🗑️
            </button>
          </div>
        </div>

        {category.description && (
          <p className="text-gray-600 text-sm line-clamp-3 mb-3">
            {category.description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            📄 {category.published_articles_count || 0} статей
          </span>
          <span className={`px-2 py-1 rounded-full text-xs ${
            category.is_active 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {category.is_active ? 'Активна' : 'Неактивна'}
          </span>
        </div>

        {category.image && (
          <div className="mt-3">
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-24 object-cover rounded"
            />
          </div>
        )}
      </div>
    </div>
  );
};

interface CategoryModalProps {
  isOpen: boolean;
  category: BlogCategory | null;
  onClose: () => void;
  onSave: (data: BlogCategoryCreateRequest) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, category, onClose, onSave }) => {
  const [formData, setFormData] = useState<BlogCategoryCreateRequest>({
    name: '',
    slug: '',
    description: '',
    color: '#007bff',
    is_active: true,
    sort_order: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        meta_title: category.meta_title || '',
        meta_description: category.meta_description || '',
        color: category.color,
        image: category.image || '',
        sort_order: category.sort_order,
        is_active: category.is_active,
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        color: '#007bff',
        is_active: true,
        sort_order: 0,
      });
    }
    setErrors({});
  }, [category, isOpen]);

  useEffect(() => {
    if (formData.name && (!formData.slug || formData.slug?.trim() === '')) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-zа-я0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name]);

  const predefinedColors = [
    '#007bff', '#28a745', '#dc3545', '#ffc107', '#6f42c1',
    '#fd7e14', '#20c997', '#6c757d', '#f8f9fa', '#343a40'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Название обязательно';
    }
    
    if (!formData.slug || !formData.slug.trim()) {
      newErrors.slug = 'Slug обязателен';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {category ? 'Редактировать категорию' : 'Создать категорию'}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="px-6 py-4 space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-300' : ''
                    }`}
                    placeholder="SEO и Маркетинг"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className={`w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      errors.slug ? 'border-red-300' : ''
                    }`}
                    placeholder="seo-i-marketing"
                  />
                  {errors.slug && (
                    <p className="text-red-600 text-xs mt-1">{errors.slug}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Подробное описание категории"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta заголовок
                  </label>
                  <input
                    type="text"
                    value={formData.meta_title || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="SEO заголовок для страницы категории"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Порядок сортировки
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta описание
                </label>
                <textarea
                  value={formData.meta_description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                  rows={2}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="SEO описание для страницы категории"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Цвет категории
                </label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-gray-900' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-16 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Изображение категории
                </label>
                <input
                  type="url"
                  value={formData.image || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image && (
                  <div className="mt-2">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Показывать на сайте
                  </span>
                </label>
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {category ? 'Обновить' : 'Создать'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const BlogCategoriesManager: React.FC = () => {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const [draggedCategoryId, setDraggedCategoryId] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await blogApi.categories.getCategories();
      setCategories((response.data as any).data);
    } catch (err) {
      setError('Ошибка загрузки категорий');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: BlogCategory) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (data: BlogCategoryCreateRequest) => {
    try {
      if (editingCategory) {
        await blogApi.categories.updateCategory(editingCategory.id, data);
      } else {
        await blogApi.categories.createCategory(data);
      }
      
      setIsModalOpen(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      console.error('Error saving category:', err);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    const confirmMessage = category.published_articles_count && category.published_articles_count > 0
      ? `Вы уверены, что хотите удалить категорию "${category.name}"? В ней ${category.published_articles_count} статей, которые останутся без категории.`
      : `Вы уверены, что хотите удалить категорию "${category.name}"?`;

    if (window.confirm(confirmMessage)) {
      try {
        await blogApi.categories.deleteCategory(id);
        fetchCategories();
      } catch (err) {
        console.error('Error deleting category:', err);
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedCategoryId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    
    if (!draggedCategoryId || draggedCategoryId === targetId) {
      setDraggedCategoryId(null);
      return;
    }

    const draggedIndex = categories.findIndex(c => c.id === draggedCategoryId);
    const targetIndex = categories.findIndex(c => c.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedCategoryId(null);
      return;
    }

    const newCategories = [...categories];
    const [draggedCategory] = newCategories.splice(draggedIndex, 1);
    newCategories.splice(targetIndex, 0, draggedCategory);

    setCategories(newCategories);
    setDraggedCategoryId(null);

    try {
      const categoryIds = newCategories.map(category => category.id);
      await blogApi.categories.reorderCategories(categoryIds);
    } catch (err) {
      console.error('Error reordering categories:', err);
      fetchCategories();
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Категории блога</h1>
        <button
          onClick={handleCreateCategory}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          ➕ Добавить категорию
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <span className="text-red-400 text-xl">⚠️</span>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Ошибка</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📂</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Категорий пока нет
          </h3>
          <p className="text-gray-500 mb-4">
            Создайте первую категорию для организации статей блога
          </p>
          <button
            onClick={handleCreateCategory}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ➕ Создать категорию
          </button>
        </div>
      ) : (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <span className="text-blue-600 text-xl">💡</span>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Подсказка</h3>
                <p className="mt-1 text-sm text-blue-700">
                  Перетаскивайте категории для изменения их порядка отображения. 
                  Цвет категории будет отображаться рядом с названием статей.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            ))}
          </div>
        </>
      )}

      <CategoryModal
        isOpen={isModalOpen}
        category={editingCategory}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
      />
    </div>
  );
};

export default BlogCategoriesManager; 