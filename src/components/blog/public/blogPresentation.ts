export const formatBlogDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

export const getBlogReadingTime = (content: string) => {
  const wordsPerMinute = 200;
  const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = plainText ? plainText.split(' ').length : 0;
  const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));

  return `${minutes} мин чтения`;
};

export const getBlogListMeta = (count: number) => {
  if (count % 10 === 1 && count % 100 !== 11) {
    return `${count} статья`;
  }

  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return `${count} статьи`;
  }

  return `${count} статей`;
};
