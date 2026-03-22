import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowUpTrayIcon,
  ArrowTopRightOnSquareIcon,
  Bars3Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  GlobeAltIcon,
  PencilSquareIcon,
  PhotoIcon,
  PlusIcon,
  RectangleGroupIcon,
  SparklesIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import SiteBuilderRenderer from '@/components/holding/site-builder/SiteBuilderRenderer';
import {
  ARRAY_ITEM_TEMPLATES,
  BLOCK_LIBRARY,
  FIELD_LABELS,
} from '@/constants/holdingSiteBuilder';
import { usePermissionsContext } from '@/contexts/PermissionsContext';
import { useHoldingSiteBuilder } from '@/hooks/useHoldingSiteBuilder';
import type {
  BuilderCanvasFocusTarget,
  EditorPage,
  EditorSection,
  PageTemplatePreset,
} from '@/types/holding-site-builder';

type InspectorTab = 'content' | 'page' | 'site' | 'blog' | 'revisions';

const inputClassName =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100';

const panelClassName = 'rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_28px_60px_-48px_rgba(15,23,42,0.4)]';
const imageDropzoneClassName =
  'rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-4 transition hover:border-slate-400 hover:bg-white';
const imageAccept = 'image/*,.jpg,.jpeg,.png,.gif,.webp,.svg,.ico';

const INSPECTOR_TABS: Array<{
  id: InspectorTab;
  label: string;
  icon: typeof RectangleGroupIcon;
}> = [
  { id: 'content', label: 'Контент', icon: RectangleGroupIcon },
  { id: 'page', label: 'Страница', icon: PencilSquareIcon },
  { id: 'site', label: 'Сайт', icon: GlobeAltIcon },
  { id: 'blog', label: 'Блог', icon: SparklesIcon },
  { id: 'revisions', label: 'Ревизии', icon: PhotoIcon },
];

const moveArrayItem = <T,>(items: T[], from: number, to: number): T[] => {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block">
    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
      {label}
    </span>
    {children}
  </label>
);

const isImageField = (fieldName: string, fieldType?: string): boolean => {
  if (fieldType === 'image') {
    return true;
  }

  const normalized = fieldName.toLowerCase();

  return ['image', 'background_image', 'logo_url', 'favicon_url', 'featured_image'].includes(normalized);
};

const isImageCollectionField = (collectionFieldName: string, fieldName: string): boolean => {
  const normalizedCollection = collectionFieldName.toLowerCase();
  const normalizedField = fieldName.toLowerCase();

  if (['image', 'background_image'].includes(normalizedField)) {
    return true;
  }

  if (normalizedField !== 'url') {
    return false;
  }

  return normalizedCollection.includes('image') || normalizedCollection.includes('gallery');
};

const ImageUploadField = ({
  value,
  onChange,
  onUpload,
  inputRef,
}: {
  value: string;
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<string | null>;
  inputRef?: (node: HTMLInputElement | null) => void;
}) => {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    try {
      const uploadedUrl = await onUpload(file);
      if (uploadedUrl) {
        onChange(uploadedUrl);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    await handleFiles(event.dataTransfer.files);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    await handleFiles(event.target.files);
  };

  return (
    <div className="space-y-3">
      <div
        className={`${imageDropzoneClassName} ${dragging ? 'border-blue-400 bg-blue-50' : ''} ${uploading ? 'cursor-wait opacity-70' : ''}`}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
            return;
          }
          setDragging(false);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDrop={(event) => {
          void handleDrop(event);
        }}
      >
        <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white">
          {value ? (
            <img alt="" className="h-40 w-full object-cover" src={value} />
          ) : (
            <div className="flex h-40 items-center justify-center bg-[linear-gradient(135deg,#eff6ff,#f8fafc)] text-5xl text-slate-300">
              <PhotoIcon className="h-12 w-12" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-950">
              {uploading ? 'Загрузка в S3...' : 'Перетащите изображение сюда'}
            </div>
            <div className="mt-1 text-sm text-slate-500">
              Или выберите файл. Внешний URL тоже можно оставить вручную.
            </div>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            <ArrowUpTrayIcon className="h-4 w-4" />
            {uploading ? 'Загрузка...' : 'Загрузить'}
          </button>
        </div>
        <input
          ref={fileInputRef}
          accept={imageAccept}
          className="hidden"
          onChange={(event) => {
            void handleFileChange(event);
          }}
          type="file"
        />
      </div>
      <input
        ref={inputRef}
        className={inputClassName}
        placeholder="https://..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
};

const ArrayEditor = ({
  section,
  fieldName,
  onChange,
  onUploadAsset,
}: {
  section: EditorSection;
  fieldName: string;
  onChange: (value: Record<string, unknown>[]) => void;
  onUploadAsset?: (file: File, metadata?: Record<string, unknown>) => Promise<string | null>;
}) => {
  const value = Array.isArray(section.content[fieldName]) ? (section.content[fieldName] as Record<string, unknown>[]) : [];
  const template = ARRAY_ITEM_TEMPLATES[`${section.type}.${fieldName}`] ?? { value: '' };

  return (
    <div className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
      {value.map((item, index) => (
        <div key={`${fieldName}-${index}`} className="rounded-[22px] border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Элемент {index + 1}
            </div>
            <button
              className="text-sm font-medium text-rose-600 transition hover:text-rose-700"
              onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
              type="button"
            >
              Удалить
            </button>
          </div>
          <div className="grid gap-3">
            {Object.entries(item).map(([key, itemValue]) => (
              <Field key={key} label={FIELD_LABELS[key] ?? key}>
                {onUploadAsset && isImageCollectionField(fieldName, key) ? (
                  <ImageUploadField
                    value={typeof itemValue === 'string' ? itemValue : ''}
                    onChange={(nextValue) =>
                      onChange(
                        value.map((currentItem, itemIndex) =>
                          itemIndex === index ? { ...currentItem, [key]: nextValue } : currentItem,
                        ),
                      )
                    }
                    onUpload={async (file) => {
                      const metadata = {
                        alt_text: typeof item.alt === 'string' ? item.alt : undefined,
                        caption: typeof item.caption === 'string' ? item.caption : undefined,
                      };

                      return onUploadAsset(file, metadata);
                    }}
                  />
                ) : (
                  <input
                    className={inputClassName}
                    value={typeof itemValue === 'string' || typeof itemValue === 'number' ? String(itemValue) : ''}
                    onChange={(event) =>
                      onChange(
                        value.map((currentItem, itemIndex) =>
                          itemIndex === index ? { ...currentItem, [key]: event.target.value } : currentItem,
                        ),
                      )
                    }
                  />
                )}
              </Field>
            ))}
          </div>
        </div>
      ))}
      <button
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
        onClick={() => onChange([...value, template])}
        type="button"
      >
        <PlusIcon className="h-4 w-4" />
        Добавить элемент
      </button>
    </div>
  );
};

const buildFieldValue = (section: EditorSection, fieldName: string): string =>
  typeof section.content[fieldName] === 'string' || typeof section.content[fieldName] === 'number'
    ? String(section.content[fieldName])
    : '';

const PageCard = ({
  page,
  active,
  onSelect,
}: {
  page: EditorPage;
  active: boolean;
  onSelect: () => void;
}) => (
  <button
    className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
      active ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
    }`}
    onClick={onSelect}
    type="button"
  >
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-sm font-semibold">{page.navigation_label || page.title}</div>
        <div className={`mt-1 text-xs ${active ? 'text-slate-300' : 'text-slate-500'}`}>{page.slug}</div>
      </div>
      <div className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${active ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-500'}`}>
        {page.page_type}
      </div>
    </div>
  </button>
);

const SectionCard = ({
  section,
  active,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}: {
  section: EditorSection;
  active: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) => (
  <div className={`rounded-[24px] border px-4 py-4 transition ${active ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
    <button className="w-full text-left" onClick={onSelect} type="button">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-950">{section.title}</div>
          <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{section.type}</div>
        </div>
        <div className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500 shadow-sm">
          {section.sort_order}
        </div>
      </div>
    </button>
    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
      <button className="rounded-full border border-slate-200 px-3 py-1.5 hover:border-slate-300" onClick={onMoveUp} type="button">
        <ChevronUpIcon className="h-4 w-4" />
      </button>
      <button className="rounded-full border border-slate-200 px-3 py-1.5 hover:border-slate-300" onClick={onMoveDown} type="button">
        <ChevronDownIcon className="h-4 w-4" />
      </button>
      <button className="rounded-full border border-slate-200 px-3 py-1.5 hover:border-slate-300" onClick={onDuplicate} type="button">
        Дублировать
      </button>
      <button className="rounded-full border border-rose-200 px-3 py-1.5 text-rose-600 hover:bg-rose-50" onClick={onDelete} type="button">
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  </div>
);

const LandingEditorPage = () => {
  const navigate = useNavigate();
  const { can, isLoaded, isLoading } = usePermissionsContext();
  const builder = useHoldingSiteBuilder();
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('content');
  const [selectedFieldPath, setSelectedFieldPath] = useState<string | null>(null);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const fieldRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});

  const canView = can('multi-organization.website.view');
  const canEdit = can('multi-organization.website.edit');
  const canPublish = can('multi-organization.website.publish');

  const selectedPage = builder.selectedPage;
  const selectedSection = builder.selectedSection;
  const selectedSectionsOrder = selectedPage?.sections.map((section) => section.id) ?? [];

  const uploadAssetToSection = async (usageContext: string, file: File, metadata?: Record<string, unknown>) => {
    const asset = await builder.uploadAsset(file, usageContext, metadata);

    return asset?.public_url ?? null;
  };

  useEffect(() => {
    if (!selectedFieldPath) {
      return;
    }

    const field = fieldRefs.current[selectedFieldPath];
    if (!field) {
      return;
    }

    field.focus();
    field.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [selectedFieldPath, selectedSection?.id]);

  const handleCanvasInteract = (target: BuilderCanvasFocusTarget) => {
    if (target.pageId) {
      builder.setSelectedPageId(target.pageId);
    }

    builder.setSelectedSectionId(target.blockId);
    setInspectorTab(target.intent === 'page' ? 'page' : 'content');
    setSelectedFieldPath(target.fieldPath ?? null);
  };

  const addPage = async () => {
    const title = newPageTitle.trim() || 'Новая страница';
    const slug = newPageSlug.trim() || `/${title.toLowerCase().replace(/\s+/g, '-')}`;
    const page = await builder.createPage({
      page_type: 'custom',
      slug,
      title,
      navigation_label: title,
      description: '',
      visibility: 'public',
    });

    if (page) {
      setNewPageTitle('');
      setNewPageSlug('');
      setInspectorTab('page');
    }
  };

  const movePage = async (direction: -1 | 1) => {
    if (!selectedPage) {
      return;
    }

    const pageIndex = builder.pages.findIndex((page) => page.id === selectedPage.id);
    const nextIndex = pageIndex + direction;

    if (pageIndex === -1 || nextIndex < 0 || nextIndex >= builder.pages.length) {
      return;
    }

    const nextOrder = moveArrayItem(builder.pages.map((page) => page.id), pageIndex, nextIndex);
    await builder.reorderPages(nextOrder);
  };

  const moveSection = async (sectionId: number, direction: -1 | 1) => {
    if (!selectedPage) {
      return;
    }

    const currentIndex = selectedSectionsOrder.findIndex((id) => id === sectionId);
    const nextIndex = currentIndex + direction;

    if (currentIndex === -1 || nextIndex < 0 || nextIndex >= selectedSectionsOrder.length) {
      return;
    }

    const nextOrder = moveArrayItem(selectedSectionsOrder, currentIndex, nextIndex);
    await builder.reorderSections(selectedPage.id, nextOrder);
  };

  const contentFields = useMemo(() => Object.entries(selectedSection?.schema ?? {}), [selectedSection?.schema]);

  if ((isLoading || !isLoaded) && !canView) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <div className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm text-slate-600 shadow-sm">
          Проверяем доступ к модулю сайта...
        </div>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="rounded-[30px] border border-rose-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-950">Конструктор недоступен</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Для доступа к модулю нужен permission `multi-organization.website.view`.
        </p>
      </div>
    );
  }

  if (builder.loading || !builder.workspace || !builder.site) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <div className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm text-slate-600 shadow-sm">
          Загружаем workspace конструктора...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] p-4 sm:p-6">
      <header className={`${panelClassName} overflow-hidden`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <button
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
              onClick={() => navigate(-1)}
              type="button"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-lg font-semibold text-white">
              {builder.site.id}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{builder.site.title}</h1>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${builder.publication?.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {builder.publication?.is_published ? 'Опубликован' : 'Черновик'}
                </span>
                {builder.hasUnsavedChanges && (
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    Есть несохранённые изменения
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <GlobeAltIcon className="h-4 w-4" />
                  {builder.site.domain}
                </span>
                <span>Preview: live draft</span>
                <span>Public: published snapshot</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              href={`${builder.site.preview_url}${selectedPage && !selectedPage.is_home ? `&path=${encodeURIComponent(selectedPage.slug)}` : ''}`}
              rel="noreferrer"
              target="_blank"
            >
              <EyeIcon className="h-4 w-4" />
              Превью
            </a>
            <a
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              href={builder.site.url}
              rel="noreferrer"
              target="_blank"
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              Публичный сайт
            </a>
            <button
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!canPublish || builder.publishing}
              onClick={() => void builder.publishSite()}
              type="button"
            >
              <SparklesIcon className="h-4 w-4" />
              {builder.publishing ? 'Публикуем...' : 'Опубликовать'}
            </button>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            ['Страницы', builder.summary?.pages_count ?? builder.pages.length, `${builder.pages.length} в дереве сайта`],
            ['Секции', builder.summary?.blocks_count ?? 0, `${builder.summary?.active_blocks_count ?? 0} активных`],
            ['Лиды', builder.leadSummary?.total ?? 0, `Сегодня: ${builder.leadSummary?.today ?? 0}`],
            ['Медиа', builder.summary?.assets_count ?? 0, 'Медиатека сайта'],
            ['Блог', builder.summary?.blog_articles_count ?? builder.blogArticles.length, 'Публикации холдинга'],
          ].map(([label, value, detail]) => (
            <div key={label} className="rounded-[26px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</div>
              <div className="mt-3 text-3xl font-semibold text-slate-950">{value}</div>
              <div className="mt-1 text-sm text-slate-500">{detail}</div>
            </div>
          ))}
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
        <aside className="space-y-6">
          <section className={panelClassName}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Навигация сайта</div>
                <p className="mt-2 text-sm text-slate-500">Страницы, структура и сценарии сайта.</p>
              </div>
              <Bars3Icon className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-5 space-y-3">
              {builder.pages.map((page) => (
                <PageCard
                  key={page.id}
                  active={builder.selectedPageId === page.id}
                  page={page}
                  onSelect={() => {
                    builder.setSelectedPageId(page.id);
                    builder.setSelectedSectionId(page.sections[0]?.id ?? null);
                    setInspectorTab('page');
                  }}
                />
              ))}
            </div>
            {canEdit && (
              <div className="mt-5 space-y-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <Field label="Новая страница">
                  <input className={inputClassName} value={newPageTitle} onChange={(event) => setNewPageTitle(event.target.value)} />
                </Field>
                <Field label="Slug">
                  <input className={inputClassName} placeholder="/services" value={newPageSlug} onChange={(event) => setNewPageSlug(event.target.value)} />
                </Field>
                <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white" onClick={() => void addPage()} type="button">
                  <PlusIcon className="h-4 w-4" />
                  Добавить страницу
                </button>
              </div>
            )}
            {canEdit && builder.selectedPage && (
              <div className="mt-4 flex items-center gap-2">
                <button className="inline-flex rounded-full border border-slate-200 px-3 py-2 text-sm hover:border-slate-300" onClick={() => void movePage(-1)} type="button">
                  Выше
                </button>
                <button className="inline-flex rounded-full border border-slate-200 px-3 py-2 text-sm hover:border-slate-300" onClick={() => void movePage(1)} type="button">
                  Ниже
                </button>
                <button className="inline-flex rounded-full border border-rose-200 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50" disabled={!!builder.selectedPage?.is_home} onClick={() => builder.selectedPage && void builder.deletePage(builder.selectedPage.id)} type="button">
                  Удалить
                </button>
              </div>
            )}
          </section>

          <section className={panelClassName}>
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Шаблоны страниц</div>
            <div className="mt-5 space-y-3">
              {builder.pageTemplates.map((template) => (
                <button
                  key={template.id}
                  className="w-full rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-slate-300 hover:bg-white"
                  onClick={() => void builder.applyPageTemplate(template as PageTemplatePreset)}
                  type="button"
                >
                  <div className="text-sm font-semibold text-slate-950">{template.name}</div>
                  <div className="mt-2 text-sm leading-7 text-slate-600">{template.description}</div>
                </button>
              ))}
            </div>
          </section>

          <section className={panelClassName}>
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Секции страницы</div>
            <div className="mt-5 space-y-3">
              {selectedPage?.sections.map((section) => (
                <SectionCard
                  key={section.id}
                  active={builder.selectedSectionId === section.id}
                  onDelete={() => void builder.deleteSection(selectedPage.id, section.id)}
                  onDuplicate={() => void builder.duplicateSection(section.id)}
                  onMoveDown={() => void moveSection(section.id, 1)}
                  onMoveUp={() => void moveSection(section.id, -1)}
                  onSelect={() => {
                    builder.setSelectedSectionId(section.id);
                    setInspectorTab('content');
                  }}
                  section={section}
                />
              ))}
            </div>
          </section>

          <section className={panelClassName}>
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Curated library</div>
            <div className="mt-5 grid gap-3">
              {BLOCK_LIBRARY.map((item) => (
                <button
                  key={item.type}
                  className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
                  onClick={() => selectedPage && void builder.addSection(selectedPage.id, item.type)}
                  type="button"
                >
                  <div className="text-sm font-semibold text-slate-950">{item.label}</div>
                  <div className="mt-1 text-sm text-slate-500">{item.description}</div>
                </button>
              ))}
            </div>
          </section>
        </aside>

        <main className="space-y-6">
          <section className={`${panelClassName} overflow-hidden p-0`}>
            <div className="border-b border-slate-200 bg-white px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Canvas</div>
                  <div className="mt-2 text-lg font-semibold text-slate-950">
                    {selectedPage?.navigation_label || selectedPage?.title || builder.site.title}
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Desktop preview
                </div>
              </div>
            </div>
            <SiteBuilderRenderer
              blog={{ articles: builder.blogArticles }}
              mode="editor"
              onEditorInteract={handleCanvasInteract}
              page={selectedPage}
              selectedBlockId={builder.selectedSectionId}
              selectedFieldPath={selectedFieldPath}
              site={builder.site}
            />
          </section>
        </main>

        <aside className="space-y-6">
          <section className={panelClassName}>
            <div className="grid grid-cols-2 gap-2 rounded-[22px] bg-slate-100 p-2">
              {INSPECTOR_TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  className={`inline-flex items-center justify-center gap-2 rounded-[18px] px-3 py-3 text-sm font-semibold transition ${inspectorTab === id ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-white'}`}
                  onClick={() => setInspectorTab(id as InspectorTab)}
                  type="button"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </section>

          {inspectorTab === 'content' && selectedSection && (
            <section className={`${panelClassName} space-y-5`}>
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Секция</div>
                <div className="mt-2 text-2xl font-semibold text-slate-950">{selectedSection.title}</div>
                <div className="mt-1 text-sm text-slate-500">{selectedSection.type}</div>
              </div>
              <Field label="Название секции">
                <input
                  className={inputClassName}
                  value={selectedSection.title}
                  onChange={(event) => builder.updateSectionDraft(selectedPage!.id, selectedSection.id, { title: event.target.value })}
                />
              </Field>
              {contentFields.map(([fieldName, schema]) => {
                const fieldPath = `content.${fieldName}`;

                if (schema.type === 'array') {
                  return (
                    <div key={fieldName}>
                      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                        {FIELD_LABELS[fieldName] ?? fieldName}
                      </div>
                      <ArrayEditor
                        fieldName={fieldName}
                        onChange={(value) => builder.updateSectionField(selectedPage!.id, selectedSection.id, fieldPath, value)}
                        onUploadAsset={(file, metadata) => uploadAssetToSection(selectedSection.type, file, metadata)}
                        section={selectedSection}
                      />
                    </div>
                  );
                }

                if (isImageField(fieldName, schema.type)) {
                  return (
                    <Field key={fieldName} label={FIELD_LABELS[fieldName] ?? fieldName}>
                      <ImageUploadField
                        inputRef={(node) => {
                          fieldRefs.current[fieldPath] = node;
                        }}
                        value={buildFieldValue(selectedSection, fieldName)}
                        onChange={(value) => builder.updateSectionField(selectedPage!.id, selectedSection.id, fieldPath, value)}
                        onUpload={(file) => uploadAssetToSection(selectedSection.type, file)}
                      />
                    </Field>
                  );
                }

                if (schema.type === 'text' || schema.type === 'html') {
                  return (
                    <Field key={fieldName} label={FIELD_LABELS[fieldName] ?? fieldName}>
                      <textarea
                        ref={(node) => {
                          fieldRefs.current[fieldPath] = node;
                        }}
                        className={`${inputClassName} min-h-28`}
                        value={buildFieldValue(selectedSection, fieldName)}
                        onChange={(event) => builder.updateSectionField(selectedPage!.id, selectedSection.id, fieldPath, event.target.value)}
                      />
                    </Field>
                  );
                }

                return (
                  <Field key={fieldName} label={FIELD_LABELS[fieldName] ?? fieldName}>
                    <input
                      ref={(node) => {
                        fieldRefs.current[fieldPath] = node;
                      }}
                      className={inputClassName}
                      value={buildFieldValue(selectedSection, fieldName)}
                      onChange={(event) => builder.updateSectionField(selectedPage!.id, selectedSection.id, fieldPath, event.target.value)}
                    />
                  </Field>
                );
              })}
            </section>
          )}

          {inspectorTab === 'page' && selectedPage && (
            <section className={`${panelClassName} space-y-5`}>
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Страница</div>
              <Field label="Название">
                <input className={inputClassName} value={selectedPage.title} onChange={(event) => builder.updatePageDraft(selectedPage.id, { title: event.target.value, navigation_label: event.target.value })} />
              </Field>
              <Field label="Slug">
                <input className={inputClassName} value={selectedPage.slug} onChange={(event) => builder.updatePageDraft(selectedPage.id, { slug: event.target.value })} />
              </Field>
              <Field label="Описание">
                <textarea className={`${inputClassName} min-h-24`} value={selectedPage.description ?? ''} onChange={(event) => builder.updatePageDraft(selectedPage.id, { description: event.target.value })} />
              </Field>
              <Field label="SEO title">
                <input
                  className={inputClassName}
                  value={selectedPage.seo_meta.title ?? ''}
                  onChange={(event) => builder.updatePageDraft(selectedPage.id, { seo_meta: { ...selectedPage.seo_meta, title: event.target.value } })}
                />
              </Field>
              <Field label="SEO description">
                <textarea
                  className={`${inputClassName} min-h-24`}
                  value={selectedPage.seo_meta.description ?? ''}
                  onChange={(event) => builder.updatePageDraft(selectedPage.id, { seo_meta: { ...selectedPage.seo_meta, description: event.target.value } })}
                />
              </Field>
            </section>
          )}

          {inspectorTab === 'site' && (
            <section className={`${panelClassName} space-y-5`}>
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Настройки сайта</div>
              <Field label="Название сайта">
                <input className={inputClassName} value={builder.site.title} onChange={(event) => builder.updateSiteDraft({ title: event.target.value })} />
              </Field>
              <Field label="Домен">
                <input className={inputClassName} value={builder.site.domain} onChange={(event) => builder.updateSiteDraft({ domain: event.target.value })} />
              </Field>
              <Field label="Описание">
                <textarea className={`${inputClassName} min-h-24`} value={builder.site.description} onChange={(event) => builder.updateSiteDraft({ description: event.target.value })} />
              </Field>
              <Field label="Logo">
                <ImageUploadField
                  value={builder.site.logo_url ?? ''}
                  onChange={(value) => builder.updateSiteDraft({ logo_url: value })}
                  onUpload={async (file) => {
                    const asset = await builder.uploadAsset(file, 'logo');

                    return asset?.public_url ?? null;
                  }}
                />
              </Field>
              <Field label="Favicon">
                <ImageUploadField
                  value={builder.site.favicon_url ?? ''}
                  onChange={(value) => builder.updateSiteDraft({ favicon_url: value })}
                  onUpload={async (file) => {
                    const asset = await builder.uploadAsset(file, 'favicon');

                    return asset?.public_url ?? null;
                  }}
                />
              </Field>
              <Field label="Default locale">
                <input className={inputClassName} value={builder.site.default_locale} onChange={(event) => builder.updateSiteDraft({ default_locale: event.target.value })} />
              </Field>
              <Field label="Enabled locales">
                <input
                  className={inputClassName}
                  value={builder.site.enabled_locales.join(', ')}
                  onChange={(event) =>
                    builder.updateSiteDraft({
                      enabled_locales: event.target.value
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </Field>
            </section>
          )}

          {inspectorTab === 'blog' && (
            <section className={`${panelClassName} space-y-5`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Блог холдинга</div>
                  <p className="mt-2 text-sm text-slate-500">Публикации для страницы `/blog` и SEO-контента.</p>
                </div>
                <button
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                  onClick={() => void builder.createBlogArticle({ title: 'Новая статья', content: '', excerpt: '', status: 'draft' })}
                  type="button"
                >
                  <PlusIcon className="h-4 w-4" />
                  Статья
                </button>
              </div>
              <div className="space-y-3">
                {builder.blogArticles.map((article) => (
                  <div key={article.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-semibold text-slate-950">{article.title}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{article.status}</div>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-sm hover:border-slate-300"
                        onClick={() =>
                          void builder.updateBlogArticle(article.id, {
                            status: article.status === 'published' ? 'draft' : 'published',
                          })
                        }
                        type="button"
                      >
                        {article.status === 'published' ? 'В черновик' : 'Опубликовать'}
                      </button>
                      <button
                        className="rounded-full border border-rose-200 px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50"
                        onClick={() => void builder.deleteBlogArticle(article.id)}
                        type="button"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {inspectorTab === 'revisions' && (
            <section className={`${panelClassName} space-y-5`}>
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Ревизии и доступ</div>
              <div className="space-y-3">
                {builder.revisions.map((revision) => (
                  <div key={revision.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-semibold text-slate-950">{revision.label || `Revision #${revision.id}`}</div>
                    <div className="mt-1 text-sm text-slate-500">{revision.created_at ? new Date(revision.created_at).toLocaleString('ru-RU') : '—'}</div>
                    <button
                      className="mt-4 rounded-full border border-slate-200 px-3 py-1.5 text-sm hover:border-slate-300"
                      onClick={() => void builder.rollbackRevision(revision.id)}
                      type="button"
                    >
                      Откатить
                    </button>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {(builder.collaborators ?? []).map((collaborator) => (
                  <div key={collaborator.id} className="rounded-[24px] border border-slate-200 bg-white px-4 py-4">
                    <div className="text-sm font-semibold text-slate-950">{collaborator.user.name || collaborator.user.email}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{collaborator.role}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>

      {builder.error && (
        <div className="rounded-[28px] border border-rose-200 bg-white px-6 py-4 text-sm text-rose-700 shadow-sm">
          {builder.error}
        </div>
      )}
    </div>
  );
};

export default LandingEditorPage;
