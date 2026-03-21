import { useDeferredValue, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  Bars3Icon,
  CloudArrowUpIcon,
  EyeIcon,
  PaintBrushIcon,
  PhotoIcon,
  RectangleGroupIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import SiteBuilderRenderer from '@/components/holding/site-builder/SiteBuilderRenderer';
import { ARRAY_ITEM_TEMPLATES, FIELD_LABELS } from '@/constants/holdingSiteBuilder';
import { usePermissionsContext } from '@/contexts/PermissionsContext';
import { useHoldingSiteBuilder } from '@/hooks/useHoldingSiteBuilder';
import type { EditorAsset, EditorBlock } from '@/types/holding-site-builder';

type WorkspaceTab = 'structure' | 'properties' | 'media' | 'settings' | 'leads';

const TAB_META: Array<{
  id: WorkspaceTab;
  label: string;
  icon: typeof RectangleGroupIcon;
}> = [
  { id: 'structure', label: 'Структура', icon: RectangleGroupIcon },
  { id: 'properties', label: 'Свойства', icon: SparklesIcon },
  { id: 'media', label: 'Медиа', icon: PhotoIcon },
  { id: 'settings', label: 'Настройки', icon: PaintBrushIcon },
  { id: 'leads', label: 'Лиды и SEO', icon: ShieldCheckIcon },
];

const textInputClassName =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:bg-white';

const asString = (value: unknown): string => (typeof value === 'string' ? value : '');
const asScalarString = (value: unknown): string =>
  typeof value === 'string' || typeof value === 'number' ? String(value) : '';
const asArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const moveArrayItem = <T,>(items: T[], from: number, to: number): T[] => {
  const nextItems = [...items];
  const [item] = nextItems.splice(from, 1);
  nextItems.splice(to, 0, item);
  return nextItems;
};

const PanelCard = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
    <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">{title}</h3>
    <div className="mt-4 space-y-4">{children}</div>
  </section>
);

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block">
    <span className="mb-2 block text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
      {label}
    </span>
    {children}
  </label>
);

const AssetSelect = ({
  assets,
  value,
  onChange,
}: {
  assets: EditorAsset[];
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="space-y-3">
    <select className={textInputClassName} value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">Без изображения</option>
      {assets.map((asset) => (
        <option key={asset.id} value={asset.public_url}>
          {asset.filename}
        </option>
      ))}
    </select>
    {value && (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        <img alt="" className="h-36 w-full object-cover" src={value} />
      </div>
    )}
  </div>
);

const ArrayEditor = ({
  blockType,
  fieldName,
  value,
  onChange,
}: {
  blockType: string;
  fieldName: string;
  value: unknown;
  onChange: (nextValue: Record<string, unknown>[]) => void;
}) => {
  const items = asArray<Record<string, unknown>>(value);
  const template = ARRAY_ITEM_TEMPLATES[`${blockType}.${fieldName}`] ?? { value: '' };

  const addItem = () => onChange([...items, template]);
  const updateItem = (index: number, key: string, nextValue: string) => {
    const nextItems = items.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [key]: nextValue } : item,
    );
    onChange(nextItems);
  };
  const removeItem = (index: number) => onChange(items.filter((_, itemIndex) => itemIndex !== index));

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      {items.map((item, index) => (
        <div key={`${fieldName}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Элемент {index + 1}
            </div>
            <button
              className="text-sm text-rose-600 transition hover:text-rose-700"
              onClick={() => removeItem(index)}
              type="button"
            >
              Удалить
            </button>
          </div>
          <div className="grid gap-3">
            {Object.entries(item).map(([key, itemValue]) => (
              <Field key={key} label={FIELD_LABELS[key] ?? key}>
                <input
                  className={textInputClassName}
                  value={asScalarString(itemValue)}
                  onChange={(event) => updateItem(index, key, event.target.value)}
                />
              </Field>
            ))}
          </div>
        </div>
      ))}
      <button
        className="w-full rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
        onClick={addItem}
        type="button"
      >
        Добавить элемент
      </button>
    </div>
  );
};

const BlockInspector = ({
  block,
  assets,
  onChange,
}: {
  block: EditorBlock | null;
  assets: EditorAsset[];
  onChange: (patch: Partial<EditorBlock>) => void;
}) => {
  if (!block) {
    return (
      <PanelCard title="Свойства">
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          Выберите блок в структуре, чтобы редактировать поля, bindings и настройки.
        </div>
      </PanelCard>
    );
  }

  const schemaEntries = Object.entries(block.schema);

  return (
    <PanelCard title={block.title}>
      <Field label="Название секции">
        <input
          className={textInputClassName}
          value={block.title}
          onChange={(event) => onChange({ title: event.target.value })}
        />
      </Field>

      {!block.is_renderable && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          У блока пока нет данных для рендера. Заполните поля вручную или настройте автоисточник.
        </div>
      )}

      {schemaEntries.map(([fieldName, fieldSchema]) => (
        <div key={fieldName} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <Field label={FIELD_LABELS[fieldName] ?? fieldName}>
            {fieldSchema.type === 'text' || fieldSchema.type === 'html' ? (
              <textarea
                className={`${textInputClassName} min-h-28`}
                value={asString(block.content[fieldName])}
                onChange={(event) =>
                  onChange({
                    content: {
                      [fieldName]: event.target.value,
                    },
                  })
                }
              />
            ) : fieldSchema.type === 'image' ? (
              <AssetSelect
                assets={assets}
                value={asString(block.content[fieldName])}
                onChange={(value) =>
                  onChange({
                    content: {
                      [fieldName]: value,
                    },
                  })
                }
              />
            ) : fieldSchema.type === 'array' ? (
              <ArrayEditor
                blockType={block.type}
                fieldName={fieldName}
                value={block.content[fieldName]}
                onChange={(nextValue) =>
                  onChange({
                    content: {
                      [fieldName]: nextValue,
                    },
                  })
                }
              />
            ) : (
              <input
                className={textInputClassName}
                type={fieldSchema.type === 'number' ? 'number' : 'text'}
                value={asScalarString(block.content[fieldName])}
                onChange={(event) =>
                  onChange({
                    content: {
                      [fieldName]:
                        fieldSchema.type === 'number' ? Number(event.target.value || 0) : event.target.value,
                    },
                  })
                }
              />
            )}
          </Field>

          <div className="grid gap-3">
            <div className="grid gap-3 lg:grid-cols-[0.32fr,0.68fr]">
              <Field label="Режим binding">
                <select
                  className={textInputClassName}
                  value={block.bindings[fieldName]?.mode ?? 'manual'}
                  onChange={(event) =>
                    onChange({
                      bindings: {
                        [fieldName]: {
                          ...block.bindings[fieldName],
                          mode: event.target.value as 'manual' | 'auto' | 'hybrid',
                        },
                      },
                    })
                  }
                >
                  <option value="manual">Manual</option>
                  <option value="auto">Auto</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </Field>
              <Field label="Источник данных">
                <input
                  className={textInputClassName}
                  placeholder="organization.name"
                  value={block.bindings[fieldName]?.source ?? ''}
                  onChange={(event) =>
                    onChange({
                      bindings: {
                        [fieldName]: {
                          ...block.bindings[fieldName],
                          source: event.target.value,
                        },
                      },
                    })
                  }
                />
              </Field>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <Field label="Fallback">
                <input
                  className={textInputClassName}
                  placeholder="Запасное значение"
                  value={asScalarString(block.bindings[fieldName]?.fallback)}
                  onChange={(event) =>
                    onChange({
                      bindings: {
                        [fieldName]: {
                          ...block.bindings[fieldName],
                          fallback: event.target.value,
                        },
                      },
                    })
                  }
                />
              </Field>
              <Field label="Override">
                <input
                  className={textInputClassName}
                  placeholder="Принудительное значение"
                  value={asScalarString(block.bindings[fieldName]?.override)}
                  onChange={(event) =>
                    onChange({
                      bindings: {
                        [fieldName]: {
                          ...block.bindings[fieldName],
                          override: event.target.value,
                        },
                      },
                    })
                  }
                />
              </Field>
            </div>
          </div>
        </div>
      ))}
    </PanelCard>
  );
};

const LandingEditorPage = () => {
  const navigate = useNavigate();
  const { can } = usePermissionsContext();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('structure');
  const [armedBlockDeleteId, setArmedBlockDeleteId] = useState<number | null>(null);
  const [armedAssetDeleteId, setArmedAssetDeleteId] = useState<number | null>(null);

  const {
    workspace,
    leads,
    leadSummary,
    selectedBlockId,
    selectedBlock,
    loading,
    savingSite,
    savingBlocks,
    publishing,
    error,
    hasUnsavedChanges,
    blockLibrary,
    templates,
    selectBlock,
    updateSiteDraft,
    updateBlockDraft,
    addBlock,
    deleteBlock,
    duplicateBlock,
    reorderBlocks,
    uploadAsset,
    updateAsset,
    deleteAsset,
    publishSite,
    applyTemplate,
    openPreview,
  } = useHoldingSiteBuilder();

  const canView = can('multi-organization.website.view');
  const canEdit = can('multi-organization.website.edit');
  const canPublish = can('multi-organization.website.publish');
  const canUploadAssets = can('multi-organization.website.assets.upload');
  const canManageAssets = can('multi-organization.website.assets.manage');
  const canUseTemplates = can('multi-organization.website.templates.access') || canEdit;

  const deferredBlocks = useDeferredValue(workspace?.blocks ?? []);
  const publicBlocks = useMemo(
    () =>
      deferredBlocks.map((block) => ({
        id: block.id,
        type: block.type,
        key: block.key,
        title: block.title,
        content: block.resolved_content,
        settings: block.settings,
        sort_order: block.sort_order,
        assets: block.assets,
      })),
    [deferredBlocks],
  );

  if (!canView) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100 px-4">
        <div className="max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-950">Доступ ограничен</h1>
          <p className="mt-3 text-sm text-slate-600">
            Для работы с конструктором сайта нужны права `multi-organization.website.view`.
          </p>
        </div>
      </div>
    );
  }

  if (loading || !workspace) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100">
        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm text-slate-600 shadow-sm">
          <ArrowPathIcon className="h-4 w-4 animate-spin" />
          Загрузка workspace конструктора...
        </div>
      </div>
    );
  }

  const selectedIndex = workspace.blocks.findIndex((block) => block.id === selectedBlockId);

  const moveSelectedBlock = async (direction: -1 | 1) => {
    if (!canEdit || selectedIndex < 0) {
      return;
    }

    const nextIndex = selectedIndex + direction;
    if (nextIndex < 0 || nextIndex >= workspace.blocks.length) {
      return;
    }

    const reordered = moveArrayItem(workspace.blocks, selectedIndex, nextIndex);
    await reorderBlocks(reordered.map((block) => block.id));
  };

  const handleBlockDelete = async () => {
    if (!selectedBlockId || !selectedBlock?.can_delete || !canEdit) {
      return;
    }

    if (armedBlockDeleteId !== selectedBlockId) {
      setArmedBlockDeleteId(selectedBlockId);
      return;
    }

    await deleteBlock(selectedBlockId);
    setArmedBlockDeleteId(null);
  };

  const siteIdentity = (
    <div className="flex items-start gap-4">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-lg font-semibold text-white">
        {workspace.site.title.slice(0, 1).toUpperCase()}
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-slate-950">{workspace.site.title}</h1>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              workspace.publication.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {workspace.publication.is_published ? 'Опубликован' : 'Черновик'}
          </span>
          {hasUnsavedChanges && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              Есть несохраненные изменения
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-500">{workspace.site.domain}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <div className="mx-auto max-w-[1700px] px-4 py-6 sm:px-6">
        <div className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.55)] backdrop-blur">
          <div className="flex flex-col gap-6 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              <button
                className="grid h-12 w-12 place-items-center rounded-2xl border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                onClick={() => navigate('/dashboard')}
                type="button"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              {siteIdentity}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                onClick={openPreview}
                type="button"
              >
                <EyeIcon className="h-4 w-4" />
                Превью
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={!canPublish || publishing}
                onClick={publishSite}
                type="button"
              >
                <CloudArrowUpIcon className="h-4 w-4" />
                {publishing ? 'Публикация...' : 'Опубликовать'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="mt-6 grid gap-6 xl:grid-cols-[320px,minmax(0,1fr),420px]">
            <div className="space-y-4">
              <PanelCard title="Workspace">
                <div className="grid grid-cols-2 gap-2">
                  {TAB_META.map((tab) => (
                    <button
                      key={tab.id}
                      className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                        activeTab === tab.id
                          ? 'bg-slate-950 text-white'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                      type="button"
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </PanelCard>

              <PanelCard title="Сводка">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Блоки</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-950">{workspace.summary.blocks_count}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Медиа</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-950">{workspace.summary.assets_count}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Лиды</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-950">
                      {leadSummary?.total ?? workspace.summary.leads_count}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Автосохранение</div>
                    <div className="mt-2 text-sm font-medium text-slate-950">
                      {savingSite ? 'Сохраняем сайт...' : 'Живой черновик'}
                    </div>
                  </div>
                </div>
              </PanelCard>
            </div>

            <div className="space-y-4">
              <PanelCard title="Canvas">
                <div className="rounded-[28px] bg-slate-100 p-4">
                  <SiteBuilderRenderer blocks={publicBlocks} mode="editor" site={workspace.site} />
                </div>
              </PanelCard>
            </div>

            <div className="space-y-4">
              {activeTab === 'structure' && (
                <>
                  <PanelCard title="Шаблоны">
                    <div className="space-y-3">
                      {templates.map((template) => (
                        <button
                          key={template.id}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={!canUseTemplates}
                          onClick={() => void applyTemplate(template)}
                          type="button"
                        >
                          <div className="text-sm font-semibold text-slate-950">{template.name}</div>
                          <div className="mt-1 text-sm text-slate-600">{template.description}</div>
                        </button>
                      ))}
                    </div>
                  </PanelCard>

                  <PanelCard title="Структура">
                    <div className="space-y-3">
                      {workspace.blocks.map((block, index) => (
                        <button
                          key={block.id}
                          className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                            block.id === selectedBlockId
                              ? 'border-slate-950 bg-slate-950 text-white'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                          onClick={() => {
                            setArmedBlockDeleteId(null);
                            selectBlock(block.id);
                          }}
                          type="button"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold">{block.title}</div>
                              <div className={`mt-1 text-xs ${block.id === selectedBlockId ? 'text-slate-300' : 'text-slate-500'}`}>
                                {block.type}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span>{index + 1}</span>
                              {savingBlocks[block.id] && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button
                        className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!canEdit || selectedIndex <= 0}
                        onClick={() => void moveSelectedBlock(-1)}
                        type="button"
                      >
                        Выше
                      </button>
                      <button
                        className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!canEdit || selectedIndex < 0 || selectedIndex >= workspace.blocks.length - 1}
                        onClick={() => void moveSelectedBlock(1)}
                        type="button"
                      >
                        Ниже
                      </button>
                      <button
                        className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!canEdit || !selectedBlockId}
                        onClick={() => selectedBlockId && void duplicateBlock(selectedBlockId)}
                        type="button"
                      >
                        Дубль
                      </button>
                      <button
                        className={`rounded-2xl border px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          armedBlockDeleteId === selectedBlockId
                            ? 'border-rose-400 bg-rose-50 text-rose-700'
                            : 'border-rose-200 text-rose-700 hover:bg-rose-50'
                        }`}
                        disabled={!canEdit || !selectedBlock?.can_delete}
                        onClick={() => void handleBlockDelete()}
                        type="button"
                      >
                        {armedBlockDeleteId === selectedBlockId ? 'Подтвердить удаление' : 'Удалить'}
                      </button>
                    </div>
                  </PanelCard>

                  <PanelCard title="Библиотека">
                    <div className="space-y-3">
                      {blockLibrary.map((block) => (
                        <button
                          key={block.type}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={!canEdit}
                          onClick={() => void addBlock(block.type)}
                          type="button"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-2 rounded-full ${block.accent}`} />
                            <div>
                              <div className="text-sm font-semibold text-slate-950">{block.label}</div>
                              <div className="mt-1 text-sm text-slate-600">{block.description}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </PanelCard>
                </>
              )}

              {activeTab === 'properties' && (
                <BlockInspector
                  assets={workspace.assets}
                  block={selectedBlock}
                  onChange={(patch) => {
                    if (selectedBlock && canEdit) {
                      updateBlockDraft(selectedBlock.id, patch);
                    }
                  }}
                />
              )}

              {activeTab === 'media' && (
                <>
                  <PanelCard title="Загрузка">
                    <label className="block rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600 transition hover:border-slate-400 hover:bg-white">
                      <Bars3Icon className="mx-auto h-6 w-6 text-slate-500" />
                      <div className="mt-3 font-medium">Выберите файл для медиатеки</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-400">S3 upload</div>
                      <input
                        className="hidden"
                        disabled={!canUploadAssets}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) {
                            void uploadAsset(file, selectedBlock?.type ?? 'general');
                            event.target.value = '';
                          }
                        }}
                        type="file"
                      />
                    </label>
                    {!canUploadAssets && (
                      <div className="text-xs text-slate-500">
                        Нужны права `multi-organization.website.assets.upload`.
                      </div>
                    )}
                  </PanelCard>

                  <PanelCard title="Медиатека">
                    <div className="space-y-4">
                      {workspace.assets.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                          Пока нет файлов. Загрузите изображения для блоков и SEO.
                        </div>
                      )}
                      {workspace.assets.map((asset) => (
                        <div key={asset.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex gap-4">
                            <div className="h-20 w-20 overflow-hidden rounded-2xl bg-slate-200">
                              {asset.public_url ? (
                                <img alt={asset.filename} className="h-full w-full object-cover" src={asset.public_url} />
                              ) : null}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-semibold text-slate-950">{asset.filename}</div>
                              <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                                {asset.asset_type} · {asset.human_size}
                              </div>
                              <div className="mt-3 grid gap-3">
                                <input
                                  className={textInputClassName}
                                  placeholder="Alt text"
                                  value={asString(asset.metadata.alt_text)}
                                  onChange={(event) =>
                                    canManageAssets &&
                                    void updateAsset(asset.id, {
                                      ...asset.metadata,
                                      alt_text: event.target.value,
                                    })
                                  }
                                />
                                <input
                                  className={textInputClassName}
                                  placeholder="Caption"
                                  value={asString(asset.metadata.caption)}
                                  onChange={(event) =>
                                    canManageAssets &&
                                    void updateAsset(asset.id, {
                                      ...asset.metadata,
                                      caption: event.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                            <div>
                              {asset.usage_map?.length ? `Используется в ${asset.usage_map.length} местах` : 'Файл не используется'}
                            </div>
                            <button
                              className={`font-medium transition disabled:text-slate-400 ${
                                armedAssetDeleteId === asset.id ? 'text-rose-700' : 'text-rose-600 hover:text-rose-700'
                              }`}
                              disabled={!canManageAssets || !asset.safe_delete}
                              onClick={() => {
                                if (armedAssetDeleteId !== asset.id) {
                                  setArmedAssetDeleteId(asset.id);
                                  return;
                                }

                                void deleteAsset(asset.id);
                                setArmedAssetDeleteId(null);
                              }}
                              type="button"
                            >
                              {armedAssetDeleteId === asset.id ? 'Подтвердить удаление' : 'Удалить'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </PanelCard>
                </>
              )}

              {activeTab === 'settings' && (
                <>
                  <PanelCard title="Идентичность">
                    <Field label="Домен">
                      <input
                        className={textInputClassName}
                        value={workspace.site.domain}
                        onChange={(event) => canEdit && updateSiteDraft({ domain: event.target.value })}
                      />
                    </Field>
                    <Field label="Название сайта">
                      <input
                        className={textInputClassName}
                        value={workspace.site.title}
                        onChange={(event) => canEdit && updateSiteDraft({ title: event.target.value })}
                      />
                    </Field>
                    <Field label="Описание сайта">
                      <textarea
                        className={`${textInputClassName} min-h-24`}
                        value={workspace.site.description}
                        onChange={(event) => canEdit && updateSiteDraft({ description: event.target.value })}
                      />
                    </Field>
                  </PanelCard>

                  <PanelCard title="Тема">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {(['primary_color', 'secondary_color', 'accent_color', 'background_color', 'text_color'] as const).map((field) => (
                        <Field key={field} label={field}>
                          <input
                            className={`${textInputClassName} h-12`}
                            type="color"
                            value={workspace.site.theme_config[field]}
                            onChange={(event) =>
                              canEdit &&
                              updateSiteDraft({
                                theme_config: {
                                  ...workspace.site.theme_config,
                                  [field]: event.target.value,
                                },
                              })
                            }
                          />
                        </Field>
                      ))}
                      <Field label="Шрифт">
                        <input
                          className={textInputClassName}
                          value={workspace.site.theme_config.font_family}
                          onChange={(event) =>
                            canEdit &&
                            updateSiteDraft({
                              theme_config: {
                                ...workspace.site.theme_config,
                                font_family: event.target.value,
                              },
                            })
                          }
                        />
                      </Field>
                      <Field label="Скругление">
                        <input
                          className={textInputClassName}
                          value={workspace.site.theme_config.border_radius}
                          onChange={(event) =>
                            canEdit &&
                            updateSiteDraft({
                              theme_config: {
                                ...workspace.site.theme_config,
                                border_radius: event.target.value,
                              },
                            })
                          }
                        />
                      </Field>
                    </div>
                  </PanelCard>
                </>
              )}

              {activeTab === 'leads' && (
                <>
                  <PanelCard title="SEO">
                    <Field label="Meta title">
                      <input
                        className={textInputClassName}
                        value={workspace.site.seo_meta.title}
                        onChange={(event) =>
                          canEdit &&
                          updateSiteDraft({
                            seo_meta: {
                              ...workspace.site.seo_meta,
                              title: event.target.value,
                            },
                          })
                        }
                      />
                    </Field>
                    <Field label="Meta description">
                      <textarea
                        className={`${textInputClassName} min-h-24`}
                        value={workspace.site.seo_meta.description}
                        onChange={(event) =>
                          canEdit &&
                          updateSiteDraft({
                            seo_meta: {
                              ...workspace.site.seo_meta,
                              description: event.target.value,
                            },
                          })
                        }
                      />
                    </Field>
                    <Field label="Keywords">
                      <input
                        className={textInputClassName}
                        value={workspace.site.seo_meta.keywords}
                        onChange={(event) =>
                          canEdit &&
                          updateSiteDraft({
                            seo_meta: {
                              ...workspace.site.seo_meta,
                              keywords: event.target.value,
                            },
                          })
                        }
                      />
                    </Field>
                  </PanelCard>

                  <PanelCard title="Лид-инбокс">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Всего</div>
                        <div className="mt-2 text-2xl font-semibold text-slate-950">{leadSummary?.total ?? 0}</div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Сегодня</div>
                        <div className="mt-2 text-2xl font-semibold text-slate-950">{leadSummary?.today ?? 0}</div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">За неделю</div>
                        <div className="mt-2 text-2xl font-semibold text-slate-950">{leadSummary?.week ?? 0}</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {leads.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                          Пока нет входящих заявок.
                        </div>
                      )}
                      {leads.map((lead) => (
                        <div key={lead.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-slate-950">
                                {lead.name || lead.company || 'Новый лид'}
                              </div>
                              <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                                {lead.block_key || 'lead_form'}
                              </div>
                            </div>
                            <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                              {lead.status}
                            </div>
                          </div>
                          <div className="mt-3 grid gap-2 text-sm text-slate-600">
                            {lead.phone && <div>Телефон: {lead.phone}</div>}
                            {lead.email && <div>Email: {lead.email}</div>}
                            {lead.message && <div>Сообщение: {lead.message}</div>}
                            {lead.submitted_at && (
                              <div>Создано: {new Date(lead.submitted_at).toLocaleString('ru-RU')}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </PanelCard>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingEditorPage;
