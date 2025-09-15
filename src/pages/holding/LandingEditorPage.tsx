import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import {
  ArrowLeftIcon,
  EyeIcon,
  CloudArrowUpIcon,
  Cog6ToothIcon,
  PhotoIcon,
  PlusIcon,
  GlobeAltIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useHoldingLanding, useLandingBlocks, useLandingAssets } from '@/hooks/useHoldingLanding';
import { usePermissionsContext } from '@/contexts/PermissionsContext';
import { useTheme } from '@components/shared/ThemeProvider';
import type { 
  BlockType, 
  UpdateBlockRequest, 
  UpdateLandingRequest,
  UpdateAssetRequest,
  AssetUsageContext 
} from '@/types/holding-landing';

const LandingEditorPage: React.FC = () => {
  const { holdingId } = useParams<{ holdingId: string }>();
  const navigate = useNavigate();
  const { can } = usePermissionsContext();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();

  const {
    landing,
    loading: landingLoading,
    error: landingError,
    fetchLanding,
    updateLanding,
    publishLanding
  } = useHoldingLanding();

  const {
    blocks,
    loading: blocksLoading,
    error: blocksError,
    fetchBlocks,
    createBlock,
    updateBlock,
    publishBlock,
    duplicateBlock,
    deleteBlock,
    reorderBlocks
  } = useLandingBlocks();

  const {
    assets,
    loading: assetsLoading,
    error: assetsError,
    fetchAssets,
    uploadAsset,
    updateAsset,
    deleteAsset
  } = useLandingAssets();

  const [activeTab, setActiveTab] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasUnsavedChanges] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);

  useEffect(() => {
    if (!holdingId) return;
    
    const numericHoldingId = parseInt(holdingId);
    if (isNaN(numericHoldingId)) {
      navigate('/dashboard');
      return;
    }

    fetchLanding(numericHoldingId);
    fetchBlocks(numericHoldingId);
    fetchAssets(numericHoldingId);
  }, [holdingId, fetchLanding, fetchBlocks, fetchAssets, navigate]);

  if (!can('multi-organization.website.view')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Доступ ограничен</h3>
          <p className="text-gray-600">У вас нет прав для просмотра редактора лендинга</p>
        </div>
      </div>
    );
  }

  if (landingLoading && !landing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <p className="text-gray-600 mt-2">Загрузка лендинга...</p>
        </div>
      </div>
    );
  }

  if (!landing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Лендинг не найден</h3>
          <p className="text-gray-600">Проверьте правильность ссылки или обратитесь к администратору</p>
        </div>
      </div>
    );
  }

  const handlePublish = async () => {
    if (!holdingId) return;
    
    if (hasUnsavedChanges) {
      const shouldSave = confirm('У вас есть несохраненные изменения. Продолжить публикацию?');
      if (!shouldSave) return;
    }
    
    const result = await publishLanding(parseInt(holdingId));
    if (result) {
      alert('Лендинг успешно опубликован!');
    }
  };

  const handlePreview = () => {
    if (landing.preview_url) {
      window.open(landing.preview_url, '_blank');
    }
  };

  const blockTypes: Array<{ type: BlockType; name: string; description: string; icon: string }> = [
    { type: 'hero', name: 'Главный баннер', description: 'Заголовок с призывом к действию', icon: '🏆' },
    { type: 'about', name: 'О компании', description: 'Информация о вашей компании', icon: '📋' },
    { type: 'services', name: 'Услуги', description: 'Список ваших услуг', icon: '⚙️' },
    { type: 'projects', name: 'Проекты', description: 'Портфолио и кейсы', icon: '📁' },
    { type: 'team', name: 'Команда', description: 'Сотрудники компании', icon: '👥' },
    { type: 'contacts', name: 'Контакты', description: 'Способы связи', icon: '📞' },
    { type: 'testimonials', name: 'Отзывы', description: 'Отзывы клиентов', icon: '💬' },
    { type: 'gallery', name: 'Галерея', description: 'Фотографии и изображения', icon: '🖼️' },
    { type: 'news', name: 'Новости', description: 'Новости и статьи', icon: '📰' },
    { type: 'custom', name: 'Произвольный', description: 'Кастомный блок', icon: '🔧' }
  ];

  const getDefaultContent = (blockType: BlockType) => {
    const contentTemplates = {
      hero: {
        title: 'Заголовок блока',
        subtitle: 'Подзаголовок блока',
        description: 'Описание блока',
        button_text: 'Перейти',
        button_url: '#',
        background_image: '',
        text_color: '#000000',
        background_color: '#ffffff'
      },
      about: {
        title: 'О компании',
        description: 'Здесь расположена информация о компании',
        image: '',
        features: []
      },
      services: {
        title: 'Наши услуги',
        description: 'Описание услуг компании',
        services: []
      },
      projects: {
        title: 'Наши проекты',
        description: 'Портфолио выполненных проектов',
        projects: []
      },
      team: {
        title: 'Наша команда',
        description: 'Познакомьтесь с нашей командой',
        members: []
      },
      contacts: {
        title: 'Контакты',
        phone: '+7 (000) 000-00-00',
        email: 'info@company.com',
        address: 'Адрес компании',
        working_hours: 'Пн-Пт: 9:00-18:00',
        social_links: []
      },
      testimonials: {
        title: 'Отзывы клиентов',
        description: 'Что говорят о нас наши клиенты',
        testimonials: []
      },
      gallery: {
        title: 'Галерея',
        description: 'Фотографии наших работ',
        images: []
      },
      news: {
        title: 'Новости',
        description: 'Актуальные новости компании',
        articles: []
      },
      custom: {
        html_content: '<div>Пользовательский контент</div>',
        css_styles: ''
      }
    };

    return contentTemplates[blockType] || { title: 'Новый блок', description: 'Описание блока' };
  };

  const handleAddBlock = async (blockType: BlockType) => {
    if (!holdingId) return;
    
    const blockConfig = blockTypes.find(b => b.type === blockType);
    const newBlock = await createBlock(parseInt(holdingId), {
      block_type: blockType,
      title: blockConfig?.name || 'Новый блок',
      content: getDefaultContent(blockType),
      settings: {
        animation: 'none',
        padding: 'normal',
        text_align: 'left'
      },
      sort_order: blocks.length,
      is_active: true
    });
    
    if (newBlock) {
      setSelectedBlockId(newBlock.id);
      setSidebarOpen(false);
    }
  };

  const tabs = [
    { 
      name: 'Блоки', 
      icon: Bars3Icon,
      component: (
        <BlocksEditor 
          blocks={blocks}
          selectedBlockId={selectedBlockId}
          onSelectBlock={setSelectedBlockId}
          onUpdateBlock={(blockId: number, data: UpdateBlockRequest) => updateBlock(parseInt(holdingId!), blockId, data)}
          onPublishBlock={(blockId: number) => publishBlock(parseInt(holdingId!), blockId)}
          onDuplicateBlock={(blockId: number) => duplicateBlock(parseInt(holdingId!), blockId)}
          onDeleteBlock={(blockId: number) => deleteBlock(parseInt(holdingId!), blockId)}
          onReorderBlocks={(order: number[]) => reorderBlocks(parseInt(holdingId!), order)}
          loading={blocksLoading}
          error={blocksError}
        />
      )
    },
    { 
      name: 'Медиафайлы', 
      icon: PhotoIcon,
      component: (
        <MediaManager 
          assets={assets}
          onUpload={(file: File, context?: AssetUsageContext, metadata?: any) => uploadAsset(parseInt(holdingId!), file, context, metadata)}
          onUpdate={(assetId: number, metadata: UpdateAssetRequest['metadata']) => updateAsset(parseInt(holdingId!), assetId, metadata)}
          onDelete={(assetId: number) => deleteAsset(parseInt(holdingId!), assetId)}
          loading={assetsLoading}
          error={assetsError}
        />
      )
    },
    { 
      name: 'Настройки', 
      icon: Cog6ToothIcon,
      component: (
        <LandingSettings 
          landing={landing}
          onUpdate={(data: UpdateLandingRequest) => updateLanding(parseInt(holdingId!), data)}
          loading={landingLoading}
          error={landingError}
        />
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Шапка редактора */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className={`${theme.primary} p-2 rounded-lg shadow-sm`}>
                  <GlobeAltIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{landing.title}</h1>
                  <p className="text-sm text-gray-600">{landing.domain}.prohelper.pro</p>
                </div>
              </div>

              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                landing.status === 'published' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {landing.status === 'published' ? 'Опубликован' : 'Черновик'}
              </span>

              {hasUnsavedChanges && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
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

              {can('multi-organization.website.publish') && (
                <button
                  onClick={handlePublish}
                  className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors ${theme.primary} ${theme.hover}`}
                >
                  <CloudArrowUpIcon className="h-4 w-4" />
                  Опубликовать
                </button>
              )}

              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Боковая панель с библиотекой блоков */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block fixed lg:static inset-y-0 left-0 z-10 w-80 bg-white border-r border-gray-200 overflow-y-auto`}>
          <div className="p-4 border-b border-gray-200 lg:hidden">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Библиотека блоков</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Добавить блок</h3>
            <div className="space-y-2">
              {blockTypes.map((blockType) => (
                <button
                  key={blockType.type}
                  onClick={() => handleAddBlock(blockType.type)}
                  className="w-full p-3 text-left rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{blockType.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{blockType.name}</p>
                      <p className="text-xs text-gray-600">{blockType.description}</p>
                    </div>
                    <PlusIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-600 ml-auto" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Основная область с вкладками */}
        <div className="flex-1 lg:ml-0">
          <div className="p-6">
            <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
              <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6">
                {tabs.map((tab) => (
                  <Tab
                    key={tab.name}
                    className={({ selected }) =>
                      `w-full rounded-lg py-2.5 px-4 text-sm font-medium leading-5 transition-colors ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${
                        selected
                          ? `${theme.primary.replace('bg-', 'bg-')} text-white shadow`
                          : 'text-blue-700 hover:bg-white/[0.12] hover:text-blue-800'
                      }`
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
                {tabs.map((tab, index) => (
                  <Tab.Panel key={index} className="focus:outline-none">
                    {tab.component}
                  </Tab.Panel>
                ))}
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
      </div>
    </div>
  );
};

// Заглушки для компонентов (будут созданы отдельно)
const BlocksEditor: React.FC<any> = ({ blocks, loading, error }) => {
  if (loading) return <div className="text-center py-8">Загрузка блоков...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
  
  const blocksArray = Array.isArray(blocks) ? blocks : [];
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Редактор блоков</h3>
      <p className="text-gray-600">Перетаскивайте блоки для изменения порядка</p>
      {blocksArray.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-600">Нет блоков. Добавьте первый блок из библиотеки слева.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {blocksArray.map((block: any) => (
            <div key={block.id} className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium">{block.title}</h4>
              <p className="text-sm text-gray-600">Тип: {block.type}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MediaManager: React.FC<any> = ({ assets, loading, error }) => {
  if (loading) return <div className="text-center py-8">Загрузка медиафайлов...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
  
  const assetsArray = Array.isArray(assets) ? assets : [];
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Медиафайлы</h3>
      <p className="text-gray-600">Загружайте и управляйте изображениями и документами</p>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {assetsArray.map((asset: any) => (
          <div key={asset.id} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
            <PhotoIcon className="h-8 w-8 text-gray-400" />
          </div>
        ))}
      </div>
    </div>
  );
};

const LandingSettings: React.FC<any> = ({ landing, loading, error }) => {
  if (loading) return <div className="text-center py-8">Загрузка настроек...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Настройки лендинга</h3>
      
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h4 className="text-md font-medium mb-4">Основные настройки</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название лендинга
            </label>
            <input
              type="text"
              defaultValue={landing.title}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание
            </label>
            <textarea
              defaultValue={landing.description}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingEditorPage;
