import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import MyProjectsPage from './MyProjectsPage';

const server = setupServer();
const endpoint = 'https://api.xn--1-xtbgmf.xn--p1ai/api/v1/landing/my-projects';
const project = { id: 7, name: 'Дом на Садовой', status: 'active', role: 'owner', is_owner: true };
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => { cleanup(); server.resetHandlers(); });
afterAll(() => server.close());
const showPage = () => render(<MemoryRouter><MyProjectsPage /></MemoryRouter>);

describe('Project loading', () => {
  it('shows a retryable error instead of an empty list, then recovers', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json({}, { status: 503 })));
    showPage();
    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось загрузить проекты');
    expect(screen.queryByText('Проекты не найдены')).not.toBeInTheDocument();
    server.use(http.get(endpoint, () => HttpResponse.json({ data: { projects: [project] } })));
    fireEvent.click(screen.getByRole('button', { name: 'Повторить загрузку' }));
    expect(await screen.findByRole('heading', { name: project.name })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('accepts an array response and filters projects by the entered search', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json({ data: [project] })));
    showPage();
    await screen.findByRole('heading', { name: project.name });
    fireEvent.change(screen.getByRole('textbox', { name: 'Поиск проектов по названию или адресу' }), { target: { value: 'несуществующий' } });
    expect(screen.getByText('Проекты не найдены')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: project.name })).not.toBeInTheDocument();
  });
});
