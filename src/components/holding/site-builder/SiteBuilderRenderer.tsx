import { useId, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PaperClipIcon } from '@heroicons/react/24/outline';
import { getHoldingContentPath, getHoldingLocalePrefix } from '@/utils/holdingPublicPage';
import NotificationService from '@components/shared/NotificationService';
import { BuilderApiError } from '@/services/holdingSiteBuilderService';
import SiteButton from './SiteButton';
import { getButtonHref, readButtonAppearance } from './siteButtonAppearance';
import type { SiteButtonAction } from './siteButtonAppearance';
import { getSiteThemeStyle, hasSitePalette } from './siteTheme';
import './corporateSite.css';
import './siteTheme.css';
import type {
  BuilderCanvasFocusTarget,
  EditorPage,
  EditorSection,
  PublicSite,
  PublicServiceRequestSettings,
  LeadSubmissionPayload,
  PublicNavigationItem,
  SiteBlogArticle,
} from '@/types/holding-site-builder';

interface SiteBuilderRendererProps {
  site: PublicSite;
  page?: EditorPage | null;
  blocks?: EditorSection[];
  navigation?: PublicNavigationItem[];
  mode?: 'public' | 'editor';
  selectedBlockId?: number | null;
  selectedFieldPath?: string | null;
  onEditorInteract?: (target: BuilderCanvasFocusTarget) => void;
  onSubmitLead?: (payload: LeadSubmissionPayload) => Promise<unknown>;
  serviceRequest?: PublicServiceRequestSettings;
  blog?: {
    articles?: SiteBlogArticle[];
    current_article?: SiteBlogArticle | null;
  };
}

const stringValue = (value: unknown): string => (typeof value === 'string' ? value : '');
const arrayValue = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);
const isCorporateSite = (site: PublicSite) => site.theme_config.surface_style === 'corporate';
const normalizePublicPath = (value: unknown): string => {
  const rawValue = stringValue(value).trim();

  if (!rawValue || rawValue === '/') {
    return '/';
  }

  const withLeadingSlash = rawValue.startsWith('/') ? rawValue : `/${rawValue}`;

  return withLeadingSlash.length > 1 && withLeadingSlash.endsWith('/')
    ? withLeadingSlash.slice(0, -1)
    : withLeadingSlash;
};

const getPublicNavigationSearch = (search: string, pathLocale?: string): string => {
  const params = new URLSearchParams(search);
  if (pathLocale) {
    params.set('locale', pathLocale);
    params.delete('lang');
  }
  if (params.get('preview') === 'true') return pathLocale ? `?${params}` : search;
  const publicParams = new URLSearchParams();
  for (const key of ['locale', 'lang']) {
    const value = params.get(key);
    if (value) publicParams.set(key, value);
  }
  const query = publicParams.toString();
  return query ? `?${query}` : '';
};

const buildPublicHref = (slug: unknown, search = ''): string => {
  const path = normalizePublicPath(slug);

  return search ? `${path}${search}` : path;
};

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
      className={`rounded-[22px] outline-none transition ${
        active
          ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-white'
          : 'hover:bg-blue-50/60 hover:ring-2 hover:ring-blue-200 hover:ring-offset-2 hover:ring-offset-white'
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

const SectionShell = ({
  section,
  site,
  mode,
  selected,
  onSelect,
  children,
  anchorId,
}: {
  section: EditorSection;
  site: PublicSite;
  mode: 'public' | 'editor';
  selected?: boolean;
  onSelect?: (target: BuilderCanvasFocusTarget) => void;
  children: ReactNode;
  anchorId?: string;
}) => {
  const tone = stringValue(section.settings.theme) || (section.type === 'hero' ? 'primary' : 'surface');
  const isPrimary = tone === 'primary';
  const corporate = isCorporateSite(site);

  return (
    <section
      id={anchorId}
      className={`holding-section holding-section-${section.type} relative overflow-hidden ${
        isPrimary ? 'bg-slate-950 text-white' : 'bg-white text-slate-950'
      }`}
      style={{
        background:
          section.type === 'hero' && !hasSitePalette(site.theme_config)
            ? `radial-gradient(circle at top left, ${site.theme_config.primary_color}24, transparent 40%), ${
                isPrimary ? '#050816' : site.theme_config.background_color
              }`
            : undefined,
      }}
      onClick={
        mode === 'editor' && onSelect
          ? (event) => {
              event.preventDefault();
              onSelect({ blockId: section.id, pageId: section.page_id ?? undefined, fieldPath: 'content.title', intent: 'block' });
            }
          : undefined
      }
    >
      {mode === 'editor' && (
        <div
          className={`pointer-events-none absolute inset-4 rounded-[32px] border transition ${
            selected
              ? 'border-blue-400 bg-blue-50/10 shadow-[0_28px_60px_-36px_rgba(59,130,246,0.65)]'
              : 'border-transparent'
          }`}
        />
      )}
      <div className="holding-content relative mx-auto w-full px-6 py-20 sm:px-8 lg:px-10" style={corporate && section.type === 'hero' ? undefined : { maxWidth: site.theme_config.container_width ?? '1240px' }}>
        {children}
      </div>
    </section>
  );
};

const SectionHeading = ({
  section,
  selectedFieldPath,
  onEditorInteract,
  invert = false,
}: {
  section: EditorSection;
  selectedFieldPath?: string | null;
  onEditorInteract?: (target: BuilderCanvasFocusTarget) => void;
  invert?: boolean;
}) => {
  const Heading = section.type === 'hero' ? 'h1' : 'h2';
  return (
  <>
    {stringValue(section.content.subtitle) && (
      <EditableHotspot
        active={selectedFieldPath === 'content.subtitle'}
        className="inline-flex"
        onInteract={onEditorInteract}
        target={{ blockId: section.id, pageId: section.page_id ?? undefined, fieldPath: 'content.subtitle', intent: 'text' }}
      >
        <span className={`holding-subtitle inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.34em] ${invert ? 'bg-white/10 text-blue-100' : 'bg-slate-100 text-slate-500'}`}>
          {stringValue(section.content.subtitle)}
        </span>
      </EditableHotspot>
    )}
    {stringValue(section.content.title) && (
      <EditableHotspot
        active={selectedFieldPath === 'content.title'}
        className="mt-4 block"
        onInteract={onEditorInteract}
        target={{ blockId: section.id, pageId: section.page_id ?? undefined, fieldPath: 'content.title', intent: 'text' }}
      >
        <Heading className={`text-4xl font-semibold tracking-tight sm:text-5xl ${invert ? 'text-white' : 'text-slate-950'}`}>
          {stringValue(section.content.title)}
        </Heading>
      </EditableHotspot>
    )}
    {stringValue(section.content.description) && (
      <EditableHotspot
        active={selectedFieldPath === 'content.description'}
        className="mt-5 block max-w-2xl"
        onInteract={onEditorInteract}
        target={{ blockId: section.id, pageId: section.page_id ?? undefined, fieldPath: 'content.description', intent: 'text' }}
      >
        <p className={`holding-description text-lg leading-8 ${invert ? 'text-slate-300' : 'text-slate-600'}`}>
          {stringValue(section.content.description)}
        </p>
      </EditableHotspot>
    )}
  </>
  );
};

const PublicSiteHeader = ({
  site,
  currentPage,
  navigation,
  editor,
}: {
  site: PublicSite;
  currentPage?: EditorPage | null;
  navigation: PublicNavigationItem[];
  editor: boolean;
}) => {
  const { pathname, search } = useLocation();
  const navigationSearch = getPublicNavigationSearch(search, getHoldingLocalePrefix(pathname, site));
  const currentPath = editor ? getHoldingContentPath(currentPage?.slug ?? '/') : getHoldingContentPath(pathname, site);
  const corporate = isCorporateSite(site);
  const currentPageLabel = stringValue(currentPage?.navigation_label) || stringValue(currentPage?.title) || site.title;
  const previewLink = editor ? {
    onClick: (event: MouseEvent<HTMLAnchorElement>) => event.preventDefault(),
    tabIndex: -1,
  } : {};

  return (
    <header className="holding-header sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div
        className="holding-header-inner mx-auto flex w-full flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8"
        style={{ maxWidth: site.theme_config.container_width ?? '1240px' }}
      >
        <Link className="flex min-w-0 items-center gap-3" to={buildPublicHref('/', navigationSearch)} {...previewLink}>
          <span
            className="holding-brand-mark flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 text-lg font-semibold text-white shadow-[0_18px_45px_-32px_rgba(15,23,42,0.45)]"
            data-image={Boolean(site.logo_url)}
            style={site.logo_url ? { backgroundColor: '#ffffff' } : undefined}
          >
            {site.logo_url ? (
              <img alt={site.title} className="h-full w-full object-cover" src={site.logo_url} />
            ) : (
              site.title.trim().charAt(0).toUpperCase() || 'P'
            )}
          </span>
          <span className="min-w-0">
            <span className="holding-brand-domain block truncate text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              {site.domain}
            </span>
            <span className="holding-brand-name block truncate text-lg font-semibold text-slate-950">{site.title}</span>
          </span>
        </Link>

        {navigation.length > 0 && (
          <nav aria-label="Разделы сайта" className="holding-nav flex items-center gap-2 overflow-x-auto pb-1 lg:flex-1 lg:justify-center lg:pb-0">
            {navigation.map((item) => {
              const itemPath = getHoldingContentPath(stringValue(item.slug));
              const isBlogMatch =
                currentPage?.page_type === 'blog_post' &&
                (item.page_type === 'blog_index' || itemPath === '/blog');
              const isActive =
                currentPath === itemPath ||
                (itemPath !== '/' && currentPath.startsWith(`${itemPath}/`)) ||
                isBlogMatch;

              return (
                <Link
                  key={`${item.id}-${item.slug}`}
                  className={`inline-flex flex-shrink-0 items-center rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive ? 'text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                  to={buildPublicHref(item.slug, navigationSearch)}
                  {...previewLink}
                >
                  {stringValue(item.label) || (itemPath === '/' ? 'Главная' : itemPath.slice(1))}
                </Link>
              );
            })}
          </nav>
        )}

        {corporate ? (
          <Link className="holding-header-action holding-site-button holding-site-button--primary shrink-0" to={`${buildPublicHref('/', navigationSearch)}#lead-form`} {...previewLink}>
            Оставить заявку
          </Link>
        ) : <div className="hidden items-center lg:flex">
          <span
            className="holding-page-label inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium text-slate-700"
            style={{ borderColor: 'color-mix(in srgb, var(--holding-primary) 20%, transparent)' }}
          >
            {currentPageLabel}
          </span>
        </div>}
      </div>
    </header>
  );
};

const renderCards = (items: Array<Record<string, unknown>>, colorClass: string) => (
  <div className="holding-cards grid gap-5 md:grid-cols-2 xl:grid-cols-3">
    {items.map((item, index) => (
      <article key={`${item.title ?? item.label ?? index}`} className={`rounded-[30px] border border-slate-200 ${colorClass} p-6 shadow-[0_28px_60px_-48px_rgba(15,23,42,0.45)]`}>
        {stringValue(item.image) && <img alt="" loading="lazy" src={stringValue(item.image)} />}
        {Boolean(item.label) && <div className="holding-card-text text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{String(item.label)}</div>}
        {Boolean(item.title) && <h3 className="mt-3 text-2xl font-semibold text-slate-950">{String(item.title)}</h3>}
        {Boolean(item.value) && <div className="holding-card-text mt-4 text-4xl font-semibold text-slate-950">{String(item.value)}</div>}
        {Boolean(item.description) && <p className="holding-card-text mt-3 text-sm leading-7 text-slate-600">{String(item.description)}</p>}
        {Boolean(item.location) && <p className="holding-card-text mt-4 text-xs font-medium uppercase tracking-[0.24em] text-slate-500">{String(item.location)}</p>}
      </article>
    ))}
  </div>
);

const leadFields = [
  { name: 'name', label: 'Имя', type: 'text', autoComplete: 'name', maxLength: 255 },
  { name: 'phone', label: 'Телефон', type: 'tel', autoComplete: 'tel', maxLength: 64 },
  { name: 'company', label: 'Организация', type: 'text', autoComplete: 'organization', maxLength: 255 },
  { name: 'email', label: 'Электронная почта', type: 'email', autoComplete: 'email', maxLength: 255 },
] as const;

const emptyLeadForm = {
  name: '', company: '', email: '', phone: '', message: '', website: '',
  work_type_id: '', object_address: '', expected_start_date: '',
};
const leadInput = 'w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-white';
const acceptedAttachmentTypes = /\.(pdf|jpe?g|png)$/i;
const attachmentIdentity = (file: File) => JSON.stringify([file.name, file.size, file.lastModified]);

const SectionButton = ({
  action, section, selectedFieldPath, onEditorInteract, href, onClick, disabled, descriptionId, children,
}: {
  action: SiteButtonAction;
  section: EditorSection;
  selectedFieldPath?: string | null;
  onEditorInteract?: (target: BuilderCanvasFocusTarget) => void;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  descriptionId?: string;
  children: ReactNode;
}) => {
  const fieldPath = `style_config.buttons.${action}`;
  const appearance = readButtonAppearance(section.style_config, action);
  const className = action === 'submit' ? 'holding-site-button--submit' : '';
  const variant = action === 'upload' ? 'secondary' : 'primary';

  if (onEditorInteract) {
    return (
      <SiteButton
        appearance={appearance}
        className={className}
        data-selected={selectedFieldPath === fieldPath || undefined}
        onClick={event => {
          event.stopPropagation();
          onEditorInteract({ blockId: section.id, pageId: section.page_id ?? undefined, fieldPath, intent: 'button' });
        }}
        variant={variant}
      >
        {children}
      </SiteButton>
    );
  }

  if (action === 'link') return href ? <SiteButton appearance={appearance} href={href}>{children}</SiteButton> : null;

  return (
    <SiteButton
      appearance={appearance}
      aria-describedby={descriptionId}
      className={className}
      disabled={disabled}
      onClick={onClick}
      type={action === 'submit' ? 'submit' : 'button'}
      variant={variant}
    >
      {children}
    </SiteButton>
  );
};

const LeadFormSection = ({
  section,
  mode,
  selectedFieldPath,
  onEditorInteract,
  onSubmitLead,
  serviceRequest,
  locale,
}: {
  section: EditorSection;
  mode: 'public' | 'editor';
  selectedFieldPath?: string | null;
  onEditorInteract?: (target: BuilderCanvasFocusTarget) => void;
  onSubmitLead?: (payload: LeadSubmissionPayload) => Promise<unknown>;
  serviceRequest?: PublicServiceRequestSettings;
  locale?: string;
}) => {
  const [form, setForm] = useState(emptyLeadForm);
  const [sending, setSending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [attachmentError, setAttachmentError] = useState('');
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const attempt = useRef<string | null>(null);
  const inFlight = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const attachmentHintId = useId();
  const enhanced = serviceRequest?.enabled === true;
  const showServiceFields = enhanced || mode === 'editor';
  const services = serviceRequest?.services ?? [];
  const unavailable = enhanced && services.length === 0;

  const change = (field: keyof typeof emptyLeadForm, value: string) => {
    attempt.current = null;
    setSubmissionMessage('');
    setErrorMessage('');
    setForm(current => ({ ...current, [field]: value }));
  };

  const updateAttachments = (files: File[]) => {
    attempt.current = null;
    setSubmissionMessage('');
    setErrorMessage('');
    setAttachmentError('');
    setSelectedFiles(files);
  };

  const pickFiles = (input: HTMLInputElement) => {
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (!files.length) return;

    const uniqueFiles = new Map(selectedFiles.map(file => [attachmentIdentity(file), file]));
    for (const file of files) uniqueFiles.set(attachmentIdentity(file), file);
    const next = [...uniqueFiles.values()];
    if (next.length > 5 || files.some(file => file.size < 1 || file.size > 10 * 1024 * 1024)) {
      setAttachmentError('Можно приложить до пяти непустых файлов, не более 10 МБ каждый.');
      return;
    }
    if (files.some(file => !acceptedAttachmentTypes.test(file.name))) {
      setAttachmentError('Выберите файлы в формате PDF, JPG или PNG.');
      return;
    }
    updateAttachments(next);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!onSubmitLead || mode === 'editor') {
      NotificationService.show({ type: 'info', title: 'Превью', message: 'Отправка заявок в предпросмотре отключена.' });
      return;
    }
    if (unavailable || inFlight.current) return;
    inFlight.current = true;
    setSending(true);
    setSubmissionMessage('');
    setErrorMessage('');
    try {
      const { work_type_id, object_address, expected_start_date, ...contact } = form;
      if (enhanced) attempt.current ??= window.crypto.randomUUID();
      await onSubmitLead({
        ...contact,
        block_key: section.key,
        section_key: section.key,
        holding_site_page_id: section.page_id ?? undefined,
        locale_code: locale || 'ru',
        source_page: 'holding-site',
        source_url: window.location.href,
        ...(enhanced ? {
          submission_key: attempt.current ?? undefined,
          work_type_id: Number(work_type_id),
          object_address,
          expected_start_date: expected_start_date || undefined,
          attachments: selectedFiles,
        } : { form_payload: contact }),
      });
      setSubmissionMessage(stringValue(section.content.success_message) || 'Заявка отправлена.');
      setForm(emptyLeadForm);
      setSelectedFiles([]);
      setAttachmentError('');
      attempt.current = null;
    } catch (error) {
      const errors = error instanceof BuilderApiError && error.errors && typeof error.errors === 'object'
        ? Object.values(error.errors).flat().filter((value): value is string => typeof value === 'string')
        : [];
      setErrorMessage(errors[0] || (error instanceof Error ? error.message : 'Не удалось отправить заявку.'));
    } finally {
      setSending(false);
      inFlight.current = false;
    }
  };

  return (
    <div className="holding-lead-panel grid gap-8 rounded-[36px] bg-slate-950 px-6 py-8 text-white md:grid-cols-[1.1fr_0.9fr] md:px-10">
      <div>
        <SectionHeading section={section} selectedFieldPath={selectedFieldPath} onEditorInteract={onEditorInteract} invert />
      </div>
      <form className="holding-lead-form min-w-0 grid gap-4" onSubmit={submit}>
        <fieldset className={`min-w-0 grid gap-4 ${showServiceFields ? 'holding-lead-fields' : ''}`} disabled={sending || unavailable}>
          {showServiceFields && (
            <label className="holding-lead-field--wide grid gap-1 text-sm">
              <span>Вид работ <span aria-hidden="true">*</span></span>
              <select className={leadInput} disabled={mode === 'editor'} required value={form.work_type_id} onChange={event => change('work_type_id', event.target.value)}>
                <option value="">Выберите услугу</option>
                {services.map(service => <option key={service.id} value={service.id}>{service.name}</option>)}
              </select>
            </label>
          )}
          {leadFields.map(field => (
            <label key={field.name} className="min-w-0 grid gap-1 text-sm">
              <span>{field.label}{showServiceFields && (field.name === 'name' || field.name === 'phone') && <span aria-hidden="true"> *</span>}</span>
              <input className={leadInput} type={field.type} autoComplete={field.autoComplete} maxLength={field.maxLength} readOnly={mode === 'editor'}
                required={enhanced && (field.name === 'name' || field.name === 'phone')} value={form[field.name]}
                onChange={event => change(field.name, event.target.value)} />
            </label>
          ))}
          {showServiceFields && (
            <div className="holding-lead-field--wide grid gap-4 sm:grid-cols-[1.2fr_1fr]">
              <label className="min-w-0 grid gap-1 text-sm"><span>Адрес объекта <span aria-hidden="true">*</span></span>
                <input className={leadInput} autoComplete="off" readOnly={mode === 'editor'} required maxLength={500} value={form.object_address} onChange={event => change('object_address', event.target.value)} />
              </label>
              <label className="min-w-0 grid gap-1 text-sm">Желаемая дата начала
                <input className={leadInput} type="date" readOnly={mode === 'editor'} value={form.expected_start_date} onChange={event => change('expected_start_date', event.target.value)} />
              </label>
            </div>
          )}
          <label className="holding-lead-field--wide grid gap-1 text-sm">
            {showServiceFields ? <span>Описание работ <span aria-hidden="true">*</span></span> : 'Сообщение'}
            <textarea className={leadInput + ' min-h-28'} readOnly={mode === 'editor'} required={enhanced} maxLength={enhanced ? 4000 : 5000}
              value={form.message} onChange={event => change('message', event.target.value)} />
          </label>
          {showServiceFields && (
            <fieldset className="holding-lead-field--wide min-w-0 grid gap-2 rounded-md border border-white/20 px-3 pb-3 pt-2">
              <legend className="px-1 text-sm">Материалы к заявке</legend>
              {mode === 'public' && <input hidden ref={fileInput} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={event => pickFiles(event.currentTarget)} />}
              <SectionButton
                action="upload"
                descriptionId={attachmentHintId}
                onClick={() => fileInput.current?.click()}
                onEditorInteract={onEditorInteract}
                section={section}
                selectedFieldPath={selectedFieldPath}
              >
                <PaperClipIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
                Прикрепить файлы
              </SectionButton>
              <p className="holding-attachment-hint text-xs text-slate-300" id={attachmentHintId}>PDF, JPG или PNG, до пяти файлов по 10 МБ.</p>
              {selectedFiles.length > 0 && (
                <ul aria-label="Прикреплённые файлы" className="grid gap-1">
                  {selectedFiles.map(file => (
                    <li className="flex items-center justify-between gap-3 border-t border-white/15" key={attachmentIdentity(file)}>
                      <span className="min-w-0 break-all text-sm">{file.name}</span>
                      <button
                        aria-label={`Убрать ${file.name}`}
                        className="min-h-11 shrink-0 px-2 text-xs underline focus-visible:ring-2 focus-visible:ring-white"
                        onClick={() => updateAttachments(selectedFiles.filter(item => item !== file))}
                        type="button"
                      >
                        Убрать
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {attachmentError && <p className="text-sm text-rose-200" role="alert">{attachmentError}</p>}
            </fieldset>
          )}
          <input className="hidden" tabIndex={-1} autoComplete="off" value={form.website} onChange={event => change('website', event.target.value)} />
        </fieldset>
        {unavailable && <p className="text-sm text-amber-200" role="status">Приём заявок на услуги временно недоступен.</p>}
        {errorMessage && <p className="text-sm text-rose-200" role="alert">{errorMessage}</p>}
        {submissionMessage && <p className="text-sm text-emerald-200" role="status">{submissionMessage}</p>}
        <SectionButton
          action="submit"
          disabled={sending || unavailable}
          onEditorInteract={onEditorInteract}
          section={section}
          selectedFieldPath={selectedFieldPath}
        >
          {sending ? 'Отправка…' : stringValue(section.content.submit_label) || 'Отправить заявку'}
        </SectionButton>
      </form>
    </div>
  );
};

const BlogIndexPage = ({ articles = [], site, page, mode }: { articles?: SiteBlogArticle[]; site: PublicSite; page: EditorPage; mode: 'public' | 'editor' }) => {
  const { pathname, search } = useLocation();
  const navigationSearch = getPublicNavigationSearch(search, getHoldingLocalePrefix(pathname, site));
  return (
  <section className="holding-blog mx-auto w-full max-w-[1240px] px-6 py-24 sm:px-8 lg:px-10">
    <div className="mb-12 max-w-2xl">
      <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">{page.title}</h1>
      {page.description && <p className="holding-description mt-5 text-lg leading-8 text-slate-600">{page.description}</p>}
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      {articles.map((article) => (
        <article key={article.id} className="holding-blog-card rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_28px_60px_-48px_rgba(15,23,42,0.45)]">
          {article.featured_image && <img alt="" className="mb-6" loading="lazy" src={article.featured_image} />}
          <div className="holding-card-text text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            {article.category?.name ?? 'Практика'}
          </div>
          <h2 className="mt-4 text-3xl font-semibold text-slate-950">
            {mode === 'editor' ? article.title : (
              <Link className="hover:underline" to={buildPublicHref(`${normalizePublicPath(page.slug)}/${encodeURIComponent(article.slug)}`, navigationSearch)}>
                {article.title}
              </Link>
            )}
          </h2>
          {article.excerpt && <p className="holding-description mt-4 text-base leading-8 text-slate-600">{article.excerpt}</p>}
          <div className="holding-card-text mt-6 text-sm text-slate-500">
            {article.published_at ? new Date(article.published_at).toLocaleDateString('ru-RU') : 'Черновик'}
          </div>
        </article>
      ))}
    </div>
  </section>
  );
};

const BlogArticlePage = ({ article }: { article: SiteBlogArticle }) => (
  <article className="holding-blog mx-auto w-full max-w-[980px] px-6 py-24 sm:px-8">
    <div className="holding-blog-card rounded-[36px] bg-white p-8 shadow-[0_28px_60px_-48px_rgba(15,23,42,0.45)] sm:p-12">
      <div className="holding-card-text text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
        {article.category?.name ?? 'Блог'}
      </div>
      <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{article.title}</h1>
      {article.excerpt && <p className="holding-description mt-6 text-lg leading-8 text-slate-600">{article.excerpt}</p>}
      {article.featured_image && <img alt="" className="mt-8" src={article.featured_image} />}
      <div className="holding-card-text mt-8 text-sm text-slate-500">
        {article.published_at ? new Date(article.published_at).toLocaleDateString('ru-RU') : 'Черновик'}
      </div>
      {article.content && <div className="holding-article-body prose prose-slate mt-10 max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />}
    </div>
  </article>
);

const renderSectionContent = (
  section: EditorSection,
  site: PublicSite,
  mode: 'public' | 'editor',
  selectedBlockId?: number | null,
  selectedFieldPath?: string | null,
  onEditorInteract?: (target: BuilderCanvasFocusTarget) => void,
  onSubmitLead?: (payload: LeadSubmissionPayload) => Promise<unknown>,
  serviceRequest?: PublicServiceRequestSettings,
  anchorId?: string,
) => {
  const selected = selectedBlockId === section.id;
  const image = stringValue(section.content.background_image || section.content.image);
  const items = arrayValue<Record<string, unknown>>(section.content.items);
  const services = arrayValue<Record<string, unknown>>(section.content.services);
  const projects = arrayValue<Record<string, unknown>>(section.content.projects);
  const members = arrayValue<Record<string, unknown>>(section.content.members);
  const testimonials = arrayValue<Record<string, unknown>>(section.content.items);
  const gallery = arrayValue<Record<string, unknown>>(section.content.images);
  const faq = arrayValue<Record<string, unknown>>(section.content.items);
  const corporate = isCorporateSite(site);
  const buttonHref = getButtonHref(section.content.button_url || (section.type === 'hero' ? '#' : undefined));
  const buttonLabel = stringValue(section.content.button_text).trim();

  if (section.type === 'button' && mode === 'public' && (!buttonHref || !buttonLabel)) return null;

  const select = (fieldPath: string, intent: BuilderCanvasFocusTarget['intent']) =>
    onEditorInteract?.({ blockId: section.id, pageId: section.page_id ?? undefined, fieldPath, intent });

  return (
    <SectionShell section={section} site={site} mode={mode} selected={selected} onSelect={onEditorInteract} anchorId={anchorId}>
      {section.type === 'hero' && (
        <div className="holding-hero grid items-center gap-12 lg:grid-cols-[0.94fr_1.06fr]">
          <div className="holding-hero-copy">
            <SectionHeading section={section} selectedFieldPath={selectedFieldPath} onEditorInteract={onEditorInteract} invert />
            <div className="mt-8">
              <SectionButton action="link" href={buttonHref} onEditorInteract={onEditorInteract} section={section} selectedFieldPath={selectedFieldPath}>
                {buttonLabel || 'Перейти'}
              </SectionButton>
            </div>
          </div>
          <div className="holding-hero-media">
          <EditableHotspot className="h-full" active={selectedFieldPath === 'content.background_image'} onInteract={onEditorInteract} target={{ blockId: section.id, pageId: section.page_id ?? undefined, fieldPath: 'content.background_image', intent: 'image' }}>
            <div className="holding-hero-frame relative overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,#0f172a,#334155)] p-8 shadow-[0_36px_90px_-48px_rgba(15,23,42,0.8)]">
              {image ? <img alt="" className="h-[360px] w-full rounded-[26px] object-cover" src={image} /> : <div className="flex h-[360px] items-center justify-center rounded-[26px] bg-white/5 text-8xl text-white/70">P</div>}
            </div>
          </EditableHotspot>
          </div>
        </div>
      )}

      {section.type === 'button' && (
        <SectionButton action="link" href={buttonHref} onEditorInteract={onEditorInteract} section={section} selectedFieldPath={selectedFieldPath}>
          {buttonLabel || 'Кнопка'}
        </SectionButton>
      )}

      {section.type === 'stats' && (
        <div>
          <SectionHeading section={section} selectedFieldPath={selectedFieldPath} onEditorInteract={onEditorInteract} />
          <div className="mt-10">{renderCards(items, 'bg-slate-50')}</div>
        </div>
      )}

      {section.type === 'about' && (
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <EditableHotspot active={selectedFieldPath === 'content.image'} onInteract={onEditorInteract} target={{ blockId: section.id, pageId: section.page_id ?? undefined, fieldPath: 'content.image', intent: 'image' }}>
            <div className="holding-about-media holding-theme-surface overflow-hidden rounded-[36px] bg-[linear-gradient(135deg,#dbeafe,#eff6ff)] p-6 shadow-[0_28px_60px_-48px_rgba(15,23,42,0.45)]">
              {image ? <img alt="" loading="lazy" className="h-[360px] w-full rounded-[28px] object-cover" src={image} /> : <div className="flex h-[360px] items-center justify-center rounded-[28px] bg-slate-200 text-7xl text-slate-500">P</div>}
            </div>
          </EditableHotspot>
          <div>
            <SectionHeading section={section} selectedFieldPath={selectedFieldPath} onEditorInteract={onEditorInteract} />
          </div>
        </div>
      )}

      {section.type === 'services' && (
        <div>
          <SectionHeading section={section} selectedFieldPath={selectedFieldPath} onEditorInteract={onEditorInteract} />
          <div className="mt-10">{renderCards(services, 'bg-white')}</div>
        </div>
      )}

      {section.type === 'projects' && (
        <div>
          <SectionHeading section={section} selectedFieldPath={selectedFieldPath} onEditorInteract={onEditorInteract} />
          <div className="mt-10">{renderCards(projects, 'bg-slate-50')}</div>
        </div>
      )}

      {section.type === 'team' && (
        <div>
          <SectionHeading section={section} selectedFieldPath={selectedFieldPath} onEditorInteract={onEditorInteract} />
          <div className="mt-10">{renderCards(members, 'bg-white')}</div>
        </div>
      )}

      {section.type === 'testimonials' && (
        <div>
          <SectionHeading section={section} selectedFieldPath={selectedFieldPath} onEditorInteract={onEditorInteract} />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {testimonials.map((item, index) => (
              <article key={`${item.author ?? index}`} className="holding-theme-surface rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_28px_60px_-48px_rgba(15,23,42,0.45)]">
                <p className="holding-card-text text-base leading-8 text-slate-700">“{String(item.quote ?? '')}”</p>
                <div className="holding-card-text mt-6 text-sm font-semibold text-slate-950">{String(item.author ?? '')}</div>
                <div className="holding-card-text text-sm text-slate-500">{String(item.role ?? '')}</div>
              </article>
            ))}
          </div>
        </div>
      )}

      {section.type === 'gallery' && (
        <div>
          <SectionHeading section={section} selectedFieldPath={selectedFieldPath} onEditorInteract={onEditorInteract} />
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {gallery.map((item, index) => (
              <EditableHotspot key={`${item.url ?? index}`} onInteract={onEditorInteract} target={{ blockId: section.id, pageId: section.page_id ?? undefined, fieldPath: 'content.images', intent: 'collection' }}>
                <div className="holding-theme-surface overflow-hidden rounded-[30px] bg-slate-100 shadow-[0_28px_60px_-48px_rgba(15,23,42,0.45)]">
                  {item.url ? <img alt={String(item.alt ?? '')} className="h-64 w-full object-cover" src={String(item.url)} /> : <div className="flex h-64 items-center justify-center text-6xl text-slate-400">P</div>}
                </div>
              </EditableHotspot>
            ))}
          </div>
        </div>
      )}

      {section.type === 'faq' && (
        <div>
          <SectionHeading section={section} selectedFieldPath={selectedFieldPath} onEditorInteract={onEditorInteract} />
          <div className="mt-10 grid gap-4">
            {faq.map((item, index) => (
              <EditableHotspot key={`${item.question ?? index}`} onInteract={onEditorInteract} target={{ blockId: section.id, pageId: section.page_id ?? undefined, fieldPath: 'content.items', intent: 'collection' }}>
                <div className="holding-faq-item rounded-[28px] border border-slate-200 bg-white px-6 py-5 shadow-[0_20px_50px_-42px_rgba(15,23,42,0.45)]">
                  <div className="holding-card-text text-lg font-semibold text-slate-950">{String(item.question ?? '')}</div>
                  <div className="holding-card-text mt-3 text-sm leading-7 text-slate-600">{String(item.answer ?? '')}</div>
                </div>
              </EditableHotspot>
            ))}
          </div>
        </div>
      )}

      {section.type === 'contacts' && (
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <SectionHeading section={section} selectedFieldPath={selectedFieldPath} onEditorInteract={onEditorInteract} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ['Телефон', 'content.phone', stringValue(section.content.phone)],
              ['Email', 'content.email', stringValue(section.content.email)],
              ['Адрес', 'content.address', stringValue(section.content.address)],
              ['Часы', 'content.working_hours', stringValue(section.content.working_hours)],
            ].filter(([, , value]) => !corporate || mode === 'editor' || value).map(([label, path, value]) => (
              <EditableHotspot key={label} active={selectedFieldPath === path} onInteract={() => select(path, 'text')} target={{ blockId: section.id, pageId: section.page_id ?? undefined, fieldPath: path, intent: 'text' }}>
                <div className="holding-contact-item rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-[0_20px_50px_-42px_rgba(15,23,42,0.45)]">
                  <div className="holding-card-text text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{label}</div>
                  <div className="holding-card-text mt-4 text-lg font-semibold text-slate-950">{value || '—'}</div>
                </div>
              </EditableHotspot>
            ))}
          </div>
        </div>
      )}

      {section.type === 'lead_form' && (
        <LeadFormSection
          mode={mode}
          onEditorInteract={onEditorInteract}
          onSubmitLead={onSubmitLead}
          serviceRequest={serviceRequest}
          locale={site.current_locale}
          section={section}
          selectedFieldPath={selectedFieldPath}
        />
      )}

      {section.type === 'custom_html' && (
        <EditableHotspot active={selectedFieldPath === 'content.html'} onInteract={onEditorInteract} target={{ blockId: section.id, pageId: section.page_id ?? undefined, fieldPath: 'content.html', intent: 'text' }}>
          <div className="holding-theme-surface rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_28px_60px_-48px_rgba(15,23,42,0.45)]" dangerouslySetInnerHTML={{ __html: stringValue(section.content.html) || '<p>Custom HTML</p>' }} />
        </EditableHotspot>
      )}
    </SectionShell>
  );
};

const SiteBuilderRenderer = ({
  site,
  page,
  blocks,
  navigation = [],
  mode = 'public',
  selectedBlockId,
  selectedFieldPath,
  onEditorInteract,
  onSubmitLead,
  serviceRequest,
  blog,
}: SiteBuilderRendererProps) => {
  const sections = (page?.sections ?? blocks ?? []).filter(section => section.is_active !== false);
  const primaryLeadSection = sections.find(section => section.type === 'lead_form');
  const currentPage = page;
  const { pathname, search } = useLocation();
  const navigationSearch = getPublicNavigationSearch(search, getHoldingLocalePrefix(pathname, site));
  const background = mode === 'public' ? 'bg-[linear-gradient(180deg,#f7f9fc_0%,#eef2ff_100%)]' : 'bg-slate-100';
  const corporate = isCorporateSite(site);
  const navigationItems =
    navigation.length > 0
      ? navigation
      : currentPage
        ? [
            {
              id: currentPage.id,
              slug: currentPage.slug,
              label: stringValue(currentPage.navigation_label) || currentPage.title,
              page_type: currentPage.page_type,
              is_home: currentPage.is_home,
            },
          ]
        : [];

  const palette = hasSitePalette(site.theme_config);
  return (
    <div
      className={`holding-site ${corporate ? 'holding-corporate' : background} ${palette ? 'holding-palette' : ''}`}
      style={{
        ...getSiteThemeStyle(site.theme_config),
        color: palette ? undefined : site.theme_config.text_color,
        fontFamily: corporate ? undefined : site.theme_config.font_family,
      }}
    >
      <PublicSiteHeader currentPage={currentPage} editor={mode === 'editor'} navigation={navigationItems} site={site} />

      <main>
      {currentPage?.page_type === 'blog_post' && blog?.current_article ? (
        <BlogArticlePage article={blog.current_article} />
      ) : currentPage?.page_type === 'blog_index' ? (
        <BlogIndexPage articles={blog?.articles} mode={mode} page={currentPage} site={site} />
      ) : (
        <div className={mode === 'editor' ? 'pb-16' : ''}>
          {sections.map((section) =>
            renderSectionContent(
              section,
              site,
              mode,
              selectedBlockId,
              selectedFieldPath,
              onEditorInteract,
              onSubmitLead,
              serviceRequest,
              section === primaryLeadSection ? 'lead-form' : undefined,
            ),
          )}
        </div>
      )}
      </main>
      {corporate && mode === 'public' && (
        <footer className="holding-footer">
          <div className="mx-auto grid gap-6 px-6 py-9 sm:px-8 md:grid-cols-[1fr_1fr] lg:px-10" style={{ maxWidth: site.theme_config.container_width ?? '1240px' }}>
            <div className="max-w-sm">
              <div className="text-lg font-semibold">{site.title}</div>
              {site.description && <p className="mt-2 text-sm leading-6 opacity-90">{site.description}</p>}
            </div>
            {navigation.length > 1 && (
              <nav aria-label="Разделы в подвале" className="grid grid-cols-2 content-start gap-x-5 gap-y-3 text-sm">
                {navigation.filter(item => !item.is_home).map(item => (
                  <Link className="w-fit underline-offset-4 hover:underline" key={item.id} to={buildPublicHref(item.slug, navigationSearch)}>{item.label}</Link>
                ))}
              </nav>
            )}
          </div>
        </footer>
      )}
    </div>
  );
};

export default SiteBuilderRenderer;
