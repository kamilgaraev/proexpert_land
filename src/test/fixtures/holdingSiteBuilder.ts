import type {
  BuilderWorkspaceData,
  LeadEntry,
  LeadSummary,
  PublicSitePayload,
} from '@/types/holding-site-builder';

export const createWorkspaceFixture = (): BuilderWorkspaceData => ({
  site: {
    id: 1,
    organization_group_id: 77,
    domain: 'alpha.prohelper.pro',
    title: 'Alpha Holding',
    description: 'Описание холдинга',
    logo_url: null,
    favicon_url: null,
    theme_config: {
      primary_color: '#2563eb',
      secondary_color: '#64748b',
      accent_color: '#f59e0b',
      background_color: '#ffffff',
      text_color: '#111827',
      font_family: 'Inter, sans-serif',
      font_size_base: '16px',
      border_radius: '16px',
      shadow_style: 'soft',
    },
    seo_meta: {
      title: 'Alpha Holding',
      description: 'SEO описание',
      keywords: 'holding, construction',
      og_title: 'Alpha Holding',
      og_description: 'SEO описание',
      og_image: null,
    },
    analytics_config: {},
    status: 'draft',
    is_active: true,
    is_published: false,
    published_at: null,
    url: 'https://alpha.prohelper.pro',
    preview_url: 'https://alpha.prohelper.pro/?preview=true&token=preview-token',
    lead_endpoint: '/api/site-leads',
    created_at: '2026-03-21T10:00:00.000000Z',
    updated_at: '2026-03-21T10:00:00.000000Z',
  },
  blocks: [
    {
      id: 10,
      type: 'hero',
      source_type: 'hero',
      key: 'hero_10',
      title: 'Главный баннер',
      content: {
        title: 'Alpha Holding',
        subtitle: 'Управляем проектами',
        description: 'Комплексный строительный холдинг',
        button_text: 'Оставить заявку',
        button_url: '#lead-form',
        background_image: '',
      },
      resolved_content: {
        title: 'Alpha Holding',
        subtitle: 'Управляем проектами',
        description: 'Комплексный строительный холдинг',
        button_text: 'Оставить заявку',
        button_url: '#lead-form',
        background_image: '',
      },
      settings: {
        variant: 'split',
        theme: 'primary',
      },
      bindings: {
        title: {
          mode: 'hybrid',
          source: 'organization.name',
        },
      },
      sort_order: 1,
      is_active: true,
      status: 'draft',
      published_at: null,
      schema: {
        title: {
          type: 'string',
          required: true,
        },
      },
      default_content: {
        title: '',
      },
      can_delete: true,
      is_renderable: true,
      assets: [],
    },
  ],
  assets: [],
  templates: [],
  summary: {
    blocks_count: 1,
    active_blocks_count: 1,
    assets_count: 0,
    leads_count: 0,
    last_published_at: null,
  },
  publication: {
    status: 'draft',
    is_published: false,
    published_at: null,
    preview_url: 'https://alpha.prohelper.pro/?preview=true&token=preview-token',
    public_url: 'https://alpha.prohelper.pro',
    has_snapshot: false,
  },
});

export const createLeadSummaryFixture = (): LeadSummary => ({
  total: 3,
  new: 2,
  spam: 0,
  today: 1,
  week: 3,
  latest: '2026-03-21T11:00:00.000000Z',
});

export const createLeadFixture = (): LeadEntry => ({
  id: 501,
  block_key: 'lead_form_1',
  name: 'Иван',
  company: 'СтройТрест',
  email: 'ivan@example.com',
  phone: '+79990000000',
  message: 'Нужен сайт холдинга',
  form_payload: {
    name: 'Иван',
  },
  metadata: {},
  utm_params: {},
  source_page: 'holding-site',
  source_url: 'https://alpha.prohelper.pro',
  status: 'new',
  submitted_at: '2026-03-21T11:00:00.000000Z',
});

export const createPublicSitePayloadFixture = (): PublicSitePayload => {
  const workspace = createWorkspaceFixture();

  return {
    site: workspace.site,
    blocks: workspace.blocks.map((block) => ({
      id: block.id,
      type: block.type,
      key: block.key,
      title: block.title,
      content: block.resolved_content,
      settings: block.settings,
      sort_order: block.sort_order,
      assets: block.assets,
    })),
    organization: {
      holding: {
        id: 77,
        name: 'Alpha Holding',
        slug: 'alpha',
        description: 'Описание холдинга',
      },
      organization: {
        id: 1,
        name: 'Alpha Org',
        description: 'Описание холдинга',
        phone: '+79990000000',
        email: 'info@alpha.pro',
        address: 'Москва',
        city: 'Москва',
      },
    },
    runtime: {
      mode: 'published',
      lead_endpoint: '/api/site-leads',
      generated_at: '2026-03-21T11:00:00.000000Z',
    },
  };
};
