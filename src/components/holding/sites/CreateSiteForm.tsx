import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useHoldingSites } from '@/hooks/useHoldingSites';
import { usePermissionsContext } from '@/contexts/PermissionsContext';
import { useTheme } from '@components/shared/ThemeProvider';
import type { CreateSiteRequest, SiteTemplate } from '@/types/holding-sites';

interface CreateSiteFormProps {
  holdingId: number;
}

const CreateSiteForm: React.FC<CreateSiteFormProps> = ({ holdingId }) => {
  const navigate = useNavigate();
  const { can } = usePermissionsContext();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  
  const {
    templates,
    loading,
    error,
    createSite,
    fetchTemplates
  } = useHoldingSites();

  const [formData, setFormData] = useState<CreateSiteRequest>({
    title: '',
    description: '',
    template_id: 0,
    domain: '',
    theme_config: {
      primary_color: '#3B82F6',
      secondary_color: '#64748B',
      accent_color: '#F59E0B',
      background_color: '#FFFFFF',
      text_color: '#1F2937',
      font_family: 'Inter',
      header_style: 'default',
      footer_style: 'default',
      button_style: 'default',
      layout_width: 'full'
    }
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<SiteTemplate | null>(null);
  const [step, setStep] = useState(1); // 1 - шаблон, 2 - настройки

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    if (logoFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(logoFile);
    } else {
      setLogoPreview(null);
    }
  }, [logoFile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleThemeChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      theme_config: {
        ...prev.theme_config!,
        [key]: value
      }
    }));
  };

  const handleTemplateSelect = (template: SiteTemplate) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      template_id: template.id,
      theme_config: {
        ...prev.theme_config!,
        ...template.theme_config
      }
    }));
    setStep(2);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        alert('Размер файла не должен превышать 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Можно загружать только изображения');
        return;
      }
      setLogoFile(file);
    }
  };

  const generateDomain = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-zа-я0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    setFormData(prev => ({ ...prev, domain: slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.template_id) {
      alert('Выберите шаблон для сайта');
      return;
    }

    const submitData = { ...formData };
    if (logoFile) {
      (submitData as any).logo = logoFile;
    }

    const newSite = await createSite(holdingId, submitData);
    if (newSite) {
      navigate(`/holding/${holdingId}/sites/${newSite.id}/edit`);
    }
  };

  if (!can('multi-organization.website.create')) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Доступ ограничен</h3>
        <p className="text-gray-600">У вас нет прав для создания сайтов</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Заголовок */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => step === 1 ? navigate(`/holding/${holdingId}/sites`) : setStep(1)}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 1 ? 'Выберите шаблон' : 'Настройка сайта'}
          </h1>
          <p className="text-gray-600 mt-1">
            {step === 1 
              ? 'Выберите подходящий шаблон для вашего сайта'
              : 'Заполните основную информацию о сайте'
            }
          </p>
        </div>
      </div>

      {/* Индикатор шагов */}
      <div className="flex items-center mb-8">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? theme.primary : 'bg-gray-200'} text-white text-sm font-medium`}>
          1
        </div>
        <div className={`flex-1 h-1 mx-4 ${step >= 2 ? theme.primary : 'bg-gray-200'}`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? theme.primary : 'bg-gray-200'} text-white text-sm font-medium`}>
          2
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {step === 1 && (
        <div>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <p className="text-gray-600 mt-2">Загрузка шаблонов...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="bg-white rounded-xl border-2 border-gray-200 hover:border-primary-300 cursor-pointer transition-colors group"
                >
                  <div className="aspect-video bg-gray-100 rounded-t-xl overflow-hidden">
                    <img
                      src={template.preview_image}
                      alt={template.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      {template.is_premium && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                          Premium
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {template.features.slice(0, 3).map((feature, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Основная информация */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-lg font-semibold mb-6">Основная информация</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название сайта *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Название вашего сайта"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Домен *
                </label>
                <div className="flex">
                  <input
                    type="text"
                    name="domain"
                    value={formData.domain}
                    onChange={handleInputChange}
                    required
                    className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="site-name"
                  />
                  <span className="bg-gray-50 border border-l-0 border-gray-300 rounded-r-lg px-3 py-2 text-gray-500 text-sm">
                    .prohelper.pro
                  </span>
                </div>
                <button
                  type="button"
                  onClick={generateDomain}
                  className="text-sm text-primary-600 hover:text-primary-700 mt-1"
                >
                  Сгенерировать из названия
                </button>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Краткое описание сайта"
              />
            </div>

            {/* Логотип */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Логотип
              </label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Логотип" className="w-full h-full object-cover" />
                  ) : (
                    <PhotoIcon className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
                  >
                    Выбрать файл
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG до 5MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Цветовая схема */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-lg font-semibold mb-6">Цветовая схема</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Основной цвет
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.theme_config?.primary_color}
                    onChange={(e) => handleThemeChange('primary_color', e.target.value)}
                    className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.theme_config?.primary_color}
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
                    value={formData.theme_config?.secondary_color}
                    onChange={(e) => handleThemeChange('secondary_color', e.target.value)}
                    className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.theme_config?.secondary_color}
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
                    value={formData.theme_config?.accent_color}
                    onChange={(e) => handleThemeChange('accent_color', e.target.value)}
                    className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.theme_config?.accent_color}
                    onChange={(e) => handleThemeChange('accent_color', e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Фон
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.theme_config?.background_color}
                    onChange={(e) => handleThemeChange('background_color', e.target.value)}
                    className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.theme_config?.background_color}
                    onChange={(e) => handleThemeChange('background_color', e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Назад
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className={`${theme.primary} ${theme.hover} text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50`}
            >
              {loading ? 'Создание...' : 'Создать сайт'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateSiteForm;
