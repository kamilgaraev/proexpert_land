export const KNOWLEDGE_ARTICLES_PATH = '/dashboard/help/knowledge';

const encodedSegment = /^(?:[A-Za-z0-9._~-]|%[0-9A-F]{2})+$/;

export const isKnowledgeArticleSlug = (slug: string): boolean =>
  slug.length > 0 && slug !== '.' && slug !== '..' && !/[/\\?#%\p{Cc}\p{Cf}]/u.test(slug);

export const encodeKnowledgeArticleSlug = (slug: string): string =>
  encodeURIComponent(slug).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);

export const knowledgeArticlePath = (value: unknown): string | undefined => {
  const prefix = `${KNOWLEDGE_ARTICLES_PATH}/`;
  if (typeof value !== 'string' || !value.startsWith(prefix)) return undefined;
  const segment = value.slice(prefix.length);
  if (!encodedSegment.test(segment)) return undefined;

  try {
    return isKnowledgeArticleSlug(decodeURIComponent(segment)) ? value : undefined;
  } catch {
    return undefined;
  }
};
