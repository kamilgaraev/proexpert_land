import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  Bars3Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  CloudArrowUpIcon,
  EyeIcon,
  LinkIcon,
  PaintBrushIcon,
  PhotoIcon,
  PlusIcon,
  RectangleGroupIcon,
  ShieldCheckIcon,
  SparklesIcon,
  Square2StackIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import SiteBuilderRenderer from '@/components/holding/site-builder/SiteBuilderRenderer';
import { ARRAY_ITEM_TEMPLATES, FIELD_LABELS } from '@/constants/holdingSiteBuilder';
import { usePermissionsContext } from '@/contexts/PermissionsContext';
import { useHoldingSiteBuilder } from '@/hooks/useHoldingSiteBuilder';
import type {
  BuilderCanvasFocusTarget,
  EditorAsset,
  EditorBlock,
  SiteTemplatePreset,
} from '@/types/holding-site-builder';

type WorkspaceTab = 'structure' | 'properties' | 'media' | 'settings' | 'leads';

const TAB_META: Array<{
  id: WorkspaceTab;
  label: string;
  description: string;
  icon: typeof RectangleGroupIcon;
}> = [
  { id: 'structure', label: 'Структура', description: 'Секции, порядок и шаблоны', icon: RectangleGroupIcon },
  { id: 'properties', label: 'Свойства', description: 'Контент и bindings блока', icon: SparklesIcon },
  { id: 'media', label: 'Медиа', description: 'Файлы, alt и usage map', icon: PhotoIcon },
  { id: 'settings', label: 'Настройки', description: 'Тема, домен и айдентика', icon: PaintBrushIcon },
  { id: 'leads', label: 'Лиды и SEO', description: 'Инбокс заявок и метаданные', icon: ShieldCheckIcon },
];

const TEMPLATE_COPY: Record<string, { name: string; summary: string }> = {
  corporate: {
    name: 'Корпоративный',
    summary: 'Полный каркас сайта: hero, proof, услуги, кейсы, команда и лид-форма.',
  },
  portfolio: {
    name: 'Портфолио',
    summary: 'Сценарий с акцентом на кейсы, галерею и отзывы.',
  },
  growth: {
    name: 'Growth',
    summary: 'Короткий конверсионный лендинг для быстрого запуска.',
  },
};

const textInputClassName =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100';

const quietButtonClassName =
  'inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50';

const dangerButtonClassName =
  'inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50';

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

const PanelCard = ({
  title,
  subtitle,
  actions,
  children,
  className = '',
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <section className={`rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</h3>
        {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions}
    </div>
    <div className="mt-5 space-y-4">{children}</div>
  </section>
);

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block">
    <span className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
      {label}
    </span>
    {children}
  </label>
);

const MetricTile = ({
  label,
  value,
  detail,
}: {
  label: string;
  value: ReactNode;
  detail: string;
}) => (
  <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-sm">
    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</div>
    <div className="mt-3 text-2xl font-semibold text-slate-950">{value}</div>
    <div className="mt-1 text-sm text-slate-500">{detail}</div>
  </div>
);

const TemplateButton = ({
  template,
  disabled,
  onApply,
}: {
  template: SiteTemplatePreset;
  disabled: boolean;
  onApply: () => void;
}) => {
  const copy = TEMPLATE_COPY[template.id] ?? {
    name: template.name,
    summary: template.description,
  };

  return (
    <button
      className="w-full rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
      disabled={disabled}
      onClick={onApply}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-950">{copy.name}</div>
          <div className="mt-2 text-sm leading-6 text-slate-600">{copy.summary}</div>
        </div>
        <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500">
          {template.blocks.length} блоков
        </div>
      </div>
    </button>
  );
};

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
        <img alt="" className="h-40 w-full object-cover" src={value} />
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
    <div className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
      {items.map((item, index) => (
        <div key={`${fieldName}-${index}`} className="rounded-[22px] border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Элемент {index + 1}
            </div>
            <button
              className="text-sm font-medium text-rose-600 transition hover:text-rose-700"
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
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
        onClick={addItem}
        type="button"
      >
        <PlusIcon className="h-4 w-4" />
        Добавить элемент
      </button>
    </div>
  );
};

const BlockInspector = ({
  block,
  assets,
  focusedFieldPath,
  onChange,
}: {
  block: EditorBlock | null;
  assets: EditorAsset[];
  focusedFieldPath?: string | null;
  onChange: (patch: Partial<EditorBlock>) => void;
}) => {
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!focusedFieldPath) {
      return;
    }

    const fieldElement = fieldRefs.current[focusedFieldPath];
    if (!fieldElement) {
      return;
    }

    fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const focusable = fieldElement.querySelector('input, textarea, select, button');
    if (focusable instanceof HTMLElement) {
      focusable.focus({ preventScroll: true });
    }
  }, [block?.id, focusedFieldPath]);

  if (!block) {
    return (
      <PanelCard
        title="Инспектор"
        subtitle="Выберите блок в структуре, чтобы редактировать поля, bindings и настройки."
      >
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
          Пока не выбран ни один блок.
        </div>
      </PanelCard>
    );
  }

  const schemaEntries = Object.entries(block.schema);

  return (
    <PanelCard
      title="Инспектор"
      subtitle={`Редактирование секции «${block.title}»`}
      actions={
        <div
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            block.is_renderable ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}
        >
          {block.is_renderable ? 'Готов к рендеру' : 'Нужны данные'}
        </div>
      }
    >
      <div
        className={`rounded-[24px] border p-4 transition ${
          focusedFieldPath === '__meta.title' ? 'border-blue-300 bg-blue-50/60' : 'border-slate-200 bg-slate-50'
        }`}
        data-editor-focus-target="__meta.title"
        ref={(element) => {
          fieldRefs.current['__meta.title'] = element;
        }}
      >
        <Field label="Название секции">
          <input
            className={textInputClassName}
            value={block.title}
            onChange={(event) => onChange({ title: event.target.value })}
          />
        </Field>
      </div>

      {schemaEntries.map(([fieldName, fieldSchema]) => (
        <div
          key={fieldName}
          className={`space-y-4 rounded-[24px] border p-4 transition ${
            focusedFieldPath === `content.${fieldName}`
              ? 'border-blue-300 bg-blue-50/60'
              : 'border-slate-200 bg-slate-50'
          }`}
          data-editor-focus-target={`content.${fieldName}`}
          ref={(element) => {
            fieldRefs.current[`content.${fieldName}`] = element;
          }}
        >
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
            <div className="grid gap-3 lg:grid-cols-[0.34fr,0.66fr]">
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
  const [selectedFieldPath, setSelectedFieldPath] = useState<string | null>(null);
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
          Загружаем конструктор сайта...
        </div>
      </div>
    );
  }

  const selectedIndex = workspace.blocks.findIndex((block) => block.id === selectedBlockId);
  const selectedPosition = selectedIndex >= 0 ? selectedIndex + 1 : null;
  const activeTabMeta = TAB_META.find((tab) => tab.id === activeTab) ?? TAB_META[0];

  const handleCanvasInteract = ({ blockId, fieldPath }: BuilderCanvasFocusTarget) => {
    selectBlock(blockId);
    setSelectedFieldPath(fieldPath ?? '__meta.title');
    setArmedBlockDeleteId(null);
    setActiveTab('properties');
  };

  useEffect(() => {
    if (!selectedBlockId) {
      setSelectedFieldPath(null);
    }
  }, [selectedBlockId]);

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

  const contextPanel = (() => {
    if (activeTab === 'structure') {
      return (
        <PanelCard
          title="Композиция сайта"
          subtitle="Выберите блок, меняйте порядок и управляйте секциями без потери контекста."
        >
          <div className="grid grid-cols-2 gap-3">
            <button
              className={quietButtonClassName}
              disabled={!canEdit || selectedIndex <= 0}
              onClick={() => void moveSelectedBlock(-1)}
              type="button"
            >
              <ChevronUpIcon className="h-4 w-4" />
              Выше
            </button>
            <button
              className={quietButtonClassName}
              disabled={!canEdit || selectedIndex < 0 || selectedIndex >= workspace.blocks.length - 1}
              onClick={() => void moveSelectedBlock(1)}
              type="button"
            >
              <ChevronDownIcon className="h-4 w-4" />
              Ниже
            </button>
            <button
              className={quietButtonClassName}
              disabled={!canEdit || !selectedBlockId}
              onClick={() => selectedBlockId && void duplicateBlock(selectedBlockId)}
              type="button"
            >
              <Square2StackIcon className="h-4 w-4" />
              Дублировать
            </button>
            <button
              className={
                armedBlockDeleteId === selectedBlockId
                  ? `${dangerButtonClassName} border-rose-400 bg-rose-50`
                  : dangerButtonClassName
              }
              disabled={!canEdit || !selectedBlock?.can_delete}
              onClick={() => void handleBlockDelete()}
              type="button"
            >
              <TrashIcon className="h-4 w-4" />
              {armedBlockDeleteId === selectedBlockId ? 'Подтвердить' : 'Удалить'}
            </button>
          </div>

          <div className="max-h-[66vh] space-y-3 overflow-auto pr-1">
            {workspace.blocks.map((block, index) => (
              <button
                key={block.id}
                className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
                  block.id === selectedBlockId
                    ? 'border-slate-950 bg-slate-950 text-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.7)]'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
                onClick={() => {
                  setArmedBlockDeleteId(null);
                  setSelectedFieldPath(null);
                  selectBlock(block.id);
                }}
                type="button"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 h-2.5 w-2.5 rounded-full ${
                      block.is_renderable ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="truncate text-sm font-semibold">{block.title}</div>
                        <div
                          className={`mt-1 text-xs ${
                            block.id === selectedBlockId ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          {block.type}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {savingBlocks[block.id] && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            block.id === selectedBlockId ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {index + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </PanelCard>
      );
    }

    if (activeTab === 'properties') {
      return (
        <BlockInspector
          assets={workspace.assets}
          block={selectedBlock}
          focusedFieldPath={selectedFieldPath}
          onChange={(patch) => {
            if (selectedBlock && canEdit) {
              updateBlockDraft(selectedBlock.id, patch);
            }
          }}
        />
      );
    }

    if (activeTab === 'media') {
      return (
        <div className="space-y-6">
          <PanelCard
            title="Загрузка"
            subtitle="Новые изображения, баннеры и SEO-ассеты попадают в общую медиатеку сайта."
          >
            <label className="block rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600 transition hover:border-slate-400 hover:bg-white">
              <Bars3Icon className="mx-auto h-6 w-6 text-slate-500" />
              <div className="mt-3 font-medium">Выберите файл для медиатеки</div>
              <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">S3 upload</div>
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

          <PanelCard
            title="Медиатека"
            subtitle="Usage map и safe delete позволяют чистить ассеты без риска сломать страницу."
          >
            <div className="max-h-[60vh] space-y-4 overflow-auto pr-1">
              {workspace.assets.length === 0 && (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  Пока нет файлов. Загрузите изображения для блоков и SEO.
                </div>
              )}
              {workspace.assets.map((asset) => (
                <div key={asset.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex gap-4">
                    <div className="h-20 w-20 overflow-hidden rounded-2xl bg-slate-200">
                      {asset.public_url ? (
                        <img alt={asset.filename} className="h-full w-full object-cover" src={asset.public_url} />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-slate-950">{asset.filename}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
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
                  <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
                    <div>
                      {asset.usage_map?.length
                        ? `Используется в ${asset.usage_map.length} местах`
                        : 'Файл не используется'}
                    </div>
                    <button
                      className={
                        armedAssetDeleteId === asset.id
                          ? 'font-medium text-rose-700'
                          : 'font-medium text-rose-600 transition hover:text-rose-700 disabled:text-slate-400'
                      }
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
        </div>
      );
    }

    if (activeTab === 'settings') {
      return (
        <div className="space-y-6">
          <PanelCard
            title="Идентичность"
            subtitle="Основные параметры сайта, которые влияют на публичный runtime и editor preview."
          >
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

          <PanelCard
            title="Тема"
            subtitle="Цвета и базовая айдентика должны совпадать между редактором, preview и опубликованной страницей."
          >
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
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <PanelCard
          title="SEO"
          subtitle="Meta title, description и keywords хранятся на уровне сайта и уходят в public runtime."
        >
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

        <PanelCard
          title="Лид-инбокс"
          subtitle="Заявки с публичной формы доступны прямо в редакторе, без переключения в другую зону."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricTile label="Всего" value={leadSummary?.total ?? 0} detail="Все обращения" />
            <MetricTile label="Сегодня" value={leadSummary?.today ?? 0} detail="За последние сутки" />
            <MetricTile label="За неделю" value={leadSummary?.week ?? 0} detail="Текущая неделя" />
          </div>
          <div className="max-h-[50vh] space-y-3 overflow-auto pr-1">
            {leads.length === 0 && (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                Пока нет входящих заявок.
              </div>
            )}
            {leads.map((lead) => (
              <div key={lead.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-950">
                      {lead.name || lead.company || 'Новый лид'}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
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
      </div>
    );
  })();

  return (
    <div className="-mx-4 min-h-full bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] sm:-mx-6 lg:-mx-8">
      <div className="px-4 py-5 sm:px-6 lg:px-8">
        <div className="rounded-[36px] border border-slate-200 bg-white/90 p-5 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.55)] backdrop-blur sm:p-6 lg:p-8">
          <div className="flex flex-col gap-6 border-b border-slate-200 pb-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex items-start gap-4">
                <button
                  className="grid h-12 w-12 place-items-center rounded-2xl border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                  onClick={() => navigate('/dashboard')}
                  type="button"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
                <div className="flex items-start gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-[20px] bg-slate-950 text-xl font-semibold text-white shadow-[0_20px_50px_-25px_rgba(15,23,42,0.8)]">
                    {workspace.site.title.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">{workspace.site.title}</h1>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          workspace.publication.is_published
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
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
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" />
                        {workspace.site.domain}
                      </span>
                      <span>Preview: live draft</span>
                      <span>Public: published snapshot</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button className={quietButtonClassName} onClick={openPreview} type="button">
                  <EyeIcon className="h-4 w-4" />
                  Превью
                </button>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  disabled={!canPublish || publishing}
                  onClick={publishSite}
                  type="button"
                >
                  <CloudArrowUpIcon className="h-4 w-4" />
                  {publishing ? 'Публикация...' : 'Опубликовать'}
                </button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.35fr),repeat(4,minmax(0,1fr))]">
              <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a,#1e3a8a)] px-5 py-5 text-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.7)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-100/80">
                  Текущий фокус
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="text-xl font-semibold">
                    {selectedBlock ? selectedBlock.title : 'Выберите блок для редактирования'}
                  </div>
                  {selectedPosition && (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-50">
                      Позиция {selectedPosition}
                    </span>
                  )}
                </div>
                <div className="mt-3 text-sm text-blue-100/80">
                  {selectedBlock
                    ? `${activeTabMeta.label}: ${selectedBlock.type}. ${
                        selectedBlock.is_renderable
                          ? 'Блок можно отрендерить.'
                          : 'Нужно заполнить данные или настроить bindings.'
                      }`
                    : 'Выберите секцию в структуре и работайте с ней в инспекторе справа.'}
                </div>
              </div>

              <MetricTile
                label="Блоки"
                value={workspace.summary.blocks_count}
                detail={`Активных: ${workspace.summary.active_blocks_count}`}
              />
              <MetricTile
                label="Лиды"
                value={leadSummary?.total ?? workspace.summary.leads_count}
                detail={`Сегодня: ${leadSummary?.today ?? 0}`}
              />
              <MetricTile
                label="Медиа"
                value={workspace.summary.assets_count}
                detail="Общая медиатека сайта"
              />
              <MetricTile
                label="Автосохранение"
                value={savingSite ? '...' : 'Live'}
                detail={savingSite ? 'Сохраняем сайт' : 'Черновик синхронизирован'}
              />
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr),360px] 2xl:grid-cols-[minmax(0,1fr),390px]">
            <aside className="space-y-6 xl:col-span-2">
              <PanelCard title="Режим работы" subtitle="Переключайте рабочие зоны, не покидая редактор.">
                <div className="grid gap-2 md:grid-cols-2 2xl:grid-cols-5">
                  {TAB_META.map((tab) => (
                    <button
                      key={tab.id}
                      className={`flex items-start gap-3 rounded-[22px] px-4 py-4 text-left transition ${
                        activeTab === tab.id
                          ? 'bg-slate-950 text-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.7)]'
                          : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                      type="button"
                    >
                      <tab.icon className={`mt-0.5 h-5 w-5 ${activeTab === tab.id ? 'text-white' : 'text-slate-500'}`} />
                      <div>
                        <div className="text-sm font-semibold">{tab.label}</div>
                        <div className={`mt-1 text-xs leading-5 ${activeTab === tab.id ? 'text-slate-300' : 'text-slate-500'}`}>
                          {tab.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </PanelCard>

              {activeTab === 'structure' ? (
                <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.15fr),0.85fr]">
                  <PanelCard
                    title="Добавить секцию"
                    subtitle="Curated library для one-page сценария. Добавляйте секции, не уходя из canvas."
                  >
                    <div className="grid gap-3 lg:grid-cols-2">
                      {blockLibrary.map((block) => (
                        <button
                          key={block.type}
                          className="w-full rounded-[24px] border border-slate-200 bg-white px-4 py-4 text-left transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={!canEdit}
                          onClick={() => void addBlock(block.type)}
                          type="button"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-2 rounded-full ${block.accent}`} />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-slate-950">{block.label}</div>
                              <div className="mt-1 text-sm text-slate-600">{block.description}</div>
                            </div>
                            <PlusIcon className="h-4 w-4 text-slate-400" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </PanelCard>

                  <PanelCard
                    title="Шаблоны"
                    subtitle="Быстрый старт для типовых сайтов. Недостающие секции будут добавлены автоматически."
                  >
                    <div className="space-y-3">
                      {templates.map((template) => (
                        <TemplateButton
                          key={template.id}
                          disabled={!canUseTemplates}
                          onApply={() => void applyTemplate(template)}
                          template={template}
                        />
                      ))}
                    </div>
                  </PanelCard>
                </div>
              ) : (
                <PanelCard
                  title="В фокусе"
                  subtitle="Контекст выбранной секции и публикационного состояния всегда остается под рукой."
                >
                  {selectedBlock ? (
                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-950">{selectedBlock.title}</div>
                          <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                            {selectedBlock.type}
                          </div>
                        </div>
                        {selectedPosition && (
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                            #{selectedPosition}
                          </span>
                        )}
                      </div>
                      <div className="mt-4 grid gap-3 text-sm text-slate-600">
                        <div>
                          Статус рендера:{' '}
                          <span className={selectedBlock.is_renderable ? 'text-emerald-700' : 'text-amber-700'}>
                            {selectedBlock.is_renderable ? 'готов' : 'нужны данные'}
                          </span>
                        </div>
                        <div>Bindings помогают держать этот блок в синхроне с данными ProHelper.</div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                      Выберите секцию в структуре.
                    </div>
                  )}
                </PanelCard>
              )}
            </aside>

            <section className="min-w-0">
              <PanelCard
                title="Canvas"
                subtitle="Превью живого черновика. Компоненты совпадают с публичным runtime."
                actions={
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      Клик по тексту или изображению открывает нужное поле
                    </div>
                    <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {activeTab === 'structure' ? 'Desktop preview' : activeTabMeta.label}
                    </div>
                  </div>
                }
              >
                <div className="rounded-[32px] border border-slate-200 bg-[linear-gradient(180deg,#eef2ff_0%,#f8fafc_100%)] p-4 sm:p-6">
                  <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_40px_100px_-50px_rgba(15,23,42,0.7)]">
                    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
                          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                        </div>
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Holding site preview
                        </div>
                      </div>
                      <div className="text-xs text-slate-500">
                        {hasUnsavedChanges ? 'Есть локальные изменения' : 'Черновик синхронизирован'}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-3">
                      <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {workspace.publication.is_published ? 'Публичный snapshot активен' : 'Работаем с live draft'}
                      </div>
                      {selectedBlock && (
                        <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                          {selectedBlock.title}
                        </div>
                      )}
                    </div>
                    <div className="max-h-[78vh] overflow-auto bg-slate-100/70 p-3 sm:p-5">
                      <div className="mx-auto max-w-[1240px]">
                        <SiteBuilderRenderer
                          blocks={publicBlocks}
                          mode="editor"
                          onEditorInteract={handleCanvasInteract}
                          selectedBlockId={selectedBlockId}
                          selectedFieldPath={selectedFieldPath}
                          site={workspace.site}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </PanelCard>
            </section>

            <section className="min-w-0 xl:sticky xl:top-6 xl:self-start">{contextPanel}</section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingEditorPage;
