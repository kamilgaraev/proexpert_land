import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import { knowledgeHubApi } from '@/utils/knowledgeHubApi';
import ChangelogPage from './ChangelogPage';
import ChangelogDetailPage from './ChangelogDetailPage';

vi.mock('@/utils/knowledgeHubApi', () => ({ knowledgeHubApi: { getChangelog: vi.fn(), getChangelogEntry: vi.fn() } }));

beforeEach(() => vi.resetAllMocks());

it('отделяет сбой списка от пустого результата и повторяет загрузку', async () => {
  vi.mocked(knowledgeHubApi.getChangelog)
    .mockRejectedValueOnce(new Error('Connection failed'))
    .mockResolvedValue({ data: [], meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 } });
  render(<MemoryRouter><ChangelogPage /></MemoryRouter>);
  expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось загрузить обновления');
  expect(screen.queryByText('Обновления не найдены.')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Повторить загрузку' }));
  expect(await screen.findByText('Обновления не найдены.')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(knowledgeHubApi.getChangelog).toHaveBeenCalledTimes(2);
});

it('сохраняет поисковый запрос при повторной загрузке', async () => {
  vi.mocked(knowledgeHubApi.getChangelog).mockRejectedValue(new Error('Connection failed'));
  render(<MemoryRouter><ChangelogPage /></MemoryRouter>);
  await screen.findByRole('alert');
  fireEvent.change(screen.getByRole('textbox', { name: 'Поиск по обновлениям' }), { target: { value: 'журнал' } });
  await waitFor(() => expect(knowledgeHubApi.getChangelog).toHaveBeenCalledTimes(2));
  await screen.findByRole('alert');
  fireEvent.click(screen.getByRole('button', { name: 'Повторить загрузку' }));
  await waitFor(() => expect(knowledgeHubApi.getChangelog).toHaveBeenCalledTimes(3));
  expect(knowledgeHubApi.getChangelog).toHaveBeenLastCalledWith({ q: 'журнал', page: 1, per_page: 10 });
});

it('даёт повторить загрузку записи и вернуться в список после ошибки', async () => {
  vi.mocked(knowledgeHubApi.getChangelogEntry).mockRejectedValue(new Error('Internal connection error'));
  render(<MemoryRouter initialEntries={['/updates/example']}><Routes><Route path="/updates/:slug" element={<ChangelogDetailPage />} /></Routes></MemoryRouter>);
  expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось загрузить обновление');
  expect(screen.queryByText('Обновление не найдено.')).not.toBeInTheDocument();
  expect(screen.queryByText(/Internal connection/)).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Все обновления' })).toHaveAttribute('href', '/dashboard/help/changelog');
  fireEvent.click(screen.getByRole('button', { name: 'Повторить загрузку' }));
  await waitFor(() => expect(knowledgeHubApi.getChangelogEntry).toHaveBeenCalledTimes(2));
  expect(knowledgeHubApi.getChangelogEntry).toHaveBeenLastCalledWith('example');
});
