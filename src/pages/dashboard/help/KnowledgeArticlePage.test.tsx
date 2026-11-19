import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import { AuthContext, type AuthContextType } from '@/contexts/AuthContext';
import { aiAssistantService, AssistantApiError } from '@/services/aiAssistantService';
import type { KnowledgeArticleDetail } from '@/types/knowledgeHub';
import { saveAuthToken } from '@/utils/authTokenStorage';
import KnowledgeArticlePage from './KnowledgeArticlePage';

vi.mock('@/services/aiAssistantService', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/services/aiAssistantService')>();
  return { ...original, aiAssistantService: { getKnowledgeArticle: vi.fn() } };
});

const auth = (id = 7, organizationId = 44, token = 'article-token'): AuthContextType => ({
  user: { id, current_organization_id: organizationId } as AuthContextType['user'],
  isAuthenticated: true, isLoading: false, token,
  login: vi.fn(), logout: vi.fn(), register: vi.fn(), fetchUser: vi.fn(),
});

const article = (title: string, slug: string): KnowledgeArticleDetail => ({
  id: 1, kind: 'article', kind_label: 'Статья', status: 'published',
  title, slug, excerpt: null, parent_id: null, depth: 0, audiences: [], surfaces: ['lk'],
  module_slugs: [], context_keys: [], category: null, tags: [], release_version: null,
  release_date: null, published_at: null, reading_time: 1, is_featured: false, is_pinned: false,
  content: '<p>Текст инструкции.</p>', table_of_contents: [], children: [], related: [],
});

const path = '/dashboard/help/knowledge';
const detail = (value = auth()) => (
  <AuthContext.Provider value={value}>
    <MemoryRouter initialEntries={[`${path}/example`]}>
      <Link to={`${path}/next`}>Следующая статья</Link>
      <Routes><Route path={`${path}/:slug`} element={<KnowledgeArticlePage />} /></Routes>
    </MemoryRouter>
  </AuthContext.Provider>
);

beforeEach(() => {
  vi.mocked(aiAssistantService.getKnowledgeArticle).mockReset();
  saveAuthToken('article-token');
});

it('показывает ошибку сети без ложного отсутствия материала и позволяет повторить', async () => {
  vi.mocked(aiAssistantService.getKnowledgeArticle).mockRejectedValue(new Error('Internal connection error'));
  render(detail());
  expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось загрузить материал');
  expect(screen.queryByText('Материал не найден или недоступен.')).not.toBeInTheDocument();
  expect(screen.queryByText(/Internal connection/)).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Все инструкции' })).toHaveAttribute('href', path);
  fireEvent.click(screen.getByRole('button', { name: 'Повторить загрузку' }));
  await waitFor(() => expect(aiAssistantService.getKnowledgeArticle).toHaveBeenCalledTimes(2));
  expect(await screen.findByRole('alert')).toBeInTheDocument();
});

it('обрабатывает 404 от детального API и оставляет путь к списку инструкций', async () => {
  const getArticle = vi.mocked(aiAssistantService.getKnowledgeArticle);
  getArticle.mockRejectedValue(new AssistantApiError('Internal route not found', 404));
  render(detail());
  expect(await screen.findByRole('alert')).toHaveTextContent('Материал не найден или недоступен.');
  expect(screen.queryByText(/Internal route/)).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Все инструкции' })).toHaveAttribute('href', path);
  expect(getArticle).toHaveBeenCalledTimes(1);
});

it('скрывает предыдущую статью при смене slug и отбрасывает поздний ответ предыдущей организации', async () => {
  const getArticle = vi.mocked(aiAssistantService.getKnowledgeArticle);
  let resolveStale!: (data: KnowledgeArticleDetail) => void;
  getArticle.mockResolvedValueOnce(article('Первая статья', 'example'))
    .mockImplementationOnce(() => new Promise((resolve) => { resolveStale = resolve; }))
    .mockResolvedValueOnce(article('Статья текущей организации', 'next'));
  const page = render(detail());
  await screen.findByRole('heading', { name: 'Первая статья' });

  fireEvent.click(screen.getByRole('link', { name: 'Следующая статья' }));
  expect(screen.queryByText('Первая статья')).not.toBeInTheDocument();
  expect(getArticle.mock.calls[1]?.[0]).toBe('next');
  const staleRequest = getArticle.mock.calls[1]?.[1];
  page.rerender(detail(auth(7, 55)));
  expect(staleRequest?.aborted).toBe(true);
  await screen.findByRole('heading', { name: 'Статья текущей организации' });
  await act(async () => resolveStale(article('Статья предыдущей организации', 'next')));
  expect(screen.queryByText('Статья предыдущей организации')).not.toBeInTheDocument();
});

it('заново проверяет статью при смене сессии и пользователя', async () => {
  const getArticle = vi.mocked(aiAssistantService.getKnowledgeArticle);
  getArticle.mockResolvedValueOnce(article('Статья первой сессии', 'example'))
    .mockResolvedValueOnce(article('Статья следующей сессии', 'example'))
    .mockResolvedValueOnce(article('Статья текущего пользователя', 'example'));
  const page = render(detail());
  await screen.findByRole('heading', { name: 'Статья первой сессии' });

  saveAuthToken('refreshed-article-token');
  page.rerender(detail(auth(7, 44, 'refreshed-article-token')));
  expect(screen.queryByText('Статья первой сессии')).not.toBeInTheDocument();
  await screen.findByRole('heading', { name: 'Статья следующей сессии' });

  page.rerender(detail(auth(8, 44, 'refreshed-article-token')));
  expect(screen.queryByText('Статья следующей сессии')).not.toBeInTheDocument();
  await screen.findByRole('heading', { name: 'Статья текущего пользователя' });

  page.rerender(detail({ ...auth(8), token: null }));
  expect(screen.queryByText('Статья текущего пользователя')).not.toBeInTheDocument();
  expect(getArticle).toHaveBeenCalledTimes(3);
});
