import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Link, MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import KnowledgeBasePage from './KnowledgeBasePage';

const server = setupServer(http.options('*', () => new HttpResponse(null, { status: 204 })));
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => { cleanup(); server.resetHandlers(); });
afterAll(() => server.close());

const renderPage = () => render(<MemoryRouter initialEntries={['/dashboard/help/knowledge?context_key=team']}><KnowledgeBasePage /></MemoryRouter>);
const ask = () => {
  fireEvent.change(screen.getByRole('textbox', { name: 'Ваш вопрос' }), { target: { value: 'Как пригласить сотрудника?' } });
  fireEvent.click(screen.getByRole('button', { name: 'Спросить' }));
};

describe('Помощник МОСТ', () => {
  it('объясняет исчерпание лимита', async () => {
    server.use(http.post('*/knowledge-hub/assistant', () => HttpResponse.json({ success: false }, { status: 429 })));
    renderPage();
    ask();
    expect(await screen.findByRole('alert')).toHaveTextContent('Лимит обращений');
  });

  it('очищает ответ при смене раздела', async () => {
    server.use(http.post('*/knowledge-hub/assistant', () => HttpResponse.json({ data: {
      answer: 'Ответ старого раздела.', status: 'answered', sources: [],
    } })));
    render(<MemoryRouter initialEntries={['/dashboard/help/knowledge?context_key=first']}><KnowledgeBasePage /><Link to="?context_key=second">Другой раздел</Link></MemoryRouter>);
    ask();
    expect(await screen.findByText('Ответ старого раздела.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: 'Другой раздел' }));
    expect(screen.queryByText('Ответ старого раздела.')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Ваш вопрос' })).toHaveValue('');
  });

  it('открывается без загрузки каталога статей', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Помощник МОСТ' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Спросить' })).toBeDisabled();
  });

  it('передаёт контекст страницы и показывает короткий ответ', async () => {
    server.use(http.post('*/knowledge-hub/assistant', async ({ request }) => {
      expect(await request.json()).toEqual({ question: 'Как пригласить сотрудника?', context_key: 'team', history: [] });
      return HttpResponse.json({ success: true, data: { answer: 'Откройте раздел сотрудников.', status: 'answered', sources: [{ id: 3, title: 'Приглашение сотрудника' }] } });
    }));
    renderPage();
    ask();
    expect(await screen.findByText('Откройте раздел сотрудников.')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('позволяет повторить вопрос после ошибки', async () => {
    server.use(http.post('*/knowledge-hub/assistant', () => HttpResponse.error()));
    renderPage();
    ask();
    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось получить ответ');
    expect(screen.getByRole('button', { name: 'Спросить' })).toBeEnabled();
    server.use(http.post('*/knowledge-hub/assistant', () => HttpResponse.json({ data: { answer: 'Уточните вопрос.', status: 'insufficient_knowledge', sources: [] } })));
    ask();
    expect(await screen.findByText('Уточните вопрос.')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('сохраняет уточнение после ошибки и очищает историю нового разговора', async () => {
    const requests: Array<{ question: string; history: Array<{ role: string; content: string }> }> = [];
    server.use(http.post('*/knowledge-hub/assistant', async ({ request }) => {
      requests.push(await request.json() as typeof requests[number]);
      if (requests.length === 2) return HttpResponse.json({ success: false }, { status: 503 });
      return HttpResponse.json({ success: true, data: {
        answer: requests.length === 1 ? 'Вы хотите пригласить сотрудника?' : 'Откройте раздел сотрудников.',
        status: requests.length === 1 ? 'insufficient_knowledge' : 'answered',
        needs_clarification: requests.length === 1,
        sources: [],
      } });
    }));
    renderPage();
    const input = screen.getByRole('textbox', { name: 'Ваш вопрос' });
    fireEvent.change(input, { target: { value: 'Как добавить?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Спросить' }));
    expect(await screen.findByText('Вы хотите пригласить сотрудника?')).toBeTruthy();
    expect(input).toHaveValue('');
    fireEvent.change(input, { target: { value: 'Да' } });
    fireEvent.click(screen.getByRole('button', { name: 'Спросить' }));
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByText('Вы хотите пригласить сотрудника?')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Спросить' }));
    expect(await screen.findByText('Откройте раздел сотрудников.')).toBeTruthy();
    const history = [
      { role: 'user', content: 'Как добавить?' },
      { role: 'assistant', content: 'Вы хотите пригласить сотрудника?' },
    ];
    expect(requests[1].history).toEqual(history);
    expect(requests[2].history).toEqual(history);
    expect(requests[2].question).toBe('Да');
    fireEvent.click(screen.getByRole('button', { name: 'Новый разговор' }));
    expect(screen.queryByText('Вы хотите пригласить сотрудника?')).toBeNull();
    fireEvent.change(input, { target: { value: 'Как добавить?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Спросить' }));
    expect(await screen.findByText('Откройте раздел сотрудников.')).toBeTruthy();
    expect(requests[3].history).toEqual([]);
  });
});
