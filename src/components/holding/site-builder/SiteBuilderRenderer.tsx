import { useState } from 'react';
import type { FormEvent, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import NotificationService from '@components/shared/NotificationService';
import type {
  BuilderCanvasFocusTarget,
  EditorPage,
  EditorSection,
  EditorSite,
  LeadSubmissionPayload,
  PublicNavigationItem,
  SiteBlogArticle,
} from '@/types/holding-site-builder';

interface SiteBuilderRendererProps {
  site: EditorSite;
  page?: EditorPage | null;
  blocks?: EditorSection[];
  navigation?: PublicNavigationItem[];
  mode?: 'public' | 'editor';
  selectedBlockId?: number | null;
  selectedFieldPath?: string | null;
  onEditorInteract?: (target: BuilderCanvasFocusTarget) => void;
  onSubmitLead?: (payload: LeadSubmissionPayload) => Promise<unknown>;
  blog?: {
    articles?: SiteBlogArticle[];
    current_article?: SiteBlogArticle | null;
  };
}

const stringValue = (value: unknown): string => (typeof value === 'string' ? value : '');
const arrayValue = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);
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

const getPreviewSearch = (): string => {
  if (typeof window === 'undefined') {
    return '';
  }

  const params = new URLSearchParams(window.location.search);

  return params.get('preview') === 'true' ? window.location.search : '';
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
}: {
  section: EditorSection;
  site: EditorSite;
  mode: 'public' | 'editor';
  selected?: boolean;
  onSelect?: (target: BuilderCanvasFocusTarget) => void;
  children: ReactNode;
}) => {
  const tone = stringValue(section.settings.theme) || (section.type === 'hero' ? 'primary' : 'surface');
  const isPrimary = tone === 'primary';

  return (
    <section
      className={`relative overflow-hidden ${
        isPrimary ? 'bg-slate-950 text-white' : 'bg-white text-slate-950'
      }`}
      style={{
        background:
          section.type === 'hero'
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
      <div className="relative mx-auto w-full px-6 py-20 sm:px-8 lg:px-10" style={{ maxWidth: site.theme_config.container_width ?? '1240px' }}>
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
}) => (
  <>
    {stringValue(section.content.subtitle) && (
      <EditableHotspot
        active={selectedFieldPath === 'content.subtitle'}
        className="inline-flex"
        onInteract={onEditorInteract}
        target={{ blockId: section.id, pageId: section.page_id ?? undefined, fieldPath: 'content.subtitle', intent: 'text' }}
      >
        <span className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.34em] ${invert ? 'bg-white/10 text-blue-100' : 'bg-slate-100 text-slate-500'}`}>
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
        <h2 className={`text-4xl font-semibold tracking-tight sm:text-5xl ${invert ? 'text-white' : 'text-slate-950'}`}>
          {stringValue(section.content.title)}
        </h2>
      </EditableHotspot>
    )}
    {stringValue(section.content.description) && (
      <EditableHotspot
        active={selectedFieldPath === 'content.description'}
        className="mt-5 block max-w-2xl"
        onInteract={onEditorInteract}
        target={{ blockId: section.id, pageId: section.page_id ?? undefined, fieldPath: 'content.description', intent: 'text' }}
      >
        <p className={`text-lg leading-8 ${invert ? 'text-slate-300' : 'text-slate-600'}`}>
          {stringValue(section.content.description)}
        </p>
      </EditableHotspot>
    )}
  </>
);

const PublicSiteHeader = ({
  site,
  currentPage,
  navigation,
}: {
  site: EditorSite;
  currentPage?: EditorPage | null;
  navigation: PublicNavigationItem[];
}) => {
  const previewSearch = getPreviewSearch();
  const currentPath =
    typeof window === 'undefined'
      ? normalizePublicPath(currentPage?.slug ?? '/')
      : normalizePublicPath(window.location.pathname);
  const currentPageLabel = stringValue(currentPage?.navigation_label) || stringValue(currentPage?.title) || site.title;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div
        className="mx-auto flex w-full flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8"
        style={{ maxWidth: site.theme_config.container_width ?? '1240px' }}
      >
        <Link className="flex min-w-0 items-center gap-3" to={buildPublicHref('/', previewSearch)}>
          <span
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 text-lg font-semibold text-white shadow-[0_18px_45px_-32px_rgba(15,23,42,0.45)]"
            style={site.logo_url ? { backgroundColor: '#ffffff' } : { backgroundColor: site.theme_config.primary_color }}
          >
            {site.logo_url ? (
              <img alt={site.title} className="h-full w-full object-cover" src={site.logo_url} />
            ) : (
              site.title.trim().charAt(0).toUpperCase() || 'P'
            )}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              {site.domain}
            </span>
            <span className="block truncate text-lg font-semibold text-slate-950">{site.title}</span>
          </span>
        </Link>

        {navigation.length > 0 && (
          <nav className="flex items-center gap-2 overflow-x-auto pb-1 lg:flex-1 lg:justify-center lg:pb-0">
            {navigation.map((item) => {
              const itemPath = normalizePublicPath(item.slug);
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
                    isActive ? 'text-white shadow-[0_18px_45px_-32px_rgba(37,99,235,0.6)]' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                  style={isActive ? { backgroundColor: site.theme_config.primary_color } : undefined}
                  to={buildPublicHref(item.slug, previewSearch)}
                >
                  {stringValue(item.label) || (itemPath === '/' ? 'Главная' : itemPath.slice(1))}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="hidden items-center lg:flex">
          <span
            className="inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium text-slate-700"
            style={{ borderColor: `${site.theme_config.primary_color}33` }}
          >
            {currentPageLabel}
          </span>
        </div>
      </div>
    </header>
  );
};

const renderCards = (items: Array<Record<string, unknown>>, colorClass: string) => (
  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
    {items.map((item, index) => (
      <article key={`${item.title ?? item.label ?? index}`} className={`rounded-[30px] border border-slate-200 ${colorClass} p-6 shadow-[0_28px_60px_-48px_rgba(15,23,42,0.45)]`}>
        {Boolean(item.label) && <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{String(item.label)}</div>}
        {Boolean(item.title) && <h3 className="mt-3 text-2xl font-semibold text-slate-950">{String(item.title)}</h3>}
        {Boolean(item.value) && <div className="mt-4 text-4xl font-semibold text-slate-950">{String(item.value)}</div>}
        {Boolean(item.description) && <p className="mt-3 text-sm leading-7 text-slate-600">{String(item.description)}</p>}
        {Boolean(item.location) && <p className="mt-4 text-xs font-medium uppercase tracking-[0.24em] text-slate-500">{String(item.location)}</p>}
      </article>
    ))}
  </div>
);

const LeadFormSection = ({
  section,
  mode,
  selectedFieldPath,
  onEditorInteract,
  onSubmitLead,
}: {
  section: EditorSection;
  mode: 'public' | 'editor';
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

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!onSubmitLead || mode === 'editor') {
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
        block_key: section.key,
        section_key: section.key,
        holding_site_page_id: section.page_id ?? undefined,
        locale_code: 'ru',
        source_page: 'holding-site',
        source_url: window.location.href,
        form_payload: form,
      });

      NotificationService.show({
        type: 'success',
        title: 'Заявка',
        message: stringValue(section.content.success_message) || 'Заявка отправлена.',
      });
      setForm({ name: '', company: '', email: '', phone: '', message: '', website: '' });
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
    <div className="grid gap-8 rounded-[36px] bg-slate-950 px-6 py-8 text-white md:grid-cols-[1.1fr_0.9fr] md:px-10">
      <div>
        <SectionHeading section={section} selectedFieldPath={selectedFieldPath} onEditorInteract={onEditorInteract} invert />
      </div>
      <form className="grid gap-4" onSubmit={submit}>
        {['name', 'company', 'email', 'phone'].map((field) => (
          <input
            key={field}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
            placeholder={field}
            readOnly={mode === 'editor'}
            value={form[field as keyof typeof form]}
            onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
          />
        ))}
        <textarea
          className="min-h-28 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
          placeholder="message"
          readOnly={mode === 'editor'}
          value={form.message}
          onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
        />
        <input className="hidden" tabIndex={-1} value={form.website} onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))} />
        <EditableHotspot
          active={selectedFieldPath === 'content.submit_label'}
          className="inline-flex w-fit"
          onInteract={onEditorInteract}
          target={{ blockId: section.id, pageId: section.page_id ?? undefined, fieldPath: 'content.submit_label', intent: 'button' }}
        >
          <button className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 disabled:opacity-60" disabled={sending} type="submit">
            {stringValue(section.content.submit_label) || 'Отправить заявку'}
          </button>
        </EditableHotspot>
      </form>
    </div>
  );
};

const BlogIndexPage = ({ articles = [] }: { articles?: SiteBlogArticle[] }) => (
  <section className="mx-auto w-full max-w-[1240px] px-6 py-24 sm:px-8 lg:px-10">
    <div className="grid gap-6 lg:grid-cols-2">
      {articles.map((article) => (
        <article key={article.id} className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_28px_60px_-48px_rgba(15,23,42,0.45)]">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            {article.category?.name ?? 'Блог'}
          </div>
          <h2 className="mt-4 text-3xl font-semibold text-slate-950">{article.title}</h2>
          {article.excerpt && <p className="mt-4 text-base leading-8 text-slate-600">{article.excerpt}</p>}
          <div className="mt-6 text-sm text-slate-500">
            {article.published_at ? new Date(article.published_at).toLocaleDateString('ru-RU') : 'Черновик'}
          </div>
        </article>
      ))}
    </div>
  </section>
);

const BlogArticlePage = ({ article }: { article: SiteBlogArticle }) => (
  <article className="mx-auto w-full max-w-[980px] px-6 py-24 sm:px-8">
    <div className="rounded-[36px] bg-white p-8 shadow-[0_28px_60px_-48px_rgba(15,23,42,0.45)] sm:p-12">
      <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
        {article.category?.name ?? 'Блог'}
      </div>
      <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{article.title}</h1>
      {article.excerpt && <p className="mt-6 text-lg leading-8 text-slate-600">{article.excerpt}</p>}
      <div className="mt-8 text-sm text-slate-500">
        {article.published_at ? new Date(article.published_at).toLocaleDateString('ru-RU') : 'Черновик'}
      </div>
      {article.content && <div className="prose prose-slate mt-10 max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />}
    </div>
  </article>
);

const renderSectionContent = (
  section: EditorSection,
  site: EditorSite,
  mode: 'public' | 'editor',
  selectedBlockId?: number | null,
  selectedFieldPath?: string | null,
  onEditorInteract?: (target: BuilderCanvasFocusTarget) => void,
  onSubmitLead?: (payload: LeadSubmissionPayload) => Promise<unknown>,
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

  const select = (fieldPath: string, intent: BuilderCanvasFocusTarget['intent']) =>
    onEditorInteract?.({ blockId: section.id, pageId: section.page_id ?? undefined, fieldPath, intent });

  return (
    <SectionShell section={section} site={site} mode={mode} selected={selected} onSelect={onEditorInteract}>
      {section.type === 'hero' && (
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <SectionHeading section={section} selectedFieldPath={selectedFieldPath} onEditorInteract={onEditorInteract} invert />
            <div className="mt-8">
              <EditableHotspot active={selectedFieldPath === 'content.button_text'} onInteract={onEditorInteract} target={{ blockId: section.id, pageId: section.page_id ?? undefined, fieldPath: 'content.button_text', intent: 'button' }}>
                <a className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5" href={stringValue(section.content.button_url) || '#'}>
                  {stringValue(section.content.button_text) || 'Перейти'}
                </a>
              </EditableHotspot>
            </div>
          </div>
          <EditableHotspot active={selectedFieldPath === 'content.background_image'} onInteract={onEditorInteract} target={{ blockId: section.id, pageId: section.page_id ?? undefined, fieldPath: 'content.background_image', intent: 'image' }}>
            <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,#0f172a,#334155)] p-8 shadow-[0_36px_90px_-48px_rgba(15,23,42,0.8)]">
              {image ? <img alt="" className="h-[360px] w-full rounded-[26px] object-cover" src={image} /> : <div className="flex h-[360px] items-center justify-center rounded-[26px] bg-white/5 text-8xl text-white/70">P</div>}
            </div>
          </EditableHotspot>
        </div>
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
            <div className="overflow-hidden rounded-[36px] bg-[linear-gradient(135deg,#dbeafe,#eff6ff)] p-6 shadow-[0_28px_60px_-48px_rgba(15,23,42,0.45)]">
              {image ? <img alt="" className="h-[360px] w-full rounded-[28px] object-cover" src={image} /> : <div className="flex h-[360px] items-center justify-center rounded-[28px] bg-slate-200 text-7xl text-slate-500">P</div>}
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
              <article key={`${item.author ?? index}`} className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_28px_60px_-48px_rgba(15,23,42,0.45)]">
                <p className="text-base leading-8 text-slate-700">“{String(item.quote ?? '')}”</p>
                <div className="mt-6 text-sm font-semibold text-slate-950">{String(item.author ?? '')}</div>
                <div className="text-sm text-slate-500">{String(item.role ?? '')}</div>
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
                <div className="overflow-hidden rounded-[30px] bg-slate-100 shadow-[0_28px_60px_-48px_rgba(15,23,42,0.45)]">
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
                <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-5 shadow-[0_20px_50px_-42px_rgba(15,23,42,0.45)]">
                  <div className="text-lg font-semibold text-slate-950">{String(item.question ?? '')}</div>
                  <div className="mt-3 text-sm leading-7 text-slate-600">{String(item.answer ?? '')}</div>
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
            ].map(([label, path, value]) => (
              <EditableHotspot key={label} active={selectedFieldPath === path} onInteract={() => select(path, 'text')} target={{ blockId: section.id, pageId: section.page_id ?? undefined, fieldPath: path, intent: 'text' }}>
                <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-[0_20px_50px_-42px_rgba(15,23,42,0.45)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{label}</div>
                  <div className="mt-4 text-lg font-semibold text-slate-950">{value || '—'}</div>
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
          section={section}
          selectedFieldPath={selectedFieldPath}
        />
      )}

      {section.type === 'custom_html' && (
        <EditableHotspot active={selectedFieldPath === 'content.html'} onInteract={onEditorInteract} target={{ blockId: section.id, pageId: section.page_id ?? undefined, fieldPath: 'content.html', intent: 'text' }}>
          <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_28px_60px_-48px_rgba(15,23,42,0.45)]" dangerouslySetInnerHTML={{ __html: stringValue(section.content.html) || '<p>Custom HTML</p>' }} />
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
  blog,
}: SiteBuilderRendererProps) => {
  const sections = page?.sections ?? blocks ?? [];
  const currentPage = page;
  const background = mode === 'public' ? 'bg-[linear-gradient(180deg,#f7f9fc_0%,#eef2ff_100%)]' : 'bg-slate-100';
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

  return (
    <div className={`${background}`} style={{ color: site.theme_config.text_color, fontFamily: site.theme_config.font_family }}>
      {mode === 'editor' ? (
        <div className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur">
          <div className="mx-auto flex w-full items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500" style={{ maxWidth: '1320px' }}>
            <div className="flex items-center gap-3">
              <span className="inline-flex gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
              </span>
              Holding Site Canvas
            </div>
            <div>{currentPage?.navigation_label || currentPage?.title || site.title}</div>
          </div>
        </div>
      ) : (
        <PublicSiteHeader currentPage={currentPage} navigation={navigationItems} site={site} />
      )}

      {currentPage?.page_type === 'blog_post' && blog?.current_article ? (
        <BlogArticlePage article={blog.current_article} />
      ) : currentPage?.page_type === 'blog_index' ? (
        <BlogIndexPage articles={blog?.articles} />
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
            ),
          )}
        </div>
      )}
    </div>
  );
};

export default SiteBuilderRenderer;
