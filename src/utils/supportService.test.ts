import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { API_URL, supportService } from './api';
import { clearAuthToken, saveAuthToken } from './authTokenStorage';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  clearAuthToken();
});
afterAll(() => server.close());

describe('supportService.submitSupportRequest', () => {
  it('отправляет авторизованное обращение на зарегистрированный маршрут поддержки', async () => {
    const requestData = {
      name: 'Тестовый пользователь',
      email: 'test@example.test',
      subject: 'Вопрос о проекте',
      message: 'Нужна помощь с проектом.',
      type: 'Общий вопрос' as const,
    };
    const responseData = { success: true, data: null, message: 'Обращение отправлено.' };
    const receivedRequest = vi.fn();

    saveAuthToken('support-access-token');
    server.use(http.post(new URL(`${API_URL}/support`).href, async ({ request }) => {
      receivedRequest({
        authorization: request.headers.get('Authorization'),
        contentType: request.headers.get('Content-Type'),
        body: await request.json(),
      });

      return HttpResponse.json(responseData);
    }));

    const response = await supportService.submitSupportRequest(requestData);

    expect(response.status).toBe(200);
    expect(response.data).toEqual(responseData);
    expect(receivedRequest).toHaveBeenCalledExactlyOnceWith({
      authorization: 'Bearer support-access-token',
      contentType: 'application/json',
      body: requestData,
    });
  });
});
