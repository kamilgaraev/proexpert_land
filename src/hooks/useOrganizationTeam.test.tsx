import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { useOrganizationTeam } from './useOrganizationTeam';
import { saveAuthToken } from '@/utils/authTokenStorage';
import { userManagementService } from '@/utils/api';
import { parseOrganizationTeamPage } from '@/services/organizationTeamService';

const url = 'https://api.xn--1-xtbgmf.xn--p1ai/api/v1/landing/user-management/organization-users';
const server = setupServer();
const member = (id: number, name = `Сотрудник ${id}`) => ({ id, name, email: `${id}@example.test`, email_verified_at: null, is_active: true, roles: [{ id: null, slug: 'foreman', name: 'Прораб', type: 'system' }], created_at: null });
const page = (id = 1, currentPage = 1, total = 41) => ({ success: true, data: [member(id)], meta: { current_page: currentPage, last_page: Math.max(1, Math.ceil(total / 20)), per_page: 20, total } });

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => { cleanup(); server.resetHandlers(); vi.restoreAllMocks(); });
afterAll(() => server.close());
beforeEach(() => saveAuthToken('team-directory-test-token'));

describe('Общий список сотрудников', () => {
  it('передаёт поиск и страницу серверу, сохраняя общий счётчик', async () => {
    const queries: string[] = [];
    server.use(http.get(url, ({ request }) => {
      const params = new URL(request.url).searchParams;
      queries.push(params.toString());
      return HttpResponse.json(page(Number(params.get('page')), Number(params.get('page'))));
    }));
    const { result } = renderHook(() => useOrganizationTeam('user1:org1'));
    await waitFor(() => expect(result.current.meta?.total).toBe(41));
    act(() => result.current.setPage(2));
    expect(result.current.members).toEqual([]);
    await waitFor(() => expect(result.current.meta?.current_page).toBe(2));
    act(() => result.current.setSearch('  Инженер  '));
    expect(result.current.page).toBe(1);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(queries.map(query => Object.fromEntries(new URLSearchParams(query)))).toEqual([
      { search: '', page: '1', per_page: '20' },
      { search: '', page: '2', per_page: '20' },
      { search: 'Инженер', page: '1', per_page: '20' },
    ]);
  });

  it('отменяет старый запрос и не возвращает его результат после нового поиска', async () => {
    let started = false;
    const requestSpy = vi.spyOn(userManagementService, 'getOrganizationTeam');
    server.use(http.get(url, async ({ request }) => {
      const search = new URL(request.url).searchParams.get('search');
      if (!search) {
        started = true;
        await delay(600);
        return HttpResponse.json(page(1));
      }
      return HttpResponse.json(page(2));
    }));
    const { result } = renderHook(() => useOrganizationTeam('user1:org1'));
    await waitFor(() => expect(started).toBe(true));
    act(() => result.current.setSearch('ПТО'));
    await waitFor(() => expect(result.current.members[0]?.id).toBe(2));
    expect(requestSpy.mock.calls[0][1].aborted).toBe(true);
    expect(requestSpy.mock.calls[1][1].aborted).toBe(false);
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 350)); });
    expect(result.current.members[0]?.id).toBe(2);
  });

  it('сразу убирает данные прежней компании и сбрасывает её поиск', async () => {
    let calls = 0;
    server.use(http.get(url, async () => { calls++; const id = calls; if (id > 1) await delay(80); return HttpResponse.json(page(id)); }));
    const { result, rerender } = renderHook(({ scope }) => useOrganizationTeam(scope), { initialProps: { scope: 'user1:org1' } });
    await waitFor(() => expect(result.current.members[0]?.id).toBe(1));
    rerender({ scope: 'user1:org2' });
    expect(result.current.members).toEqual([]);
    expect(result.current.meta).toBeNull();
    expect(result.current.search).toBe('');
    await waitFor(() => expect(result.current.members[0]?.id).toBe(2));
  });

  it('показывает ошибку несовместимого ответа вместо пустой команды и позволяет повторить', async () => {
    let valid = false;
    server.use(http.get(url, () => HttpResponse.json(valid ? page() : { success: true, data: [] })));
    const { result } = renderHook(() => useOrganizationTeam('user1:org1'));
    await waitFor(() => expect(result.current.error).toContain('Не удалось загрузить'));
    expect(result.current.meta).toBeNull();
    valid = true;
    act(() => result.current.refresh());
    await waitFor(() => expect(result.current.members).toHaveLength(1));
    expect(result.current.error).toBeNull();
  });

  it('не делает запрос без контекста или разрешённого доступа', async () => {
    let calls = 0;
    server.use(http.get(url, () => { calls++; return HttpResponse.json(page()); }));
    const { result, rerender } = renderHook(({ scope, enabled }: { scope: string | null; enabled: boolean }) => useOrganizationTeam(scope, enabled), { initialProps: { scope: null as string | null, enabled: true } });
    rerender({ scope: 'user1:org1', enabled: false });
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 30)); });
    expect(calls).toBe(0);
    expect(result.current.loading).toBe(false);
    expect(result.current.members).toEqual([]);
  });

  it('возвращается к последней странице, если состав команды сократился', async () => {
    server.use(http.get(url, ({ request }) => {
      const current = Number(new URL(request.url).searchParams.get('page'));
      return HttpResponse.json(current === 3 ? { ...page(1, 3, 1), data: [] } : page(1, 1, 1));
    }));
    const { result } = renderHook(() => useOrganizationTeam('user1:org1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.setPage(3));
    await waitFor(() => expect(result.current.page).toBe(1));
    await waitFor(() => expect(result.current.meta?.total).toBe(1));
  });

  it('принимает настоящую пустую страницу и отвергает повреждённую строку сотрудника', () => {
    expect(parseOrganizationTeamPage({ ...page(1, 1, 0), data: [] }).meta.total).toBe(0);
    expect(() => parseOrganizationTeamPage({ ...page(), data: [{ ...member(1), roles: null }] })).toThrow('Не удалось загрузить');
    expect(() => parseOrganizationTeamPage({ ...page(), meta: { ...page().meta, per_page: 0 } })).toThrow('Не удалось загрузить');
  });
});
