import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import {
  ArrowLeftIcon,
  EyeIcon,
  CloudArrowUpIcon,
  Cog6ToothIcon,
  PhotoIcon,
  DocumentTextIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { useHoldingSites } from '@/hooks/useHoldingSites';
import { usePermissionsContext } from '@/contexts/PermissionsContext';
import { useTheme } from '@components/shared/ThemeProvider';
import BlockEditor from './BlockEditor';
import MediaManager from './MediaManager';
import type { UpdateSiteRequest } from '@/types/holding-sites';

interface SiteEditorProps {
  siteId: number;
  holdingId: number;
}

const SiteEditor: React.FC<SiteEditorProps> = ({ siteId, holdingId }) => {
  const navigate = useNavigate();
  const { can } = usePermissionsContext();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  
  const {
    currentSite,
    loading,
    error,
    fetchSite,
    updateSite,
    publishSite
  } = useHoldingSites();

  const [activeTab, setActiveTab] = useState(0);
  const [siteSettings, setSiteSettings] = useState<UpdateSiteRequest>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    fetchSite(siteId);
  }, [siteId, fetchSite]);

  useEffect(() => {
    if (currentSite) {
      setSiteSettings({
        title: currentSite.title,
        description: currentSite.description,
        theme_config: currentSite.theme_config,
        seo_meta: currentSite.seo_meta,
        analytics_config: currentSite.analytics_config
      });
    }
  }, [currentSite]);

  const tabs = [
    { 
      name: 'Блоки', 
      icon: DocumentTextIcon, 
      component: <BlockEditor siteId={siteId} />,
      permission: 'multi-organization.website.blocks.edit'
    },
    { 
      name: 'Медиафайлы', 
      icon: PhotoIcon, 
      component: <MediaManager siteId={siteId} />,
      permission: 'multi-organization.website.assets.upload'
    },
    { 
      name: 'Настройки', 
      icon: Cog6ToothIcon, 
      component: <SiteSettingsForm 
        settings={siteSettings} 
        onChange={setSiteSettings}
        onChangesDetected={() => setHasUnsavedChanges(true)}
      />,
      permission: 'multi-organization.website.edit'
    }
  ];

  const availableTabs = tabs.filter(tab => can(tab.permission));

  const handleSaveSettings = async () => {
    if (!currentSite) return;
    
    const success = await updateSite(currentSite.id, siteSettings);
    if (success) {
      setHasUnsavedChanges(false);
    }
  };

  const handlePublish = async () => {
    if (!currentSite) return;
    
    if (hasUnsavedChanges) {
      const shouldSave = confirm('У вас есть несохраненные изменения. Сохранить перед публикацией?');
      if (shouldSave) {
        await handleSaveSettings();
      }
    }
    
    await publishSite(currentSite.id);
  };

  const handlePreview = () => {
    if (currentSite) {
      window.open(currentSite.preview_url, '_blank');
    }
  };

  const classNames = (...classes: string[]) => {
    return classes.filter(Boolean).join(' ');
  };

  if (!can('multi-organization.website.edit')) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Доступ ограничен</h3>
        <p className="text-gray-600">У вас нет прав для редактирования сайтов</p>
      </div>
    );
  }

  if (loading && !currentSite) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        <p className="text-gray-600 mt-2">Загрузка сайта...</p>
      </div>
    );
  }

  if (!currentSite) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Сайт не найден</h3>
        <p className="text-gray-600">Проверьте правильность ссылки или обратитесь к администратору</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Шапка редактора */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/holding/${holdingId}/sites`)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{currentSite.title}</h1>
                <p className="text-sm text-gray-600">{currentSite.domain}.prohelper.pro</p>
              </div>

              {/* Статус */}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                currentSite.status === 'published' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {currentSite.status === 'published' ? 'Опубликован' : 'Черновик'}
              </span>

              {hasUnsavedChanges && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Есть изменения
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePreview}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <EyeIcon className="h-4 w-4" />
                Превью
              </button>

              {hasUnsavedChanges && (
                <button
                  onClick={handleSaveSettings}
                  className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <CloudArrowUpIcon className="h-4 w-4" />
                  Сохранить
                </button>
              )}

              {can('multi-organization.website.publish') && (
                <button
                  onClick={handlePublish}
                  className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors ${theme.primary} ${theme.hover}`}
                >
                  <GlobeAltIcon className="h-4 w-4" />
                  Опубликовать
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Вкладки и контент */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6">
            {availableTabs.map((tab, index) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 px-4 text-sm font-medium leading-5 transition-colors',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                    selected
                      ? `${theme.primary.replace('bg-', 'bg-')} text-white shadow`
                      : 'text-blue-700 hover:bg-white/[0.12] hover:text-blue-800'
                  )
                }
              >
                <div className="flex items-center justify-center gap-2">
                  <tab.icon className="h-4 w-4" />
                  {tab.name}
                </div>
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels>
            {availableTabs.map((tab) => (
              <Tab.Panel key={tab.name} className="focus:outline-none">
                {tab.component}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

// Компонент настроек сайта
const SiteSettingsForm: React.FC<{
  settings: UpdateSiteRequest;
  onChange: (settings: UpdateSiteRequest) => void;
  onChangesDetected: () => void;
}> = ({ settings, onChange, onChangesDetected }) => {
  const handleChange = (field: string, value: any) => {
    onChange({ ...settings, [field]: value });
    onChangesDetected();
  };

  const handleThemeChange = (key: string, value: string) => {
    onChange({
      ...settings,
      theme_config: {
        ...settings.theme_config!,
        [key]: value
      }
    });
    onChangesDetected();
  };

  const handleSeoChange = (key: string, value: string) => {
    onChange({
      ...settings,
      seo_meta: {
        ...settings.seo_meta!,
        [key]: value
      }
    });
    onChangesDetected();
  };

  return (
    <div className="space-y-8">
      {/* Основные настройки */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-6">Основные настройки</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название сайта
            </label>
            <input
              type="text"
              value={settings.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание
            </label>
            <textarea
              value={settings.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Цветовая схема */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-6">Цветовая схема</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Основной цвет
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.theme_config?.primary_color || '#3B82F6'}
                onChange={(e) => handleThemeChange('primary_color', e.target.value)}
                className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={settings.theme_config?.primary_color || '#3B82F6'}
                onChange={(e) => handleThemeChange('primary_color', e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Вторичный цвет
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.theme_config?.secondary_color || '#64748B'}
                onChange={(e) => handleThemeChange('secondary_color', e.target.value)}
                className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={settings.theme_config?.secondary_color || '#64748B'}
                onChange={(e) => handleThemeChange('secondary_color', e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Акцентный цвет
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.theme_config?.accent_color || '#F59E0B'}
                onChange={(e) => handleThemeChange('accent_color', e.target.value)}
                className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={settings.theme_config?.accent_color || '#F59E0B'}
                onChange={(e) => handleThemeChange('accent_color', e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Цвет фона
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.theme_config?.background_color || '#FFFFFF'}
                onChange={(e) => handleThemeChange('background_color', e.target.value)}
                className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={settings.theme_config?.background_color || '#FFFFFF'}
                onChange={(e) => handleThemeChange('background_color', e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SEO настройки */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-6">SEO настройки</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Title
            </label>
            <input
              type="text"
              value={settings.seo_meta?.meta_title || ''}
              onChange={(e) => handleSeoChange('meta_title', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Заголовок для поисковых систем"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description
            </label>
            <textarea
              value={settings.seo_meta?.meta_description || ''}
              onChange={(e) => handleSeoChange('meta_description', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Описание для поисковых систем"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ключевые слова
            </label>
            <input
              type="text"
              value={settings.seo_meta?.meta_keywords || ''}
              onChange={(e) => handleSeoChange('meta_keywords', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="ключевые, слова, через, запятую"
            />
          </div>
        </div>
      </div>

      {/* Аналитика */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-6">Аналитика</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Analytics ID
            </label>
            <input
              type="text"
              value={settings.analytics_config?.google_analytics_id || ''}
              onChange={(e) => onChange({
                ...settings,
                analytics_config: {
                  ...settings.analytics_config!,
                  google_analytics_id: e.target.value
                }
              })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="G-XXXXXXXXXX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Яндекс.Метрика ID
            </label>
            <input
              type="text"
              value={settings.analytics_config?.yandex_metrika_id || ''}
              onChange={(e) => onChange({
                ...settings,
                analytics_config: {
                  ...settings.analytics_config!,
                  yandex_metrika_id: e.target.value
                }
              })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="12345678"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteEditor;
