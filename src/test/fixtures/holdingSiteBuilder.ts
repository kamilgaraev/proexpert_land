import type {
  BuilderWorkspaceData,
  EditorPage,
  EditorSection,
  LeadEntry,
  LeadSummary,
  PublicSitePayload,
} from '@/types/holding-site-builder';

const createHeroSection = (): EditorSection => ({
  id: 10,
  page_id: 100,
  type: 'hero',
  source_type: 'hero',
  key: 'hero_10',
  title: 'Hero',
  content: {
    title: 'Alpha Holding',
    subtitle: 'We manage complex projects',
    description: 'Modern multi-page builder workspace',
    button_text: 'Contact us',
    button_url: '#lead-form',
    background_image: '',
  },
  resolved_content: {
    title: 'Alpha Holding',
    subtitle: 'We manage complex projects',
    description: 'Modern multi-page builder workspace',
    button_text: 'Contact us',
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
  locale_content: {
    ru: {
      title: 'Alpha Holding',
    },
  },
  style_config: {
    spacing: 'xl',
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
  elements: [
    {
      id: 'hero-title',
      type: 'text',
      label: 'Title',
      path: 'content.title',
      props: {
        value: 'Alpha Holding',
      },
      bindings: {
        mode: 'hybrid',
        source: 'organization.name',
      },
      style: {},
      responsive: {},
      animation: {},
    },
  ],
});

const createHomePage = (): EditorPage => ({
  id: 100,
  page_type: 'home',
  slug: '/',
  navigation_label: 'Home',
  title: 'Home',
  description: 'Home page',
  seo_meta: {
    title: 'Alpha Holding',
    description: 'SEO description',
    keywords: 'holding, construction',
  },
  layout_config: {
    container: 'wide',
  },
  locale_content: {
    ru: {
      title: 'Home',
    },
  },
  visibility: 'public',
  sort_order: 1,
  is_home: true,
  is_active: true,
  sections: [createHeroSection()],
});

export const createWorkspaceFixture = (): BuilderWorkspaceData => {
  const homePage = createHomePage();

  return {
    site: {
      id: 1,
      organization_group_id: 77,
      domain: 'alpha.prohelper.pro',
      default_locale: 'ru',
      enabled_locales: ['ru', 'en'],
      title: 'Alpha Holding',
      description: 'Holding profile',
      logo_url: null,
      favicon_url: null,
      theme_config: {
        primary_color: '#2563eb',
        secondary_color: '#64748b',
        accent_color: '#f59e0b',
        background_color: '#ffffff',
        text_color: '#111827',
        font_family: 'Manrope, sans-serif',
        font_size_base: '16px',
        border_radius: '20px',
        shadow_style: 'soft',
        surface_style: 'glass',
        container_width: '1280px',
        section_spacing: '120px',
      },
      seo_meta: {
        title: 'Alpha Holding',
        description: 'SEO description',
        keywords: 'holding, construction',
        og_title: 'Alpha Holding',
        og_description: 'SEO description',
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
      current_locale: 'ru',
      created_at: '2026-03-21T10:00:00.000000Z',
      updated_at: '2026-03-21T10:00:00.000000Z',
    },
    pages: [homePage],
    blocks: homePage.sections,
    assets: [],
    templates: [],
    page_templates: [
      {
        id: 'corporate',
        name: 'Corporate',
        description: 'Home, services and contacts',
        pages: [
          {
            page_type: 'home',
            slug: '/',
            title: 'Home',
          },
          {
            page_type: 'services',
            slug: 'services',
            title: 'Services',
          },
        ],
      },
    ],
    section_presets: [],
    collaborators: [
      {
        id: 1,
        role: 'owner',
        user: {
          id: 501,
          name: 'Owner',
          email: 'owner@example.com',
        },
        created_at: '2026-03-21T10:00:00.000000Z',
      },
    ],
    revisions: [
      {
        id: 301,
        kind: 'published',
        label: 'Initial publish',
        created_at: '2026-03-21T11:00:00.000000Z',
        creator: {
          id: 501,
          name: 'Owner',
          email: 'owner@example.com',
        },
      },
    ],
    blog: {
      articles: [
        {
          id: 900,
          title: 'Alpha launch',
          slug: 'alpha-launch',
          excerpt: 'Launch notes',
          content: 'Launch article',
          status: 'published',
          published_at: '2026-03-21T11:00:00.000000Z',
          reading_time: 2,
          is_featured: true,
          category: {
            id: 7,
            name: 'News',
            slug: 'news',
          },
          author: {
            id: 501,
            name: 'Owner',
          },
        },
      ],
      default_category: {
        id: 7,
        name: 'News',
      },
    },
    summary: {
      blocks_count: 1,
      active_blocks_count: 1,
      assets_count: 0,
      leads_count: 0,
      pages_count: 1,
      collaborators_count: 1,
      blog_articles_count: 1,
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
  };
};

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
  page_id: 100,
  block_key: 'lead_form_1',
  section_key: 'lead_form_1',
  locale_code: 'ru',
  name: 'Ivan',
  company: 'StroyTrest',
  email: 'ivan@example.com',
  phone: '+79990000000',
  message: 'Need a holding website',
  form_payload: {
    name: 'Ivan',
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
  const currentPage = workspace.pages[0] ?? null;

  return {
    site: workspace.site,
    navigation: [
      {
        id: currentPage?.id ?? 100,
        slug: currentPage?.slug ?? '/',
        label: currentPage?.navigation_label ?? 'Home',
        page_type: currentPage?.page_type ?? 'home',
        is_home: currentPage?.is_home ?? true,
      },
    ],
    pages: workspace.pages,
    page: currentPage,
    current_page: currentPage,
    blocks: currentPage?.sections ?? [],
    organization: {
      holding: {
        id: 77,
        name: 'Alpha Holding',
        slug: 'alpha',
        description: 'Holding profile',
      },
      organization: {
        id: 1,
        name: 'Alpha Org',
        description: 'Holding profile',
        phone: '+79990000000',
        email: 'info@alpha.pro',
        address: 'Moscow',
        city: 'Moscow',
      },
    },
    blog: {
      articles: workspace.blog?.articles ?? [],
      current_article: null,
    },
    runtime: {
      mode: 'published',
      lead_endpoint: '/api/site-leads',
      generated_at: '2026-03-21T11:00:00.000000Z',
      path: '/',
      locale: 'ru',
    },
  };
};
