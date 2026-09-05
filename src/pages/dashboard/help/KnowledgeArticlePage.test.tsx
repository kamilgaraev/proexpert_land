import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import { knowledgeHubApi } from '@/utils/knowledgeHubApi';
import KnowledgeArticlePage from './KnowledgeArticlePage';

vi.mock('@/utils/knowledgeHubApi', () => ({ knowledgeHubApi: { getArticle: vi.fn() } }));

it('показывает ошибку сети без ложного отсутствия материала и позволяет повторить', async () => {
  vi.mocked(knowledgeHubApi.getArticle).mockRejectedValue(new Error('Internal connection error'));
  render(<MemoryRouter initialEntries={['/knowledge/example']}><Routes><Route path="/knowledge/:slug" element={<KnowledgeArticlePage />} /></Routes></MemoryRouter>);
  expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось загрузить материал');
  expect(screen.queryByText('Материал не найден.')).not.toBeInTheDocument();
  expect(screen.queryByText(/Internal connection/)).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Все инструкции' })).toHaveAttribute('href', '/dashboard/help/knowledge');
  fireEvent.click(screen.getByRole('button', { name: 'Повторить загрузку' }));
  await waitFor(() => expect(knowledgeHubApi.getArticle).toHaveBeenCalledTimes(2));
  expect(await screen.findByRole('alert')).toBeInTheDocument();
});
