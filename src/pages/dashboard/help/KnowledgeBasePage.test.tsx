import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { knowledgeHubApi } from '@/utils/knowledgeHubApi';
import KnowledgeBasePage from './KnowledgeBasePage';

vi.mock('@/utils/knowledgeHubApi', () => ({ knowledgeHubApi: { getOverview: vi.fn(), getTree: vi.fn(), getArticles: vi.fn(), searchArticles: vi.fn() } }));
const empty = { data: [], meta: { current_page: 1, per_page: 12, last_page: 1, total: 0 } };
const renderPage = () => render(<MemoryRouter><KnowledgeBasePage /></MemoryRouter>);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(knowledgeHubApi.getOverview).mockResolvedValue({ categories: [{ id: 1, slug: 'start', title: 'Начало работы', description: null, icon: null, color: null, articles_count: 0 }], featured_articles: [], latest_changelog: [], summary: { articles_count: 0, categories_count: 1, changelog_count: 0 } });
  vi.mocked(knowledgeHubApi.getTree).mockResolvedValue([]);
  vi.mocked(knowledgeHubApi.getArticles).mockResolvedValue(empty);
  vi.mocked(knowledgeHubApi.searchArticles).mockResolvedValue(empty);
});

describe('KnowledgeBasePage controls', () => {
  it('обновляет данные, даже если уже открыта первая страница', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Обновить' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Обновить' }));
    await waitFor(() => expect(knowledgeHubApi.getArticles).toHaveBeenCalledTimes(2));
    expect(knowledgeHubApi.getOverview).toHaveBeenCalledTimes(2);
    expect(knowledgeHubApi.getTree).toHaveBeenCalledTimes(2);
  });

  it('не скрывает ошибку категорий после успешной загрузки материалов и позволяет повторить', async () => {
    vi.mocked(knowledgeHubApi.getOverview).mockRejectedValueOnce(new Error('offline'));
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось загрузить категории');
    await screen.findByText('Материалы не найдены.');
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Повторить загрузку' }));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(await screen.findByRole('button', { name: 'Начало работы' })).toBeInTheDocument();
  });

  it('не выдаёт ошибку списка за отсутствие материалов', async () => {
    vi.mocked(knowledgeHubApi.getArticles).mockRejectedValueOnce(new Error('offline'));
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось загрузить материалы');
    expect(screen.queryByText('Материалы не найдены.')).not.toBeInTheDocument();
  });

  it('имеет подписанный поиск и сообщает выбранную категорию', async () => {
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Начало работы' }));
    expect(screen.getByRole('button', { name: 'Начало работы' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Все' })).toHaveAttribute('aria-pressed', 'false');
    fireEvent.change(screen.getByRole('textbox', { name: 'Поиск по инструкциям' }), { target: { value: 'пароль' } });
    await waitFor(() => expect(knowledgeHubApi.searchArticles).toHaveBeenLastCalledWith({ category: 'start', page: 1, per_page: 12, q: 'пароль' }));
  });
});
