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
  authorizedFetch: (input: RequestInfo | URL, init?: RequestInit) => fetch(input, init),
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
  it('sends a once-decoded public pathname to the API', async () => {
    server.use(http.get('https://api.example.test/api/v1/landing/holding/public/site-data', ({ request }) => {
      expect(new URL(request.url).searchParams.get('path')).toBe('/о-компании');
      expect(request.credentials).toBe('omit');
      return HttpResponse.json({ success: true, data: publicPayloadFixture });
    }));
    await expect(publicHoldingSiteService.getSiteData('/%D0%BE-%D0%BA%D0%BE%D0%BC%D0%BF%D0%B0%D0%BD%D0%B8%D0%B8', '')).resolves.toEqual(publicPayloadFixture);
  });

  it.each([
    ['?lang=en_US&preview=true&token=private', 'en_US'],
    ['?locale=ru&lang=en_US&preview=true&token=private', 'ru'],
  ])('sends the API locale for %s while preserving preview and the path', async (search, locale) => {
    server.use(http.get('https://api.example.test/api/v1/landing/holding/public/site-data', ({ request }) => {
      const params = new URL(request.url).searchParams;
      expect(params.get('locale')).toBe(locale);
      expect(params.has('lang')).toBe(false);
      expect(params.get('path')).toBe('/en_US/about');
      expect(params.get('site_domain')).toBe('localhost');
      expect(params.get('preview')).toBe('true');
      expect(params.get('token')).toBe('private');
      return HttpResponse.json({ success: true, data: publicPayloadFixture });
    }));
    await expect(publicHoldingSiteService.getSiteData('/en_US/about', search)).resolves.toEqual(publicPayloadFixture);
  });

  it('читает published runtime payload и отправляет лид на same-origin endpoints', async () => {
    const payload = await publicHoldingSiteService.getSiteData('/', '?preview=true');
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

  it('передаёт заявку с вложением как multipart', async () => {
    server.use(http.post('https://api.example.test/api/v1/landing/holding/public/site-leads', async ({ request }) => {
      expect(request.credentials).toBe('omit');
      const fields = await request.formData();
      expect(fields.get('site_domain')).toBe('localhost');
      expect(fields.get('work_type_id')).toBe('17');
      expect(fields.get('object_address')).toBe('Тестовый объект');
      expect(fields.get('submission_key')).toBe('7bdae8df-26c1-4f83-bb6f-e3b021b1fe6f');
      expect((fields.get('attachments[]') as File).name).toBe('brief.pdf');
      return HttpResponse.json({ success: true, data: { id: 42 } }, { status: 201 });
    }));
    await expect(publicHoldingSiteService.submitLead({
      name: 'Заказчик', phone: '+79991234567', message: 'Ремонт фасада',
      submission_key: '7bdae8df-26c1-4f83-bb6f-e3b021b1fe6f',
      work_type_id: 17, object_address: 'Тестовый объект',
      attachments: [new File(['%PDF'], 'brief.pdf', { type: 'application/pdf' })],
    })).resolves.toEqual({ id: 42 });
  });
});
