import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SupplierRequestResponsePage from './SupplierRequestResponsePage';

const endpoint = '*/api/v1/procurement/supplier-requests/:token';
const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => { cleanup(); server.resetHandlers(); });
afterAll(() => server.close());

function renderPage() {
  return render(<MemoryRouter initialEntries={['/supplier-requests/test-token']}><Routes><Route path="/supplier-requests/:token" element={<SupplierRequestResponsePage />} /></Routes></MemoryRouter>);
}

describe('загрузка заявки поставщика', () => {
  it('сохраняет цены при ошибке отправки и не отправляет без подтверждения', async () => {
    let submissions = 0;
    server.use(
      http.get(endpoint, () => HttpResponse.json({ success: true, data: {
        request_number: 'ТЕСТ-2', status: 'sent', status_label: 'Отправлена', can_submit: true,
        organization: { name: 'Заказчик' }, supplier: { name: 'Поставщик' },
        lines: [{ id: 1, name: 'Арматура', quantity: 2, unit: 'т', specification: null }],
      } })),
      http.post(`${endpoint}/proposals`, () => { submissions += 1; return HttpResponse.error(); }),
    );
    renderPage();
    const price = await screen.findByLabelText('Цена за единицу');
    fireEvent.change(price, { target: { value: '1250' } });
    const submit = screen.getByRole('button', { name: 'Отправить КП' });
    fireEvent.submit(submit.closest('form')!);
    expect(await screen.findByRole('dialog')).toHaveAccessibleName('Подтвердите отправку КП');
    expect(submissions).toBe(0);
    fireEvent.click(screen.getByRole('button', { name: 'Вернуться к редактированию' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(price).toHaveValue(1250);
    fireEvent.submit(submit.closest('form')!);
    fireEvent.click(await screen.findByRole('button', { name: 'Подтвердить отправку' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось подтвердить отправку');
    expect(price).toHaveValue(1250);
    expect(submissions).toBe(1);
    expect(screen.queryByText('Failed to fetch')).not.toBeInTheDocument();
  });
  it.each([404, 410])('отличает недействительную ссылку %s от сетевого сбоя', async (status) => {
    server.use(http.get(endpoint, () => HttpResponse.json({ message: 'internal message' }, { status })));
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent(status === 404 ? 'Заявка не найдена' : 'Срок действия ссылки истёк');
    expect(screen.queryByRole('button', { name: 'Попробовать ещё раз' })).not.toBeInTheDocument();
    expect(screen.queryByText('internal message')).not.toBeInTheDocument();
  });

  it('повторяет загрузку после сетевой ошибки и показывает заявку', async () => {
    server.use(http.get(endpoint, () => HttpResponse.error()));
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent('Проверьте соединение');
    expect(screen.queryByText(/Заявка не найдена/)).not.toBeInTheDocument();
    server.use(http.get(endpoint, () => HttpResponse.json({ success: true, data: {
      request_number: 'ТЕСТ-1', status: 'sent', status_label: 'Отправлена', can_submit: false,
      organization: { name: 'Тестовый заказчик' }, supplier: { name: 'Поставщик' }, lines: [],
    } })));
    fireEvent.click(screen.getByRole('button', { name: 'Попробовать ещё раз' }));
    expect(await screen.findByRole('heading', { name: 'Тестовый заказчик' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(document.title).toBe('Предложение поставщика — МОСТ');
  });

  it('не показывает технический ответ сервера', async () => {
    server.use(http.get(endpoint, () => new HttpResponse('<html>internal error</html>', { status: 503 })));
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось загрузить заявку');
    expect(screen.queryByText(/internal error/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Попробовать ещё раз' })).toBeInTheDocument();
  });
});
