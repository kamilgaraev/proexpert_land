import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  createLeadFixture,
  createPublicSitePayloadFixture,
  createWorkspaceFixture,
} from '@/test/fixtures/holdingSiteBuilder';

vi.mock('@/utils/api', () => ({
  API_URL: 'https://api.example.test/api/v1/landing',
  getTokenFromStorages: () => 'test-token',
}));

import {
  BuilderApiError,
  holdingSiteBuilderService,
  publicHoldingSiteService,
} from '@/services/holdingSiteBuilderService';

const workspaceFixture = createWorkspaceFixture();
const publicPayloadFixture = createPublicSitePayloadFixture();
const leadFixture = createLeadFixture();

const server = setupServer(
  http.get('https://api.example.test/api/v1/landing/holding/site', () =>
    HttpResponse.json({
      success: true,
      data: workspaceFixture,
    }),
  ),
  http.get('https://api.example.test/api/v1/landing/holding/public/site-data', ({ request }) => {
    const url = new URL(request.url);

    if (url.searchParams.get('site_domain') !== 'localhost') {
      return HttpResponse.json(
        {
          success: false,
          message: 'Неверный домен сайта',
        },
        { status: 422 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: publicPayloadFixture,
    });
  }),
  http.post('https://api.example.test/api/v1/landing/holding/public/site-leads', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;

    if (body.site_domain !== 'localhost') {
      return HttpResponse.json(
        {
          success: false,
          message: 'Неверный домен сайта',
        },
        { status: 422 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        ...leadFixture,
        name: body.name ?? leadFixture.name,
      },
    });
  }),
);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe('holdingSiteBuilderService', () => {
  it('нормализует authenticated workspace через LandingResponse envelope', async () => {
    const workspace = await holdingSiteBuilderService.getWorkspace();

    expect(workspace.site.title).toBe('Alpha Holding');
    expect(workspace.blocks).toHaveLength(1);
    expect(workspace.publication.preview_url).toContain('preview=true');
  });

  it('бросает BuilderApiError при ошибочном envelope', async () => {
    server.use(
      http.get('https://api.example.test/api/v1/landing/holding/site', () =>
        HttpResponse.json(
          {
            success: false,
            message: 'Ошибка валидации',
            errors: {
              domain: ['Домен уже занят'],
            },
          },
          { status: 422 },
        ),
      ),
    );

    await expect(holdingSiteBuilderService.getWorkspace()).rejects.toEqual(
      expect.objectContaining<Partial<BuilderApiError>>({
        message: 'Ошибка валидации',
        status: 422,
      }),
    );
  });
});

describe('publicHoldingSiteService', () => {
  it('читает published runtime payload и отправляет лид на same-origin endpoints', async () => {
    const payload = await publicHoldingSiteService.getSiteData('?preview=true');
    const lead = await publicHoldingSiteService.submitLead({
      name: 'Павел',
      phone: '+79991234567',
      message: 'Нужен сайт',
      block_key: 'lead_form_1',
    });

    expect(payload.runtime.mode).toBe('published');
    expect(payload.blocks[0]?.type).toBe('hero');
    expect(lead.name).toBe('Павел');
    expect(lead.block_key).toBe('lead_form_1');
  });
});
