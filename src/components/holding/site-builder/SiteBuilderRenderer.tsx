import { useMemo, useState } from 'react';
import type { FormEvent, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import NotificationService from '@components/shared/NotificationService';
import type {
  BuilderCanvasFocusTarget,
  EditorAsset,
  EditorSite,
  LeadSubmissionPayload,
  PublicSitePayload,
} from '@/types/holding-site-builder';

type PublicBlock = PublicSitePayload['blocks'][number];

interface SiteBuilderRendererProps {
  site: EditorSite;
  blocks: PublicBlock[];
  mode?: 'public' | 'editor';
  selectedBlockId?: number | null;
  selectedFieldPath?: string | null;
  onEditorInteract?: (target: BuilderCanvasFocusTarget) => void;
  onSubmitLead?: (payload: LeadSubmissionPayload) => Promise<unknown>;
}

interface SectionEditorState {
  blockId: number;
  label: string;
  selected: boolean;
  onSelect: (target: BuilderCanvasFocusTarget) => void;
}

const stringValue = (value: unknown): string => (typeof value === 'string' ? value : '');

const arrayValue = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const assetImage = (asset?: EditorAsset) => asset?.optimized_url?.large ?? asset?.public_url ?? '';

const Surface = ({
  site,
  children,
}: Pick<SiteBuilderRendererProps, 'site'> & { children: ReactNode }) => (
  <div
    className="rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)]"
    style={{
      color: site.theme_config.text_color,
      backgroundColor: site.theme_config.background_color,
      fontFamily: site.theme_config.font_family,
    }}
  >
    {children}
  </div>
);

const handleInteractiveKeyDown = (event: KeyboardEvent<HTMLElement>, onInteract: () => void) => {
  if (event.key !== 'Enter' && event.key !== ' ') {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  onInteract();
};

const EditableHotspot = ({
  active = false,
  className = '',
  target,
  onInteract,
  children,
}: {
  active?: boolean;
  className?: string;
  target: BuilderCanvasFocusTarget;
  onInteract?: (target: BuilderCanvasFocusTarget) => void;
  children: ReactNode;
}) => {
  if (!onInteract) {
    return <>{children}</>;
  }

  const handleInteract = () => {
    onInteract(target);
  };

  return (
    <div
      className={`rounded-[20px] outline-none transition ${
        active
          ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-white'
          : 'hover:bg-blue-50/70 hover:ring-2 hover:ring-blue-200 hover:ring-offset-2 hover:ring-offset-white'
      } ${className}`}
      onClick={(event: MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        handleInteract();
      }}
      onKeyDown={(event) => handleInteractiveKeyDown(event, handleInteract)}
      role="button"
      tabIndex={0}
    >
      {children}
    </div>
  );
};

const Section = ({
  id,
  children,
  editorState,
}: {
  id?: string;
  children: ReactNode;
  editorState?: SectionEditorState;
}) => (
  <section
    id={id}
    className={`group relative border-b border-slate-100 px-6 py-10 last:border-b-0 sm:px-10 ${
      editorState ? 'cursor-pointer' : ''
    }`}
    onClick={
      editorState
        ? (event) => {
            event.preventDefault();
            editorState.onSelect({
              blockId: editorState.blockId,
              fieldPath: '__meta.title',
              intent: 'block',
            });
          }
        : undefined
    }
  >
    {editorState && (
      <>
        <div
          className={`pointer-events-none absolute inset-3 rounded-[28px] border transition ${
            editorState.selected
              ? 'border-blue-400 bg-blue-50/50 shadow-[0_24px_60px_-36px_rgba(37,99,235,0.65)]'
              : 'border-transparent group-hover:border-blue-200 group-hover:bg-blue-50/30'
          }`}
        />
        <div className="pointer-events-none absolute left-6 top-4 z-10 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 shadow-sm">
          <span className={`h-2 w-2 rounded-full ${editorState.selected ? 'bg-blue-500' : 'bg-slate-300'}`} />
          {editorState.label}
        </div>
      </>
    )}
    <div className="relative z-10">{children}</div>
  </section>
);

const LeadFormBlock = ({
  block,
  mode,
  selectedBlockId,
  selectedFieldPath,
  onEditorInteract,
  onSubmitLead,
}: {
  block: PublicBlock;
  mode: 'public' | 'editor';
  selectedBlockId?: number | null;
  selectedFieldPath?: string | null;
  onEditorInteract?: (target: BuilderCanvasFocusTarget) => void;
  onSubmitLead?: (payload: LeadSubmissionPayload) => Promise<unknown>;
}) => {
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: '',
    website: '',
  });
  const [sending, setSending] = useState(false);

  const title = stringValue(block.content.title) || block.title;
  const description = stringValue(block.content.description);
  const submitLabel = stringValue(block.content.submit_label) || 'Отправить заявку';

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === 'editor' || !onSubmitLead) {
      NotificationService.show({
        type: 'info',
        title: 'Превью',
        message: 'Отправка лидов отключена в режиме редактора.',
      });
      return;
    }

    setSending(true);
    try {
      await onSubmitLead({
        ...form,
        block_key: block.key,
        source_page: 'holding-site',
        source_url: window.location.href,
        form_payload: {
          name: form.name,
          company: form.company,
          email: form.email,
          phone: form.phone,
          message: form.message,
        },
      });

      NotificationService.show({
        type: 'success',
        title: 'Заявка',
        message: stringValue(block.content.success_message) || 'Заявка отправлена.',
      });

      setForm({
        name: '',
        company: '',
        email: '',
        phone: '',
        message: '',
        website: '',
      });
    } catch (error) {
      NotificationService.show({
        type: 'error',
        title: 'Заявка',
        message: error instanceof Error ? error.message : 'Не удалось отправить заявку.',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Section
      id={typeof block.settings.anchor_id === 'string' ? block.settings.anchor_id : 'lead-form'}
      editorState={
        mode === 'editor' && onEditorInteract
          ? {
              blockId: block.id,
              label: block.title,
              selected: selectedBlockId === block.id,
              onSelect: onEditorInteract,
            }
          : undefined
      }
    >
      <div className="mx-auto max-w-3xl rounded-[24px] bg-slate-950 px-6 py-8 text-white sm:px-8">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Lead form</div>
          <EditableHotspot
            active={selectedFieldPath === 'content.title'}
            className="mt-3 w-fit"
            onInteract={onEditorInteract}
            target={{ blockId: block.id, fieldPath: 'content.title', intent: 'text' }}
          >
            <h3 className="text-3xl font-semibold">{title}</h3>
          </EditableHotspot>
          {description && (
            <EditableHotspot
              active={selectedFieldPath === 'content.description'}
              className="mt-3 w-fit max-w-2xl"
              onInteract={onEditorInteract}
              target={{ blockId: block.id, fieldPath: 'content.description', intent: 'text' }}
            >
              <p className="text-slate-300">{description}</p>
            </EditableHotspot>
          )}
        </div>

        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <input
            className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm outline-none"
            placeholder="Имя"
            readOnly={mode === 'editor'}
            value={form.name}
            onChange={(event) => handleChange('name', event.target.value)}
          />
          <input
            className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm outline-none"
            placeholder="Компания"
            readOnly={mode === 'editor'}
            value={form.company}
            onChange={(event) => handleChange('company', event.target.value)}
          />
          <input
            className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm outline-none"
            placeholder="Email"
            readOnly={mode === 'editor'}
            value={form.email}
            onChange={(event) => handleChange('email', event.target.value)}
          />
          <input
            className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm outline-none"
            placeholder="Телефон"
            readOnly={mode === 'editor'}
            value={form.phone}
            onChange={(event) => handleChange('phone', event.target.value)}
          />
          <textarea
            className="min-h-28 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm outline-none sm:col-span-2"
            placeholder="Кратко опишите задачу"
            readOnly={mode === 'editor'}
            value={form.message}
            onChange={(event) => handleChange('message', event.target.value)}
          />
          <input
            autoComplete="off"
            className="hidden"
            tabIndex={-1}
            value={form.website}
            onChange={(event) => handleChange('website', event.target.value)}
          />
          {mode === 'editor' ? (
            <EditableHotspot
              active={selectedFieldPath === 'content.submit_label'}
              className="sm:col-span-2"
              onInteract={onEditorInteract}
              target={{ blockId: block.id, fieldPath: 'content.submit_label', intent: 'button' }}
            >
              <div className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-medium text-slate-950 transition hover:bg-slate-100">
                {submitLabel}
              </div>
            </EditableHotspot>
          ) : (
            <button
              className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-100 sm:col-span-2"
              disabled={sending}
              type="submit"
            >
              {sending ? 'Отправка...' : submitLabel}
            </button>
          )}
        </form>
      </div>
    </Section>
  );
};

const renderBlock = ({
  block,
  mode,
  onEditorInteract,
  onSubmitLead,
  selectedBlockId,
  selectedFieldPath,
}: {
  block: PublicBlock;
  mode: 'public' | 'editor';
  onEditorInteract?: (target: BuilderCanvasFocusTarget) => void;
  onSubmitLead?: (payload: LeadSubmissionPayload) => Promise<unknown>;
  selectedBlockId?: number | null;
  selectedFieldPath?: string | null;
}) => {
  const title = stringValue(block.content.title) || block.title;
  const description = stringValue(block.content.description);
  const firstAsset = block.assets[0];
  const sectionEditorState =
    mode === 'editor' && onEditorInteract
      ? {
          blockId: block.id,
          label: block.title,
          selected: selectedBlockId === block.id,
          onSelect: onEditorInteract,
        }
      : undefined;

  switch (block.type) {
    case 'hero':
      return (
        <Section editorState={sectionEditorState} key={block.id}>
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr,0.9fr]">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Holding site</div>
              <EditableHotspot
                active={selectedFieldPath === 'content.title'}
                className="mt-4 w-fit max-w-3xl"
                onInteract={onEditorInteract}
                target={{ blockId: block.id, fieldPath: 'content.title', intent: 'text' }}
              >
                <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                  {title || 'Новый сайт холдинга'}
                </h1>
              </EditableHotspot>
              {stringValue(block.content.subtitle) && (
                <EditableHotspot
                  active={selectedFieldPath === 'content.subtitle'}
                  className="mt-4 w-fit max-w-2xl"
                  onInteract={onEditorInteract}
                  target={{ blockId: block.id, fieldPath: 'content.subtitle', intent: 'text' }}
                >
                  <p className="text-xl text-slate-700">{stringValue(block.content.subtitle)}</p>
                </EditableHotspot>
              )}
              {description && (
                <EditableHotspot
                  active={selectedFieldPath === 'content.description'}
                  className="mt-4 w-fit max-w-2xl"
                  onInteract={onEditorInteract}
                  target={{ blockId: block.id, fieldPath: 'content.description', intent: 'text' }}
                >
                  <p className="text-base text-slate-600">{description}</p>
                </EditableHotspot>
              )}
              {stringValue(block.content.button_text) &&
                (mode === 'editor' ? (
                  <EditableHotspot
                    active={selectedFieldPath === 'content.button_text'}
                    className="mt-6 inline-flex"
                    onInteract={onEditorInteract}
                    target={{ blockId: block.id, fieldPath: 'content.button_text', intent: 'button' }}
                  >
                    <div className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
                      {stringValue(block.content.button_text)}
                    </div>
                  </EditableHotspot>
                ) : (
                  <a
                    className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                    href={stringValue(block.content.button_url) || '#lead-form'}
                  >
                    {stringValue(block.content.button_text)}
                  </a>
                ))}
            </div>
            <EditableHotspot
              active={selectedFieldPath === 'content.background_image'}
              className="overflow-hidden"
              onInteract={onEditorInteract}
              target={{ blockId: block.id, fieldPath: 'content.background_image', intent: 'image' }}
            >
              <div className="overflow-hidden rounded-[24px] bg-slate-100">
                {stringValue(block.content.background_image) || assetImage(firstAsset) ? (
                  <img
                    alt={title}
                    className="h-full w-full object-cover"
                    src={stringValue(block.content.background_image) || assetImage(firstAsset)}
                  />
                ) : (
                  <div className="grid min-h-72 place-items-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.3),_transparent_55%),linear-gradient(135deg,#0f172a,#334155)] text-6xl text-white">
                    P
                  </div>
                )}
              </div>
            </EditableHotspot>
          </div>
        </Section>
      );
    case 'stats':
      return (
        <Section editorState={sectionEditorState} key={block.id}>
          <div className="mb-6">
            <EditableHotspot
              active={selectedFieldPath === 'content.title'}
              className="w-fit"
              onInteract={onEditorInteract}
              target={{ blockId: block.id, fieldPath: 'content.title', intent: 'text' }}
            >
              <h2 className="text-3xl font-semibold">{title}</h2>
            </EditableHotspot>
            {description && (
              <EditableHotspot
                active={selectedFieldPath === 'content.description'}
                className="mt-2 w-fit max-w-3xl"
                onInteract={onEditorInteract}
                target={{ blockId: block.id, fieldPath: 'content.description', intent: 'text' }}
              >
                <p className="text-slate-600">{description}</p>
              </EditableHotspot>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {arrayValue<{ label?: string; value?: string | number }>(block.content.items).map((item, index) => (
              <EditableHotspot
                active={selectedFieldPath === 'content.items'}
                className="h-full"
                key={`${block.id}-stat-${index}`}
                onInteract={onEditorInteract}
                target={{ blockId: block.id, fieldPath: 'content.items', intent: 'collection' }}
              >
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <div className="text-3xl font-semibold text-slate-950">{item.value ?? '0'}</div>
                  <div className="mt-2 text-sm text-slate-600">{item.label ?? 'Показатель'}</div>
                </div>
              </EditableHotspot>
            ))}
          </div>
        </Section>
      );
    case 'about':
      return (
        <Section editorState={sectionEditorState} key={block.id}>
          <div className="grid gap-8 lg:grid-cols-[1fr,0.8fr]">
            <div>
              <EditableHotspot
                active={selectedFieldPath === 'content.title'}
                className="w-fit"
                onInteract={onEditorInteract}
                target={{ blockId: block.id, fieldPath: 'content.title', intent: 'text' }}
              >
                <h2 className="text-3xl font-semibold">{title}</h2>
              </EditableHotspot>
              <EditableHotspot
                active={selectedFieldPath === 'content.description'}
                className="mt-4"
                onInteract={onEditorInteract}
                target={{ blockId: block.id, fieldPath: 'content.description', intent: 'text' }}
              >
                <div
                  className="prose max-w-none text-slate-700"
                  dangerouslySetInnerHTML={{ __html: description || '<p>Добавьте описание холдинга.</p>' }}
                />
              </EditableHotspot>
            </div>
            {(stringValue(block.content.image) || assetImage(firstAsset)) && (
              <EditableHotspot
                active={selectedFieldPath === 'content.image'}
                onInteract={onEditorInteract}
                target={{ blockId: block.id, fieldPath: 'content.image', intent: 'image' }}
              >
                <div className="overflow-hidden rounded-[24px] bg-slate-100">
                  <img
                    alt={title}
                    className="h-full w-full object-cover"
                    src={stringValue(block.content.image) || assetImage(firstAsset)}
                  />
                </div>
              </EditableHotspot>
            )}
          </div>
        </Section>
      );
    case 'services':
      return (
        <Section editorState={sectionEditorState} key={block.id}>
          <div className="mb-6">
            <EditableHotspot
              active={selectedFieldPath === 'content.title'}
              className="w-fit"
              onInteract={onEditorInteract}
              target={{ blockId: block.id, fieldPath: 'content.title', intent: 'text' }}
            >
              <h2 className="text-3xl font-semibold">{title}</h2>
            </EditableHotspot>
            {description && (
              <EditableHotspot
                active={selectedFieldPath === 'content.description'}
                className="mt-2 w-fit max-w-3xl"
                onInteract={onEditorInteract}
                target={{ blockId: block.id, fieldPath: 'content.description', intent: 'text' }}
              >
                <p className="text-slate-600">{description}</p>
              </EditableHotspot>
            )}
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {arrayValue<{ title?: string; description?: string }>(block.content.services).map((item, index) => (
              <EditableHotspot
                active={selectedFieldPath === 'content.services'}
                className="h-full"
                key={`${block.id}-service-${index}`}
                onInteract={onEditorInteract}
                target={{ blockId: block.id, fieldPath: 'content.services', intent: 'collection' }}
              >
                <article className="rounded-[24px] border border-slate-200 p-5">
                  <h3 className="text-lg font-medium">{item.title ?? 'Услуга'}</h3>
                  {item.description && <p className="mt-3 text-sm text-slate-600">{item.description}</p>}
                </article>
              </EditableHotspot>
            ))}
          </div>
        </Section>
      );
    case 'projects':
      return (
        <Section editorState={sectionEditorState} key={block.id}>
          <div className="mb-6">
            <EditableHotspot
              active={selectedFieldPath === 'content.title'}
              className="w-fit"
              onInteract={onEditorInteract}
              target={{ blockId: block.id, fieldPath: 'content.title', intent: 'text' }}
            >
              <h2 className="text-3xl font-semibold">{title}</h2>
            </EditableHotspot>
            {description && (
              <EditableHotspot
                active={selectedFieldPath === 'content.description'}
                className="mt-2 w-fit max-w-3xl"
                onInteract={onEditorInteract}
                target={{ blockId: block.id, fieldPath: 'content.description', intent: 'text' }}
              >
                <p className="text-slate-600">{description}</p>
              </EditableHotspot>
            )}
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {arrayValue<{ title?: string; description?: string; location?: string; completed_at?: string }>(block.content.projects).map((item, index) => (
              <EditableHotspot
                active={selectedFieldPath === 'content.projects'}
                className="h-full"
                key={`${block.id}-project-${index}`}
                onInteract={onEditorInteract}
                target={{ blockId: block.id, fieldPath: 'content.projects', intent: 'collection' }}
              >
                <article className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-500">{item.completed_at ?? 'Case'}</div>
                  <h3 className="mt-3 text-lg font-medium">{item.title ?? 'Проект'}</h3>
                  {item.description && <p className="mt-3 text-sm text-slate-600">{item.description}</p>}
                  {item.location && <div className="mt-4 text-xs text-slate-500">{item.location}</div>}
                </article>
              </EditableHotspot>
            ))}
          </div>
        </Section>
      );
    case 'team':
      return (
        <Section editorState={sectionEditorState} key={block.id}>
          <div className="mb-6">
            <EditableHotspot
              active={selectedFieldPath === 'content.title'}
              className="w-fit"
              onInteract={onEditorInteract}
              target={{ blockId: block.id, fieldPath: 'content.title', intent: 'text' }}
            >
              <h2 className="text-3xl font-semibold">{title}</h2>
            </EditableHotspot>
            {description && (
              <EditableHotspot
                active={selectedFieldPath === 'content.description'}
                className="mt-2 w-fit max-w-3xl"
                onInteract={onEditorInteract}
                target={{ blockId: block.id, fieldPath: 'content.description', intent: 'text' }}
              >
                <p className="text-slate-600">{description}</p>
              </EditableHotspot>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {arrayValue<{ name?: string; position?: string; email?: string }>(block.content.members).map((item, index) => (
              <EditableHotspot
                active={selectedFieldPath === 'content.members'}
                className="h-full"
                key={`${block.id}-member-${index}`}
                onInteract={onEditorInteract}
                target={{ blockId: block.id, fieldPath: 'content.members', intent: 'collection' }}
              >
                <article className="rounded-[24px] border border-slate-200 p-5">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-950 text-sm font-medium text-white">
                    {item.name?.slice(0, 1) ?? 'M'}
                  </div>
                  <h3 className="mt-4 text-lg font-medium">{item.name ?? 'Участник команды'}</h3>
                  {item.position && <p className="mt-1 text-sm text-slate-600">{item.position}</p>}
                  {item.email && <p className="mt-3 text-xs text-slate-500">{item.email}</p>}
                </article>
              </EditableHotspot>
            ))}
          </div>
        </Section>
      );
    case 'testimonials':
      return (
        <Section editorState={sectionEditorState} key={block.id}>
          <div className="mb-6">
            <EditableHotspot
              active={selectedFieldPath === 'content.title'}
              className="w-fit"
              onInteract={onEditorInteract}
              target={{ blockId: block.id, fieldPath: 'content.title', intent: 'text' }}
            >
              <h2 className="text-3xl font-semibold">{title}</h2>
            </EditableHotspot>
            {description && (
              <EditableHotspot
                active={selectedFieldPath === 'content.description'}
                className="mt-2 w-fit max-w-3xl"
                onInteract={onEditorInteract}
                target={{ blockId: block.id, fieldPath: 'content.description', intent: 'text' }}
              >
                <p className="text-slate-600">{description}</p>
              </EditableHotspot>
            )}
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {arrayValue<{ quote?: string; author?: string; role?: string }>(block.content.items).map((item, index) => (
              <EditableHotspot
                active={selectedFieldPath === 'content.items'}
                className="h-full"
                key={`${block.id}-quote-${index}`}
                onInteract={onEditorInteract}
                target={{ blockId: block.id, fieldPath: 'content.items', intent: 'collection' }}
              >
                <blockquote className="rounded-[24px] bg-slate-950 p-5 text-white">
                  <p className="text-base leading-7">{item.quote ?? 'Добавьте отзыв клиента.'}</p>
                  <footer className="mt-5 text-sm text-slate-300">
                    {item.author ?? 'Клиент'}
                    {item.role ? `, ${item.role}` : ''}
                  </footer>
                </blockquote>
              </EditableHotspot>
            ))}
          </div>
        </Section>
      );
    case 'gallery':
      return (
        <Section editorState={sectionEditorState} key={block.id}>
          <div className="mb-6">
            <EditableHotspot
              active={selectedFieldPath === 'content.title'}
              className="w-fit"
              onInteract={onEditorInteract}
              target={{ blockId: block.id, fieldPath: 'content.title', intent: 'text' }}
            >
              <h2 className="text-3xl font-semibold">{title}</h2>
            </EditableHotspot>
            {description && (
              <EditableHotspot
                active={selectedFieldPath === 'content.description'}
                className="mt-2 w-fit max-w-3xl"
                onInteract={onEditorInteract}
                target={{ blockId: block.id, fieldPath: 'content.description', intent: 'text' }}
              >
                <p className="text-slate-600">{description}</p>
              </EditableHotspot>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {arrayValue<{ url?: string; alt?: string; caption?: string }>(block.content.images).map((item, index) => (
              <EditableHotspot
                active={selectedFieldPath === 'content.images'}
                className="h-full"
                key={`${block.id}-gallery-${index}`}
                onInteract={onEditorInteract}
                target={{ blockId: block.id, fieldPath: 'content.images', intent: 'image' }}
              >
                <figure className="overflow-hidden rounded-[24px] bg-slate-100">
                  {item.url ? (
                    <img alt={item.alt ?? title} className="h-72 w-full object-cover" src={item.url} />
                  ) : (
                    <div className="grid h-72 place-items-center text-sm text-slate-500">Добавьте изображение</div>
                  )}
                  {item.caption && <figcaption className="px-4 py-3 text-sm text-slate-600">{item.caption}</figcaption>}
                </figure>
              </EditableHotspot>
            ))}
          </div>
        </Section>
      );
    case 'faq':
      return (
        <Section editorState={sectionEditorState} key={block.id}>
          <div className="mb-6">
            <EditableHotspot
              active={selectedFieldPath === 'content.title'}
              className="w-fit"
              onInteract={onEditorInteract}
              target={{ blockId: block.id, fieldPath: 'content.title', intent: 'text' }}
            >
              <h2 className="text-3xl font-semibold">{title}</h2>
            </EditableHotspot>
            {description && (
              <EditableHotspot
                active={selectedFieldPath === 'content.description'}
                className="mt-2 w-fit max-w-3xl"
                onInteract={onEditorInteract}
                target={{ blockId: block.id, fieldPath: 'content.description', intent: 'text' }}
              >
                <p className="text-slate-600">{description}</p>
              </EditableHotspot>
            )}
          </div>
          <div className="space-y-3">
            {arrayValue<{ question?: string; answer?: string }>(block.content.items).map((item, index) => (
              <EditableHotspot
                active={selectedFieldPath === 'content.items'}
                className="block"
                key={`${block.id}-faq-${index}`}
                onInteract={onEditorInteract}
                target={{ blockId: block.id, fieldPath: 'content.items', intent: 'collection' }}
              >
                <div className="rounded-[20px] border border-slate-200 px-5 py-4">
                  <div className="text-base font-medium">{item.question ?? 'Добавьте вопрос'}</div>
                  {item.answer && <p className="mt-3 text-sm text-slate-600">{item.answer}</p>}
                </div>
              </EditableHotspot>
            ))}
          </div>
        </Section>
      );
    case 'lead_form':
      return (
        <LeadFormBlock
          block={block}
          key={block.id}
          mode={mode}
          onEditorInteract={onEditorInteract}
          onSubmitLead={onSubmitLead}
          selectedBlockId={selectedBlockId}
          selectedFieldPath={selectedFieldPath}
        />
      );
    case 'contacts':
      return (
        <Section editorState={sectionEditorState} key={block.id}>
          <div className="grid gap-8 lg:grid-cols-[0.9fr,1.1fr]">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Contacts</div>
              <EditableHotspot
                active={selectedFieldPath === 'content.title'}
                className="mt-3 w-fit"
                onInteract={onEditorInteract}
                target={{ blockId: block.id, fieldPath: 'content.title', intent: 'text' }}
              >
                <h2 className="text-3xl font-semibold">{title}</h2>
              </EditableHotspot>
              {description && (
                <EditableHotspot
                  active={selectedFieldPath === 'content.description'}
                  className="mt-3 w-fit max-w-xl"
                  onInteract={onEditorInteract}
                  target={{ blockId: block.id, fieldPath: 'content.description', intent: 'text' }}
                >
                  <p className="text-slate-600">{description}</p>
                </EditableHotspot>
              )}
            </div>
            <div className="grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-6 sm:grid-cols-2">
              {stringValue(block.content.phone) && (
                <EditableHotspot
                  active={selectedFieldPath === 'content.phone'}
                  onInteract={onEditorInteract}
                  target={{ blockId: block.id, fieldPath: 'content.phone', intent: 'text' }}
                >
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Phone</div>
                    <div className="mt-2 text-lg">{stringValue(block.content.phone)}</div>
                  </div>
                </EditableHotspot>
              )}
              {stringValue(block.content.email) && (
                <EditableHotspot
                  active={selectedFieldPath === 'content.email'}
                  onInteract={onEditorInteract}
                  target={{ blockId: block.id, fieldPath: 'content.email', intent: 'text' }}
                >
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Email</div>
                    <div className="mt-2 text-lg">{stringValue(block.content.email)}</div>
                  </div>
                </EditableHotspot>
              )}
              {stringValue(block.content.address) && (
                <EditableHotspot
                  active={selectedFieldPath === 'content.address'}
                  className="sm:col-span-2"
                  onInteract={onEditorInteract}
                  target={{ blockId: block.id, fieldPath: 'content.address', intent: 'text' }}
                >
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Address</div>
                    <div className="mt-2 text-lg">{stringValue(block.content.address)}</div>
                  </div>
                </EditableHotspot>
              )}
              {stringValue(block.content.working_hours) && (
                <EditableHotspot
                  active={selectedFieldPath === 'content.working_hours'}
                  className="sm:col-span-2"
                  onInteract={onEditorInteract}
                  target={{ blockId: block.id, fieldPath: 'content.working_hours', intent: 'text' }}
                >
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Working hours</div>
                    <div className="mt-2 text-lg">{stringValue(block.content.working_hours)}</div>
                  </div>
                </EditableHotspot>
              )}
            </div>
          </div>
        </Section>
      );
    case 'custom_html':
      return (
        <Section editorState={sectionEditorState} key={block.id}>
          <EditableHotspot
            active={selectedFieldPath === 'content.html'}
            onInteract={onEditorInteract}
            target={{ blockId: block.id, fieldPath: 'content.html', intent: 'text' }}
          >
            <div dangerouslySetInnerHTML={{ __html: stringValue(block.content.html) || '<div>Custom HTML block</div>' }} />
          </EditableHotspot>
        </Section>
      );
    default:
      return null;
  }
};

const SiteBuilderRenderer = ({
  site,
  blocks,
  mode = 'public',
  selectedBlockId,
  selectedFieldPath,
  onEditorInteract,
  onSubmitLead,
}: SiteBuilderRendererProps) => {
  const sortedBlocks = useMemo(
    () => [...blocks].sort((left, right) => left.sort_order - right.sort_order),
    [blocks],
  );

  return (
    <Surface site={site}>
      {sortedBlocks.map((block) =>
        renderBlock({
          block,
          mode,
          onEditorInteract,
          onSubmitLead,
          selectedBlockId,
          selectedFieldPath,
        }),
      )}
    </Surface>
  );
};

export default SiteBuilderRenderer;
