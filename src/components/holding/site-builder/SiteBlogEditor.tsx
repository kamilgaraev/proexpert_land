import { useState } from 'react';
import type { FormEvent } from 'react';
import type { SiteBlogArticle } from '@/types/holding-site-builder';

interface SiteBlogEditorProps {
  articles: SiteBlogArticle[];
  canEdit: boolean;
  canPublish: boolean;
  createArticle: (payload: Record<string, unknown>) => Promise<SiteBlogArticle | null>;
  updateArticle: (id: number, payload: Record<string, unknown>) => Promise<SiteBlogArticle | null>;
  deleteArticle: (id: number) => Promise<unknown>;
}

const fieldClass = 'w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500';
const buttonClass = 'rounded-xl border border-slate-200 px-3 py-2 text-sm hover:border-slate-400 disabled:opacity-40';
const emptyArticle = { title: '', excerpt: '', content: '', featured_image: '' };

const readText = (html: string) => {
  const template = document.createElement('template');
  template.innerHTML = html.replace(/<\/(?:p|h[1-6]|li)>/gi, '\n\n').replace(/<br\s*\/?\s*>/gi, '\n');
  return (template.content.textContent ?? '').trim();
};

const formatText = (content: string) => content
  .trim()
  .split(/\n\s*\n/)
  .map(paragraph => paragraph
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>'))
  .filter(Boolean)
  .map(paragraph => `<p>${paragraph}</p>`)
  .join('');

function ArticleForm({ article, onCancel, onSave }: {
  article: SiteBlogArticle | null;
  onCancel: () => void;
  onSave: (payload: Record<string, unknown>) => Promise<SiteBlogArticle | null>;
}) {
  const [draft, setDraft] = useState(() => article ? {
    title: article.title,
    excerpt: article.excerpt ?? '',
    content: readText(article.content ?? ''),
    featured_image: article.featured_image ?? '',
  } : emptyArticle);
  const [saving, setSaving] = useState(false);
  const write = (field: keyof typeof emptyArticle, value: string) => setDraft(current => ({ ...current, [field]: value }));

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving || !draft.title.trim() || !draft.content.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: draft.title.trim(),
        excerpt: draft.excerpt.trim(),
        featured_image: draft.featured_image.trim(),
        content: article && draft.content === readText(article.content ?? '') ? article.content : formatText(draft.content),
        ...(!article && { status: 'draft' }),
      };
      if (await onSave(payload)) onCancel();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="grid gap-4" onSubmit={event => void save(event)}>
      <label className="grid gap-1 text-sm">
        Заголовок статьи
        <input className={fieldClass} maxLength={255} value={draft.title} onChange={event => write('title', event.target.value)} required />
      </label>
      <label className="grid gap-1 text-sm">
        Краткое описание
        <textarea className={fieldClass} maxLength={2000} rows={3} value={draft.excerpt} onChange={event => write('excerpt', event.target.value)} />
      </label>
      <label className="grid gap-1 text-sm">
        Текст статьи
        <textarea className={fieldClass} rows={10} value={draft.content} onChange={event => write('content', event.target.value)} required />
      </label>
      <label className="grid gap-1 text-sm">
        Адрес изображения обложки
        <input className={fieldClass} type="url" maxLength={2048} value={draft.featured_image} onChange={event => write('featured_image', event.target.value)} />
      </label>
      <div className="flex flex-wrap gap-2">
        <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={saving} type="submit">
          {saving ? 'Сохраняем…' : 'Сохранить статью'}
        </button>
        <button className={buttonClass} disabled={saving} onClick={onCancel} type="button">Отмена</button>
      </div>
    </form>
  );
}

export default function SiteBlogEditor({ articles, canEdit, canPublish, createArticle, updateArticle, deleteArticle }: SiteBlogEditorProps) {
  const [editing, setEditing] = useState<number | 'new' | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const editingArticle = articles.find(article => article.id === editing);

  const runArticleAction = async (id: number, action: () => Promise<unknown>) => {
    if (busyId !== null) return;
    setBusyId(id);
    try {
      await action();
    } finally {
      setBusyId(null);
    }
  };

  if (editing !== null && (editing === 'new' || editingArticle)) {
    return (
      <ArticleForm
        article={editingArticle ?? null}
        key={editing}
        onCancel={() => setEditing(null)}
        onSave={payload => editingArticle ? updateArticle(editingArticle.id, payload) : createArticle(payload)}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Статьи сайта</h2>
        {canEdit && <button className={buttonClass} onClick={() => setEditing('new')} type="button">Новая статья</button>}
      </div>
      {articles.length === 0 && <p className="text-sm text-slate-600">Здесь появятся черновики и опубликованные статьи.</p>}
      {articles.map(article => (
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={article.id}>
          <h3 className="font-semibold">{article.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{article.status === 'published' ? 'Опубликована' : 'Черновик'}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {canEdit && <button className={buttonClass} onClick={() => setEditing(article.id)} type="button">Редактировать</button>}
            {canPublish && (
              <button className={buttonClass} disabled={busyId !== null} onClick={() => void runArticleAction(article.id, () => updateArticle(article.id, {
                status: article.status === 'published' ? 'draft' : 'published',
              }))} type="button">{article.status === 'published' ? 'В черновик' : 'Опубликовать статью'}</button>
            )}
            {canEdit && <button className={buttonClass} disabled={busyId !== null} onClick={() => void runArticleAction(article.id, () => deleteArticle(article.id))} type="button">Удалить</button>}
          </div>
        </article>
      ))}
    </div>
  );
}
