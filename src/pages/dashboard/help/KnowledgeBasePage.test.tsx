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
      expect(await request.json()).toEqual({ question: 'Как пригласить сотрудника?', context_key: 'team' });
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
});
