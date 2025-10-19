import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import {
  Cog6ToothIcon,
  PaintBrushIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import type { HoldingLanding, UpdateLandingRequest } from '@/types/holding-landing';

interface Props {
  landing: HoldingLanding;
  onUpdate: (data: UpdateLandingRequest) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export const LandingSettings: React.FC<Props> = ({ landing, onUpdate, loading, error }) => {
  const [formData, setFormData] = useState<UpdateLandingRequest>({
    title: landing.title || '',
    description: landing.description || '',
    theme_config: landing.theme_config || {},
    seo_meta: landing.seo_meta || {},
    analytics_config: landing.analytics_config || {},
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    setFormData({
      title: landing.title || '',
      description: landing.description || '',
      theme_config: landing.theme_config || {},
      seo_meta: landing.seo_meta || {},
      analytics_config: landing.analytics_config || {},
    });
  }, [landing]);

  const handleSave = async () => {
    setSaveStatus('saving');
    const success = await onUpdate(formData);
    setSaveStatus(success ? 'saved' : 'error');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleThemeChange = (key: string, value: string) => {
    setFormData({
      ...formData,
      theme_config: {
        ...formData.theme_config,
        [key]: value,
      },
    });
  };

  const handleSeoChange = (key: string, value: string) => {
    setFormData({
      ...formData,
      seo_meta: {
        ...formData.seo_meta,
        [key]: value,
      },
    });
  };

  const handleAnalyticsChange = (key: string, value: string) => {
    setFormData({
      ...formData,
      analytics_config: {
        ...formData.analytics_config,
        [key]: value,
      },
    });
  };

  const tabs = [
    { name: 'Основные', icon: Cog6ToothIcon },
    { name: 'Тема оформления', icon: PaintBrushIcon },
    { name: 'SEO', icon: MagnifyingGlassIcon },
    { name: 'Аналитика', icon: ChartBarIcon },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Настройки лендинга</h3>
          <p className="text-sm text-gray-600 mt-1">
            Общие настройки, тема оформления и SEO параметры
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading || saveStatus === 'saving'}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saveStatus === 'saving' && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          )}
          {saveStatus === 'saved' && <CheckIcon className="w-5 h-5" />}
          {saveStatus === 'saving'
            ? 'Сохранение...'
            : saveStatus === 'saved'
            ? 'Сохранено'
            : 'Сохранить изменения'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-50 p-1">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 px-4 text-sm font-medium leading-5 transition-colors ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${
                  selected
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-blue-600 hover:bg-white/[0.5] hover:text-blue-700'
                }`
              }
            >
              <div className="flex items-center justify-center gap-2">
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </div>
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels className="mt-6">
          <Tab.Panel className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Основная информация</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название лендинга
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Название вашего холдинга"
                    maxLength={255}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Максимум 255 символов. Отображается в заголовке сайта.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Краткое описание вашей компании"
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Максимум 1000 символов. Используется в мета-тегах.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">🌐</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">URL лендинга</p>
                      <p className="text-sm text-gray-600 mt-1">{landing.url}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        URL автоматически формируется на основе поддомена вашего холдинга
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Tab.Panel>

          <Tab.Panel className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Цветовая схема</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Основной цвет
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.theme_config?.primary_color || '#2563eb'}
                      onChange={(e) => handleThemeChange('primary_color', e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.theme_config?.primary_color || '#2563eb'}
                      onChange={(e) => handleThemeChange('primary_color', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Вторичный цвет
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.theme_config?.secondary_color || '#64748b'}
                      onChange={(e) => handleThemeChange('secondary_color', e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.theme_config?.secondary_color || '#64748b'}
                      onChange={(e) => handleThemeChange('secondary_color', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Акцентный цвет
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.theme_config?.accent_color || '#f59e0b'}
                      onChange={(e) => handleThemeChange('accent_color', e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.theme_config?.accent_color || '#f59e0b'}
                      onChange={(e) => handleThemeChange('accent_color', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Цвет фона
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.theme_config?.background_color || '#ffffff'}
                      onChange={(e) => handleThemeChange('background_color', e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.theme_config?.background_color || '#ffffff'}
                      onChange={(e) => handleThemeChange('background_color', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Цвет текста
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.theme_config?.text_color || '#1f2937'}
                      onChange={(e) => handleThemeChange('text_color', e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.theme_config?.text_color || '#1f2937'}
                      onChange={(e) => handleThemeChange('text_color', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Типографика и стили</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Семейство шрифтов
                  </label>
                  <input
                    type="text"
                    value={formData.theme_config?.font_family || 'Inter, sans-serif'}
                    onChange={(e) => handleThemeChange('font_family', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Inter, sans-serif"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Базовый размер шрифта
                  </label>
                  <input
                    type="text"
                    value={formData.theme_config?.font_size_base || '16px'}
                    onChange={(e) => handleThemeChange('font_size_base', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="16px"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Радиус скругления
                  </label>
                  <input
                    type="text"
                    value={formData.theme_config?.border_radius || '8px'}
                    onChange={(e) => handleThemeChange('border_radius', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="8px"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Стиль теней
                  </label>
                  <select
                    value={formData.theme_config?.shadow_style || 'modern'}
                    onChange={(e) => handleThemeChange('shadow_style', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="none">Без теней</option>
                    <option value="soft">Мягкие</option>
                    <option value="modern">Современные</option>
                    <option value="bold">Выраженные</option>
                  </select>
                </div>
              </div>
            </div>
          </Tab.Panel>

          <Tab.Panel className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">SEO настройки</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title
                    <span className="text-xs text-gray-500 ml-2">(рекомендуется до 60 символов)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.seo_meta?.meta_title || ''}
                    onChange={(e) => handleSeoChange('meta_title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Название для поисковых систем"
                    maxLength={60}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(formData.seo_meta?.meta_title?.length || 0)} / 60 символов
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                    <span className="text-xs text-gray-500 ml-2">
                      (рекомендуется до 160 символов)
                    </span>
                  </label>
                  <textarea
                    value={formData.seo_meta?.meta_description || ''}
                    onChange={(e) => handleSeoChange('meta_description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Описание для поисковых систем"
                    maxLength={160}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(formData.seo_meta?.meta_description?.length || 0)} / 160 символов
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ключевые слова</label>
                  <input
                    type="text"
                    value={formData.seo_meta?.meta_keywords || ''}
                    onChange={(e) => handleSeoChange('meta_keywords', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ключевое слово 1, ключевое слово 2"
                    maxLength={255}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Open Graph (соцсети)</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">OG Title</label>
                  <input
                    type="text"
                    value={formData.seo_meta?.og_title || ''}
                    onChange={(e) => handleSeoChange('og_title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Заголовок при публикации в соцсетях"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OG Description
                  </label>
                  <textarea
                    value={formData.seo_meta?.og_description || ''}
                    onChange={(e) => handleSeoChange('og_description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Описание при публикации в соцсетях"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OG Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.seo_meta?.og_image || ''}
                    onChange={(e) => handleSeoChange('og_image', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Изображение для превью в соцсетях (рекомендуется 1200x630px)
                  </p>
                </div>
              </div>
            </div>
          </Tab.Panel>

          <Tab.Panel className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Системы аналитики</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Analytics ID
                  </label>
                  <input
                    type="text"
                    value={formData.analytics_config?.google_analytics_id || ''}
                    onChange={(e) => handleAnalyticsChange('google_analytics_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                    placeholder="G-XXXXXXXXXX или UA-XXXXXXXXX-X"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Яндекс.Метрика ID
                  </label>
                  <input
                    type="text"
                    value={formData.analytics_config?.yandex_metrika_id || ''}
                    onChange={(e) => handleAnalyticsChange('yandex_metrika_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                    placeholder="12345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook Pixel ID
                  </label>
                  <input
                    type="text"
                    value={formData.analytics_config?.facebook_pixel_id || ''}
                    onChange={(e) => handleAnalyticsChange('facebook_pixel_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                    placeholder="123456789012345"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-blue-800">
                    <strong>Совет:</strong> После добавления счетчиков аналитики, проверьте их
                    работу в инструментах разработчика соответствующих систем.
                  </p>
                </div>
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

