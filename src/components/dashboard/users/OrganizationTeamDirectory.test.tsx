import { afterAll, afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { saveAuthToken } from '@/utils/authTokenStorage';
import OrganizationTeamDirectory from './OrganizationTeamDirectory';

const url = 'https://api.xn--1-xtbgmf.xn--p1ai/api/v1/landing/user-management/organization-users';
const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => { cleanup(); server.resetHandlers(); });
beforeEach(() => saveAuthToken('team-ui-test-token'));

it('показывает общую команду и серверные страницы с действиями конкретного сотрудника', async () => {
  const edit = vi.fn();
  server.use(http.get(url, ({ request }) => {
    const page = Number(new URL(request.url).searchParams.get('page'));
    return HttpResponse.json({ success: true, data: [{ id: page, name: page === 1 ? 'Анна Петрова' : 'Иван Смирнов', email: 'engineer@example.test', email_verified_at: null, is_active: true, created_at: null, roles: [{ id: null, slug: 'foreman', name: 'Прораб', type: 'system' }] }], meta: { current_page: page, last_page: 2, per_page: 20, total: 21 } });
  }));
  render(<OrganizationTeamDirectory scope="user1:org1" canManage renderActions={member => <button onClick={() => edit(member.id)}>Изменить</button>} />);
  const first = await screen.findByRole('article', { name: 'Анна Петрова' });
  expect(screen.getByText('Всего сотрудников: 21')).toBeInTheDocument();
  expect(within(first).getByText('Прораб')).toBeInTheDocument();
  fireEvent.click(within(first).getByRole('button', { name: 'Изменить' }));
  expect(edit).toHaveBeenCalledWith(1);
  expect(screen.getByRole('button', { name: 'Назад' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Далее' }));
  await screen.findByRole('article', { name: 'Иван Смирнов' });
  expect(screen.queryByRole('article', { name: 'Анна Петрова' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Далее' })).toBeDisabled();
  expect(screen.getByRole('searchbox', { name: 'Найти сотрудника' })).toBeInTheDocument();
});

it('не запрашивает команду и не показывает действия без доступа', async () => {
  const actions = vi.fn();
  const request = vi.fn();
  server.use(http.get(url, () => { request(); return HttpResponse.json({ success: true, data: [] }); }));
  render(<OrganizationTeamDirectory scope="user1:org1" canManage={false} renderActions={actions} />);
  expect(screen.getByText('Для просмотра команды нужен доступ к управлению сотрудниками.')).toBeInTheDocument();
  expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  expect(actions).not.toHaveBeenCalled();
  await new Promise(resolve => setTimeout(resolve, 350));
  expect(request).not.toHaveBeenCalled();
});

it('находит по имени или почте и сбрасывает пустой результат', async () => {
  const queries: string[] = [];
  const name = 'Александр Александрович Долгополов-Североуральский';
  const email = 'alexander.dolgopolov.department.construction@example.test';
  server.use(http.get(url, ({ request }) => {
    const search = new URL(request.url).searchParams.get('search') ?? '';
    queries.push(search);
    const data = search === 'нет совпадений' ? [] : [{ id: 1, name, email, email_verified_at: null, is_active: true, created_at: null, roles: [] }];
    return HttpResponse.json({ success: true, data, meta: { current_page: 1, last_page: 1, per_page: 20, total: data.length } });
  }));
  render(<OrganizationTeamDirectory scope="user1:org1" canManage renderActions={() => null} />);
  expect(await screen.findByRole('article', { name })).toHaveTextContent(email);
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'нет совпадений' } });
  expect(await screen.findByText('Сотрудники не найдены')).toBeInTheDocument();
  expect(screen.queryByText('В команде пока нет сотрудников')).not.toBeInTheDocument();
  expect(queries.at(-1)).toBe('нет совпадений');
  fireEvent.click(screen.getByRole('button', { name: 'Сбросить поиск' }));
  expect(await screen.findByRole('article', { name })).toHaveTextContent(email);
  expect(screen.getByRole('searchbox')).toHaveValue('');
  expect(queries.at(-1)).toBe('');
});

it('восстанавливает список после ошибки по кнопке повтора', async () => {
  server.use(http.get(url, () => HttpResponse.error()));
  render(<OrganizationTeamDirectory scope="user1:org1" canManage renderActions={() => null} />);
  const retry = await screen.findByRole('button', { name: 'Повторить загрузку' });
  server.use(http.get(url, () => HttpResponse.json({ success: true, data: [], meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 } })));
  fireEvent.click(retry);
  expect(await screen.findByText('В команде пока нет сотрудников')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('не маскирует ошибку ответа сообщением об отсутствии сотрудников', async () => {
  server.use(http.get(url, () => HttpResponse.json({ success: false, message: 'internal database details' }, { status: 500 })));
  render(<OrganizationTeamDirectory scope="user1:org1" canManage renderActions={() => null} />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось показать команду');
  expect(screen.queryByText('В команде пока нет сотрудников')).not.toBeInTheDocument();
  expect(screen.queryByText('internal database details')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Повторить загрузку' })).toBeInTheDocument();
});
