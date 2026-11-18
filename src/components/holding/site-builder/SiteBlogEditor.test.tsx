// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import SiteBlogEditor from './SiteBlogEditor';

afterEach(cleanup);

it('требует подтвердить преобразование оформленной статьи в простой текст', async () => {
  const article = { id: 1, title: 'Материалы для заказчика', slug: 'materials', status: 'published', content: '<p><a href="/checklist">Перечень работ</a></p>' };
  const updateArticle = vi.fn().mockResolvedValue(article);
  render(<SiteBlogEditor articles={[article]} canEdit canPublish createArticle={vi.fn()} deleteArticle={vi.fn()} updateArticle={updateArticle} />);

  fireEvent.click(screen.getByRole('button', { name: 'Редактировать' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Текст статьи' }), { target: { value: 'Новый перечень работ' } });
  const save = screen.getByRole('button', { name: 'Сохранить статью' });
  expect(save).toBeDisabled();
  expect(updateArticle).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(save);
  await waitFor(() => expect(updateArticle).toHaveBeenCalledWith(1, expect.objectContaining({ content: '<p>Новый перечень работ</p>' })));
});
