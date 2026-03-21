import { useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import NotificationService from '@components/shared/NotificationService';
import type { EditorAsset, EditorSite, LeadSubmissionPayload, PublicSitePayload } from '@/types/holding-site-builder';

type PublicBlock = PublicSitePayload['blocks'][number];

interface SiteBuilderRendererProps {
  site: EditorSite;
  blocks: PublicBlock[];
  mode?: 'public' | 'editor';
  onSubmitLead?: (payload: LeadSubmissionPayload) => Promise<unknown>;
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

const Section = ({
  id,
  children,
}: {
  id?: string;
  children: ReactNode;
}) => (
  <section id={id} className="border-b border-slate-100 px-6 py-10 last:border-b-0 sm:px-10">
    {children}
  </section>
);

const LeadFormBlock = ({
  block,
  mode,
  onSubmitLead,
}: {
  block: PublicBlock;
  mode: 'public' | 'editor';
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
    <Section id={typeof block.settings.anchor_id === 'string' ? block.settings.anchor_id : 'lead-form'}>
      <div className="mx-auto max-w-3xl rounded-[24px] bg-slate-950 px-6 py-8 text-white sm:px-8">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Lead form</div>
          <h3 className="mt-3 text-3xl font-semibold">{title}</h3>
          {description && <p className="mt-3 text-slate-300">{description}</p>}
        </div>

        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <input
            className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm outline-none"
            placeholder="Имя"
            value={form.name}
            onChange={(event) => handleChange('name', event.target.value)}
          />
          <input
            className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm outline-none"
            placeholder="Компания"
            value={form.company}
            onChange={(event) => handleChange('company', event.target.value)}
          />
          <input
            className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm outline-none"
            placeholder="Email"
            value={form.email}
            onChange={(event) => handleChange('email', event.target.value)}
          />
          <input
            className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm outline-none"
            placeholder="Телефон"
            value={form.phone}
            onChange={(event) => handleChange('phone', event.target.value)}
          />
          <textarea
            className="min-h-28 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm outline-none sm:col-span-2"
            placeholder="Кратко опишите задачу"
            value={form.message}
            onChange={(event) => handleChange('message', event.target.value)}
          />
          <input
            className="hidden"
            autoComplete="off"
            tabIndex={-1}
            value={form.website}
            onChange={(event) => handleChange('website', event.target.value)}
          />
          <button
            type="submit"
            className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-100 sm:col-span-2"
            disabled={sending}
          >
            {sending ? 'Отправка...' : submitLabel}
          </button>
        </form>
      </div>
    </Section>
  );
};

const renderBlock = (
  block: PublicBlock,
  mode: 'public' | 'editor',
  onSubmitLead?: (payload: LeadSubmissionPayload) => Promise<unknown>,
) => {
  const title = stringValue(block.content.title) || block.title;
  const description = stringValue(block.content.description);
  const firstAsset = block.assets[0];

  switch (block.type) {
    case 'hero':
      return (
        <Section key={block.id}>
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr,0.9fr]">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Holding site</div>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
                {title || 'Новый сайт холдинга'}
              </h1>
              {stringValue(block.content.subtitle) && (
                <p className="mt-4 text-xl text-slate-700">{stringValue(block.content.subtitle)}</p>
              )}
              {description && <p className="mt-4 max-w-2xl text-base text-slate-600">{description}</p>}
              {stringValue(block.content.button_text) && (
                <a
                  className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                  href={stringValue(block.content.button_url) || '#lead-form'}
                >
                  {stringValue(block.content.button_text)}
                </a>
              )}
            </div>
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
          </div>
        </Section>
      );
    case 'stats':
      return (
        <Section key={block.id}>
          <div className="mb-6">
            <h2 className="text-3xl font-semibold">{title}</h2>
            {description && <p className="mt-2 text-slate-600">{description}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {arrayValue<{ label?: string; value?: string | number }>(block.content.items).map((item, index) => (
              <div key={`${block.id}-stat-${index}`} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="text-3xl font-semibold text-slate-950">{item.value ?? '0'}</div>
                <div className="mt-2 text-sm text-slate-600">{item.label ?? 'Показатель'}</div>
              </div>
            ))}
          </div>
        </Section>
      );
    case 'about':
      return (
        <Section key={block.id}>
          <div className="grid gap-8 lg:grid-cols-[1fr,0.8fr]">
            <div>
              <h2 className="text-3xl font-semibold">{title}</h2>
              <div
                className="prose mt-4 max-w-none text-slate-700"
                dangerouslySetInnerHTML={{ __html: description || '<p>Добавьте описание холдинга.</p>' }}
              />
            </div>
            {(stringValue(block.content.image) || assetImage(firstAsset)) && (
              <div className="overflow-hidden rounded-[24px] bg-slate-100">
                <img alt={title} className="h-full w-full object-cover" src={stringValue(block.content.image) || assetImage(firstAsset)} />
              </div>
            )}
          </div>
        </Section>
      );
    case 'services':
      return (
        <Section key={block.id}>
          <div className="mb-6">
            <h2 className="text-3xl font-semibold">{title}</h2>
            {description && <p className="mt-2 text-slate-600">{description}</p>}
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {arrayValue<{ title?: string; description?: string }>(block.content.services).map((item, index) => (
              <article key={`${block.id}-service-${index}`} className="rounded-[24px] border border-slate-200 p-5">
                <h3 className="text-lg font-medium">{item.title ?? 'Услуга'}</h3>
                {item.description && <p className="mt-3 text-sm text-slate-600">{item.description}</p>}
              </article>
            ))}
          </div>
        </Section>
      );
    case 'projects':
      return (
        <Section key={block.id}>
          <div className="mb-6">
            <h2 className="text-3xl font-semibold">{title}</h2>
            {description && <p className="mt-2 text-slate-600">{description}</p>}
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {arrayValue<{ title?: string; description?: string; location?: string; completed_at?: string }>(block.content.projects).map((item, index) => (
              <article key={`${block.id}-project-${index}`} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">{item.completed_at ?? 'Case'}</div>
                <h3 className="mt-3 text-lg font-medium">{item.title ?? 'Проект'}</h3>
                {item.description && <p className="mt-3 text-sm text-slate-600">{item.description}</p>}
                {item.location && <div className="mt-4 text-xs text-slate-500">{item.location}</div>}
              </article>
            ))}
          </div>
        </Section>
      );
    case 'team':
      return (
        <Section key={block.id}>
          <div className="mb-6">
            <h2 className="text-3xl font-semibold">{title}</h2>
            {description && <p className="mt-2 text-slate-600">{description}</p>}
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {arrayValue<{ name?: string; position?: string; email?: string }>(block.content.members).map((item, index) => (
              <article key={`${block.id}-member-${index}`} className="rounded-[24px] border border-slate-200 p-5">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-950 text-sm font-medium text-white">
                  {item.name?.slice(0, 1) ?? 'M'}
                </div>
                <h3 className="mt-4 text-lg font-medium">{item.name ?? 'Участник команды'}</h3>
                {item.position && <p className="mt-1 text-sm text-slate-600">{item.position}</p>}
                {item.email && <p className="mt-3 text-xs text-slate-500">{item.email}</p>}
              </article>
            ))}
          </div>
        </Section>
      );
    case 'testimonials':
      return (
        <Section key={block.id}>
          <div className="mb-6">
            <h2 className="text-3xl font-semibold">{title}</h2>
            {description && <p className="mt-2 text-slate-600">{description}</p>}
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {arrayValue<{ quote?: string; author?: string; role?: string }>(block.content.items).map((item, index) => (
              <blockquote key={`${block.id}-quote-${index}`} className="rounded-[24px] bg-slate-950 p-5 text-white">
                <p className="text-base leading-7">{item.quote ?? 'Добавьте отзыв клиента.'}</p>
                <footer className="mt-5 text-sm text-slate-300">
                  {item.author ?? 'Клиент'}
                  {item.role ? `, ${item.role}` : ''}
                </footer>
              </blockquote>
            ))}
          </div>
        </Section>
      );
    case 'gallery':
      return (
        <Section key={block.id}>
          <div className="mb-6">
            <h2 className="text-3xl font-semibold">{title}</h2>
            {description && <p className="mt-2 text-slate-600">{description}</p>}
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {arrayValue<{ url?: string; alt?: string; caption?: string }>(block.content.images).map((item, index) => (
              <figure key={`${block.id}-gallery-${index}`} className="overflow-hidden rounded-[24px] bg-slate-100">
                {item.url ? (
                  <img alt={item.alt ?? title} className="h-72 w-full object-cover" src={item.url} />
                ) : (
                  <div className="grid h-72 place-items-center text-sm text-slate-500">Добавьте изображение</div>
                )}
                {item.caption && <figcaption className="px-4 py-3 text-sm text-slate-600">{item.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </Section>
      );
    case 'faq':
      return (
        <Section key={block.id}>
          <div className="mb-6">
            <h2 className="text-3xl font-semibold">{title}</h2>
            {description && <p className="mt-2 text-slate-600">{description}</p>}
          </div>
          <div className="space-y-3">
            {arrayValue<{ question?: string; answer?: string }>(block.content.items).map((item, index) => (
              <details key={`${block.id}-faq-${index}`} className="rounded-[20px] border border-slate-200 px-5 py-4">
                <summary className="cursor-pointer list-none text-base font-medium">
                  {item.question ?? 'Добавьте вопрос'}
                </summary>
                {item.answer && <p className="mt-3 text-sm text-slate-600">{item.answer}</p>}
              </details>
            ))}
          </div>
        </Section>
      );
    case 'lead_form':
      return <LeadFormBlock key={block.id} block={block} mode={mode} onSubmitLead={onSubmitLead} />;
    case 'contacts':
      return (
        <Section key={block.id}>
          <div className="grid gap-8 lg:grid-cols-[0.9fr,1.1fr]">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Contacts</div>
              <h2 className="mt-3 text-3xl font-semibold">{title}</h2>
              {description && <p className="mt-3 text-slate-600">{description}</p>}
            </div>
            <div className="grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-6 sm:grid-cols-2">
              {stringValue(block.content.phone) && (
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Phone</div>
                  <div className="mt-2 text-lg">{stringValue(block.content.phone)}</div>
                </div>
              )}
              {stringValue(block.content.email) && (
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Email</div>
                  <div className="mt-2 text-lg">{stringValue(block.content.email)}</div>
                </div>
              )}
              {stringValue(block.content.address) && (
                <div className="sm:col-span-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Address</div>
                  <div className="mt-2 text-lg">{stringValue(block.content.address)}</div>
                </div>
              )}
              {stringValue(block.content.working_hours) && (
                <div className="sm:col-span-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Working hours</div>
                  <div className="mt-2 text-lg">{stringValue(block.content.working_hours)}</div>
                </div>
              )}
            </div>
          </div>
        </Section>
      );
    case 'custom_html':
      return (
        <Section key={block.id}>
          <div dangerouslySetInnerHTML={{ __html: stringValue(block.content.html) || '<div>Custom HTML block</div>' }} />
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
  onSubmitLead,
}: SiteBuilderRendererProps) => {
  const sortedBlocks = useMemo(
    () => [...blocks].sort((left, right) => left.sort_order - right.sort_order),
    [blocks],
  );

  return (
    <Surface site={site}>
      {sortedBlocks.map((block) => renderBlock(block, mode, onSubmitLead))}
    </Surface>
  );
};

export default SiteBuilderRenderer;
