import React, { useState, useEffect } from 'react';
import { blogApi } from '../../../utils/blogApi';
import type { BlogSEOSettings } from '../../../types/blog';

interface SettingsCardProps {
  title: string;
  description: string;
  icon: string;
  children: React.ReactNode;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const SettingsCard: React.FC<SettingsCardProps> = ({ 
  title, 
  description, 
  icon, 
  children, 
  isExpanded = true,
  onToggle 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div 
        className={`px-6 py-4 border-b ${onToggle ? 'cursor-pointer hover:bg-gray-50' : ''}`}
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{icon}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          {onToggle && (
            <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="px-6 py-4">
          {children}
        </div>
      )}
    </div>
  );
};

interface FilePreviewModalProps {
  isOpen: boolean;
  title: string;
  content: string;
  type: 'xml' | 'text' | 'json';
  onClose: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ 
  isOpen, 
  title, 
  content, 
  type, 
  onClose 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-hidden">
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{title}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-6 max-h-96 overflow-y-auto">
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
              <code className={`language-${type}`}>{content}</code>
            </pre>
          </div>

          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface RobotsEditorModalProps {
  isOpen: boolean;
  content: string;
  onClose: () => void;
  onSave: (content: string) => void;
}

const RobotsEditorModal: React.FC<RobotsEditorModalProps> = ({ 
  isOpen, 
  content, 
  onClose, 
  onSave 
}) => {
  const [editedContent, setEditedContent] = useState(content);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  const validateRobots = (text: string): string[] => {
    const lines = text.split('\n');
    const errors: string[] = [];
    let hasUserAgent = false;
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) return;
      
      const [directive, ...valueParts] = trimmedLine.split(':');
      const value = valueParts.join(':').trim();
      
      if (!directive || !value) {
        errors.push(`Строка ${index + 1}: Неверный формат`);
        return;
      }
      
      const normalizedDirective = directive.toLowerCase().trim();
      
      switch (normalizedDirective) {
        case 'user-agent':
          hasUserAgent = true;
          break;
        case 'disallow':
        case 'allow':
          if (!hasUserAgent) {
            errors.push(`Строка ${index + 1}: ${directive} должен идти после User-agent`);
          }
          break;
        case 'sitemap':
          if (!value.startsWith('http')) {
            errors.push(`Строка ${index + 1}: Sitemap должен быть полным URL`);
          }
          break;
        case 'crawl-delay':
          if (isNaN(Number(value))) {
            errors.push(`Строка ${index + 1}: Crawl-delay должен быть числом`);
          }
          break;
      }
    });
    
    return errors;
  };

  const handleSave = () => {
    const validationErrors = validateRobots(editedContent);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors([]);
    onSave(editedContent);
    onClose();
  };

  if (!isOpen) return null;

  const templates = [
    {
      name: 'Базовый',
      content: `User-agent: *
Allow: /
Disallow: /admin/
Sitemap: https://example.com/blog/sitemap.xml`
    },
    {
      name: 'Строгий',
      content: `User-agent: *
Disallow: /admin/
Disallow: /private/
Disallow: /api/
Allow: /
Crawl-delay: 1
Sitemap: https://example.com/blog/sitemap.xml`
    },
    {
      name: 'Для разработки',
      content: `User-agent: *
Disallow: /`
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full">
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Редактор robots.txt</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Содержимое robots.txt</h3>
                  <div className="flex space-x-2">
                    {templates.map((template) => (
                      <button
                        key={template.name}
                        onClick={() => setEditedContent(template.content)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={15}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="User-agent: *&#10;Allow: /&#10;Disallow: /admin/&#10;Sitemap: https://example.com/blog/sitemap.xml"
                />
                
                {errors.length > 0 && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                    <h4 className="text-sm font-medium text-red-800 mb-2">Ошибки валидации:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-medium mb-4">Справка по директивам</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <code className="bg-gray-100 px-2 py-1 rounded">User-agent: *</code>
                    <p className="mt-1 text-gray-600">Применяется ко всем роботам</p>
                  </div>
                  <div>
                    <code className="bg-gray-100 px-2 py-1 rounded">Allow: /path/</code>
                    <p className="mt-1 text-gray-600">Разрешает доступ к указанному пути</p>
                  </div>
                  <div>
                    <code className="bg-gray-100 px-2 py-1 rounded">Disallow: /path/</code>
                    <p className="mt-1 text-gray-600">Запрещает доступ к указанному пути</p>
                  </div>
                  <div>
                    <code className="bg-gray-100 px-2 py-1 rounded">Sitemap: URL</code>
                    <p className="mt-1 text-gray-600">Указывает расположение sitemap.xml</p>
                  </div>
                  <div>
                    <code className="bg-gray-100 px-2 py-1 rounded">Crawl-delay: 1</code>
                    <p className="mt-1 text-gray-600">Задержка между запросами в секундах</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={errors.length > 0}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BlogSEOSettings: React.FC = () => {
  const [settings, setSettings] = useState<BlogSEOSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
    basic: true,
    automation: true,
    files: true,
    analytics: false,
    social: false,
  });
  
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    title: string;
    content: string;
    type: 'xml' | 'text' | 'json';
  }>({
    isOpen: false,
    title: '',
    content: '',
    type: 'text',
  });

  const [robotsModal, setRobotsModal] = useState({
    isOpen: false,
    content: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await blogApi.seo.getSettings();
      setSettings((response.data as any).data);
    } catch (err) {
      setError('Ошибка загрузки настроек');
      console.error('Error fetching SEO settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      setError(null);
      await blogApi.seo.updateSettings(settings);
    } catch (err) {
      setError('Ошибка сохранения настроек');
      console.error('Error saving SEO settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async (type: 'sitemap' | 'rss' | 'robots') => {
    try {
      let response;
      let title;
      let fileType: 'xml' | 'text' | 'json' = 'text';

      switch (type) {
        case 'sitemap':
          response = await blogApi.seo.previewSitemap();
          title = 'Предпросмотр sitemap.xml';
          fileType = 'json';
          break;
        case 'rss':
          response = await blogApi.seo.previewRSS();
          title = 'Предпросмотр RSS ленты';
          fileType = 'json';
          break;
        case 'robots':
          response = await blogApi.seo.previewRobots();
          title = 'Предпросмотр robots.txt';
          fileType = 'text';
          break;
      }

      setPreviewModal({
        isOpen: true,
        title,
        content: JSON.stringify((response.data as any).data, null, 2),
        type: fileType,
      });
    } catch (err) {
      console.error(`Error previewing ${type}:`, err);
    }
  };

  const handleEditRobots = () => {
    setRobotsModal({
      isOpen: true,
      content: settings?.robots_txt || '',
    });
  };

  const handleSaveRobots = (content: string) => {
    if (settings) {
      setSettings({ ...settings, robots_txt: content });
    }
  };

  const toggleCard = (cardId: string) => {
    setExpandedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const updateSettings = (updates: Partial<BlogSEOSettings>) => {
    if (settings) {
      setSettings({ ...settings, ...updates });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">SEO настройки</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Сохранение...' : '💾 Сохранить'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <span className="text-red-400 text-xl">⚠️</span>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Ошибка</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <SettingsCard
        title="Основные настройки"
        description="Базовые SEO параметры для блога"
        icon="🏗️"
        isExpanded={expandedCards.basic}
        onToggle={() => toggleCard('basic')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название блога
            </label>
            <input
              type="text"
              value={settings.site_name}
              onChange={(e) => updateSettings({ site_name: e.target.value })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="ProHelper Blog"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Изображение по умолчанию
            </label>
            <input
              type="url"
              value={settings.default_og_image || ''}
              onChange={(e) => updateSettings({ default_og_image: e.target.value })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/default-og.jpg"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Описание блога по умолчанию
          </label>
          <textarea
            value={settings.site_description || ''}
            onChange={(e) => updateSettings({ site_description: e.target.value })}
            rows={3}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Блог о технологиях и бизнесе"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ключевые слова по умолчанию
          </label>
          <input
            type="text"
            value={settings.site_keywords?.join(', ') || ''}
            onChange={(e) => updateSettings({ 
              site_keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) 
            })}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="технологии, бизнес, seo"
          />
          <div className="text-xs text-gray-500 mt-1">
            Разделяйте запятыми
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Автоматизация"
        description="Настройки автоматического создания SEO данных"
        icon="🤖"
        isExpanded={expandedCards.automation}
        onToggle={() => toggleCard('automation')}
      >
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.auto_generate_meta_description}
              onChange={(e) => updateSettings({ auto_generate_meta_description: e.target.checked })}
              className="text-blue-600 focus:ring-blue-500 rounded"
            />
            <span className="ml-3">
              <span className="font-medium">Автогенерация meta описаний</span>
              <div className="text-sm text-gray-500">
                Автоматически создавать meta description из содержимого статьи
              </div>
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.enable_structured_data}
              onChange={(e) => updateSettings({ enable_structured_data: e.target.checked })}
              className="text-blue-600 focus:ring-blue-500 rounded"
            />
            <span className="ml-3">
              <span className="font-medium">Структурированные данные</span>
              <div className="text-sm text-gray-500">
                Добавлять JSON-LD разметку для поисковых систем
              </div>
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.enable_breadcrumbs}
              onChange={(e) => updateSettings({ enable_breadcrumbs: e.target.checked })}
              className="text-blue-600 focus:ring-blue-500 rounded"
            />
            <span className="ml-3">
              <span className="font-medium">Хлебные крошки</span>
              <div className="text-sm text-gray-500">
                Показывать навигационную цепочку на страницах
              </div>
            </span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Максимальная длина meta description
            </label>
            <input
              type="number"
              value={settings.meta_description_length}
              onChange={(e) => updateSettings({ meta_description_length: Number(e.target.value) })}
              className="w-32 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              min="120"
              max="300"
            />
            <div className="text-xs text-gray-500 mt-1">
              Рекомендуется 150-160 символов
            </div>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Файлы"
        description="Управление sitemap, RSS и robots.txt"
        icon="📄"
        isExpanded={expandedCards.files}
        onToggle={() => toggleCard('files')}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Sitemap.xml</h4>
              <span className={`px-2 py-1 rounded-full text-xs ${
                settings.enable_sitemap 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {settings.enable_sitemap ? 'Включен' : 'Отключен'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Автоматически генерируемая карта сайта
            </p>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.enable_sitemap}
                  onChange={(e) => updateSettings({ enable_sitemap: e.target.checked })}
                  className="text-blue-600 focus:ring-blue-500 rounded"
                />
                <span className="ml-2 text-sm">Генерировать автоматически</span>
              </label>
              <button
                onClick={() => handlePreview('sitemap')}
                className="w-full px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                👁️ Предпросмотр
              </button>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">RSS лента</h4>
              <span className={`px-2 py-1 rounded-full text-xs ${
                settings.enable_rss 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {settings.enable_rss ? 'Включена' : 'Отключена'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              RSS лента последних статей
            </p>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.enable_rss}
                  onChange={(e) => updateSettings({ enable_rss: e.target.checked })}
                  className="text-blue-600 focus:ring-blue-500 rounded"
                />
                <span className="ml-2 text-sm">Генерировать RSS</span>
              </label>
              <button
                onClick={() => handlePreview('rss')}
                className="w-full px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                👁️ Предпросмотр
              </button>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Robots.txt</h4>
              <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                Настраиваемый
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Правила для поисковых роботов
            </p>
            <div className="space-y-2">
              <button
                onClick={handleEditRobots}
                className="w-full px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                ✏️ Редактировать
              </button>
              <button
                onClick={() => handlePreview('robots')}
                className="w-full px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                👁️ Предпросмотр
              </button>
            </div>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Аналитика"
        description="Подключение систем веб-аналитики"
        icon="📊"
        isExpanded={expandedCards.analytics}
        onToggle={() => toggleCard('analytics')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google Analytics ID
            </label>
            <input
              type="text"
              value={settings.google_analytics_id || ''}
              onChange={(e) => updateSettings({ google_analytics_id: e.target.value })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="GA-XXXXXXXX-X"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yandex Metrica ID
            </label>
            <input
              type="text"
              value={settings.yandex_metrica_id || ''}
              onChange={(e) => updateSettings({ yandex_metrica_id: e.target.value })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="12345678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google Search Console
            </label>
            <input
              type="text"
              value={settings.google_search_console_verification || ''}
              onChange={(e) => updateSettings({ google_search_console_verification: e.target.value })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Код верификации"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yandex Webmaster
            </label>
            <input
              type="text"
              value={settings.yandex_webmaster_verification || ''}
              onChange={(e) => updateSettings({ yandex_webmaster_verification: e.target.value })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Код верификации"
            />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Социальные сети"
        description="Ссылки на профили в социальных сетях"
        icon="🌐"
        isExpanded={expandedCards.social}
        onToggle={() => toggleCard('social')}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facebook
            </label>
            <input
              type="url"
              value={settings.social_media_links?.facebook || ''}
              onChange={(e) => updateSettings({ 
                social_media_links: { 
                  ...settings.social_media_links, 
                  facebook: e.target.value 
                } 
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://facebook.com/yourpage"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Twitter
            </label>
            <input
              type="url"
              value={settings.social_media_links?.twitter || ''}
              onChange={(e) => updateSettings({ 
                social_media_links: { 
                  ...settings.social_media_links, 
                  twitter: e.target.value 
                } 
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://twitter.com/yourpage"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn
            </label>
            <input
              type="url"
              value={settings.social_media_links?.linkedin || ''}
              onChange={(e) => updateSettings({ 
                social_media_links: { 
                  ...settings.social_media_links, 
                  linkedin: e.target.value 
                } 
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://linkedin.com/company/yourpage"
            />
          </div>
        </div>
      </SettingsCard>

      <FilePreviewModal
        isOpen={previewModal.isOpen}
        title={previewModal.title}
        content={previewModal.content}
        type={previewModal.type}
        onClose={() => setPreviewModal({ ...previewModal, isOpen: false })}
      />

      <RobotsEditorModal
        isOpen={robotsModal.isOpen}
        content={robotsModal.content}
        onClose={() => setRobotsModal({ ...robotsModal, isOpen: false })}
        onSave={handleSaveRobots}
      />
    </div>
  );
};

export default BlogSEOSettings; 