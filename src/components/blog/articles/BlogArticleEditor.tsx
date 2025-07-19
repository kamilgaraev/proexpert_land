import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { blogApi } from '../../../utils/blogApi';
import type { BlogArticle, BlogCategory, BlogArticleCreateRequest } from '../../../types/blog';

interface SEOSectionProps {
  formData: BlogArticleCreateRequest;
  onChange: (data: Partial<BlogArticleCreateRequest>) => void;
}

const SEOSection: React.FC<SEOSectionProps> = ({ formData, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 text-left flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-t-lg"
      >
        <span className="font-medium">🔍 SEO настройки</span>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      
      {isExpanded && (
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta заголовок
            </label>
            <input
              type="text"
              value={formData.meta_title || ''}
              onChange={(e) => onChange({ meta_title: e.target.value })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Будет использован заголовок статьи"
              maxLength={60}
            />
            <div className="text-xs text-gray-500 mt-1">
              {(formData.meta_title || '').length}/60 символов
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta описание
            </label>
            <textarea
              value={formData.meta_description || ''}
              onChange={(e) => onChange({ meta_description: e.target.value })}
              rows={3}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Описание для поисковых систем"
              maxLength={160}
            />
            <div className="text-xs text-gray-500 mt-1">
              {(formData.meta_description || '').length}/160 символов
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ключевые слова
            </label>
            <input
              type="text"
              value={formData.meta_keywords?.join(', ') || ''}
              onChange={(e) => onChange({ meta_keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="seo, блог, маркетинг"
            />
            <div className="text-xs text-gray-500 mt-1">
              Разделяйте запятыми
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OG заголовок
              </label>
              <input
                type="text"
                value={formData.og_title || ''}
                onChange={(e) => onChange({ og_title: e.target.value })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Заголовок для соцсетей"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OG изображение
              </label>
              <input
                type="url"
                value={formData.og_image || ''}
                onChange={(e) => onChange({ og_image: e.target.value })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="URL изображения для соцсетей"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OG описание
            </label>
            <textarea
              value={formData.og_description || ''}
              onChange={(e) => onChange({ og_description: e.target.value })}
              rows={2}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Описание для соцсетей"
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Предпросмотр в Google</h4>
            <div className="space-y-1">
              <div className="text-blue-600 text-lg">
                {formData.meta_title || formData.title || 'Заголовок статьи'}
              </div>
              <div className="text-green-600 text-sm">
                example.com/blog/{formData.slug || 'slug-statii'}
              </div>
              <div className="text-gray-600 text-sm">
                {formData.meta_description || formData.excerpt || 'Описание статьи будет отображаться здесь...'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  placeholder?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, label, placeholder }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="space-y-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder={placeholder || "URL изображения"}
        />
        {value && (
          <div className="relative">
            <img 
              src={value} 
              alt="Preview" 
              className="w-full h-48 object-cover rounded-lg border"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="text-gray-400 text-4xl mb-2">📷</div>
          <div className="text-sm text-gray-600">
            Drag & drop изображение или{' '}
            <button type="button" className="text-blue-600 hover:text-blue-700">
              выберите файл
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BlogArticleEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [formData, setFormData] = useState<BlogArticleCreateRequest>({
    title: '',
    category_id: 0,
    content: '',
    excerpt: '',
    status: 'draft',
    is_featured: false,
    allow_comments: true,
    is_published_in_rss: true,
    noindex: false,
    tags: [],
  });

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchArticle();
    }
  }, [isEditing, id]);

  useEffect(() => {
    if (formData.title && !formData.slug) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-zа-я0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title]);

  const fetchCategories = async () => {
    try {
      const response = await blogApi.categories.getCategories();
      setCategories((response.data as any).data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await blogApi.articles.getArticle(Number(id));
      const article = (response.data as any).data as BlogArticle;
      
      setFormData({
        title: article.title,
        slug: article.slug,
        category_id: article.category.id,
        excerpt: article.excerpt,
        content: article.content,
        featured_image: article.featured_image,
        meta_title: article.meta_title,
        meta_description: article.meta_description,
        meta_keywords: article.meta_keywords,
        og_title: article.og_title,
        og_description: article.og_description,
        og_image: article.og_image,
        status: article.status,
        scheduled_at: article.scheduled_at,
        is_featured: article.is_featured,
        allow_comments: article.allow_comments,
        is_published_in_rss: article.is_published_in_rss,
        noindex: article.noindex,
        sort_order: article.sort_order,
        tags: article.tags.map(tag => tag.name),
      });
    } catch (err) {
      setError('Ошибка загрузки статьи');
      console.error('Error fetching article:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (status?: 'draft' | 'published' | 'scheduled') => {
    try {
      setSaving(true);
      setError(null);

      if (!formData.title.trim()) {
        setError('Заголовок статьи обязателен');
        return;
      }

      if (!formData.category_id) {
        setError('Выберите категорию');
        return;
      }

      if (!formData.content.trim()) {
        setError('Содержимое статьи обязательно');
        return;
      }

      const dataToSave = {
        ...formData,
        status: status || formData.status,
      };

      if (isEditing) {
        await blogApi.articles.updateArticle(Number(id), dataToSave);
      } else {
        const response = await blogApi.articles.createArticle(dataToSave);
        const newArticle = (response.data as any).data;
        navigate(`/admin/blog/articles/${newArticle.id}/edit`, { replace: true });
      }

      setLastSaved(new Date());
      
      if (status === 'published') {
        navigate('/admin/blog/articles');
      }
    } catch (err) {
      setError('Ошибка сохранения статьи');
      console.error('Error saving article:', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (formData.status === 'draft') {
      await handleSave('published');
    } else {
      try {
        await blogApi.articles.publishArticle(Number(id));
        navigate('/admin/blog/articles');
      } catch (err) {
        setError('Ошибка публикации статьи');
      }
    }
  };

  const handleFormChange = (updates: Partial<BlogArticleCreateRequest>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? `Редактировать: ${formData.title || 'Статья'}` : 'Создать статью'}
              </h1>
              {lastSaved && (
                <p className="text-sm text-gray-500 mt-1">
                  Последнее сохранение: {lastSaved.toLocaleTimeString('ru-RU')}
                </p>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => window.open(`/blog/${formData.slug}`, '_blank')}
                disabled={!isEditing}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                👁️ Предпросмотр
              </button>
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg disabled:opacity-50"
              >
                💾 {saving ? 'Сохранение...' : 'Сохранить черновик'}
              </button>
              <button
                onClick={handlePublish}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg disabled:opacity-50"
              >
                🚀 {formData.status === 'published' ? 'Обновить' : 'Опубликовать'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="px-6 py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <span className="text-red-400 text-xl">⚠️</span>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Ошибка</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex">
          <div className="flex-1 p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Заголовок статьи *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleFormChange({ title: e.target.value })}
                  className="w-full text-2xl font-bold border-0 border-b-2 border-gray-200 focus:border-blue-500 focus:ring-0 p-2"
                  placeholder="Введите заголовок статьи..."
                  maxLength={255}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.title.length}/255 символов
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug (URL)
                  </label>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) => handleFormChange({ slug: e.target.value })}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="url-friendly-slug"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Категория *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => handleFormChange({ category_id: Number(e.target.value) })}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={0}>Выберите категорию</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Краткое описание
                </label>
                <textarea
                  value={formData.excerpt || ''}
                  onChange={(e) => handleFormChange({ excerpt: e.target.value })}
                  rows={3}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Краткое описание статьи для превью..."
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {(formData.excerpt || '').length}/500 символов
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Содержимое статьи *
                </label>
                <div className="border border-gray-300 rounded-lg">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-300 flex space-x-2">
                    <button type="button" className="p-1 hover:bg-gray-200 rounded">🅱️</button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded">🅸</button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded">🔗</button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded">📷</button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded">📝</button>
                  </div>
                  <textarea
                    value={formData.content}
                    onChange={(e) => handleFormChange({ content: e.target.value })}
                    rows={20}
                    className="w-full border-0 focus:ring-0 p-4 resize-none"
                    placeholder="Начните писать содержимое статьи..."
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Rich Text Editor будет реализован с помощью библиотеки редактора
                </div>
              </div>

              <ImageUpload
                value={formData.featured_image || ''}
                onChange={(url) => handleFormChange({ featured_image: url })}
                label="Главное изображение"
                placeholder="URL главного изображения статьи"
              />

              <SEOSection
                formData={formData}
                onChange={handleFormChange}
              />
            </div>
          </div>

          <div className="w-80 bg-white border-l p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Статус публикации</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={formData.status === 'draft'}
                      onChange={(e) => handleFormChange({ status: e.target.value as any })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">📝 Черновик</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={formData.status === 'published'}
                      onChange={(e) => handleFormChange({ status: e.target.value as any })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">✅ Опубликовано</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="scheduled"
                      checked={formData.status === 'scheduled'}
                      onChange={(e) => handleFormChange({ status: e.target.value as any })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">⏰ Запланировано</span>
                  </label>
                </div>

                {formData.status === 'scheduled' && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Дата публикации
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.scheduled_at || ''}
                      onChange={(e) => handleFormChange({ scheduled_at: e.target.value })}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Настройки статьи</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => handleFormChange({ is_featured: e.target.checked })}
                      className="text-blue-600 focus:ring-blue-500 rounded"
                    />
                    <span className="ml-2">🌟 Рекомендуемая статья</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.allow_comments}
                      onChange={(e) => handleFormChange({ allow_comments: e.target.checked })}
                      className="text-blue-600 focus:ring-blue-500 rounded"
                    />
                    <span className="ml-2">💬 Разрешить комментарии</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_published_in_rss}
                      onChange={(e) => handleFormChange({ is_published_in_rss: e.target.checked })}
                      className="text-blue-600 focus:ring-blue-500 rounded"
                    />
                    <span className="ml-2">📡 Включить в RSS</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.noindex}
                      onChange={(e) => handleFormChange({ noindex: e.target.checked })}
                      className="text-blue-600 focus:ring-blue-500 rounded"
                    />
                    <span className="ml-2">🚫 Запретить индексацию</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Теги</h3>
                <input
                  type="text"
                  value={formData.tags?.join(', ') || ''}
                  onChange={(e) => handleFormChange({ tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="seo, блог, маркетинг"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Разделяйте запятыми
                </div>
                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => {
                            const newTags = formData.tags?.filter((_, i) => i !== index);
                            handleFormChange({ tags: newTags });
                          }}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Предпросмотр статьи</h3>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="space-y-2">
                    {formData.featured_image && (
                      <img 
                        src={formData.featured_image} 
                        alt="" 
                        className="w-full h-32 object-cover rounded"
                      />
                    )}
                    <h4 className="font-semibold line-clamp-2">
                      {formData.title || 'Заголовок статьи'}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {formData.excerpt || 'Краткое описание статьи...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogArticleEditor; 