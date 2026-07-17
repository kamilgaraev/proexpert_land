import type { MarketingBlogArticleReference, MarketingContentLink } from '../../types/marketing';

export const marketingBlogArticles = {
  foremanOrder: {
    title: 'Как прорабу держать объект без хаоса',
    href: '/blog/kak-prorabu-derzhat-obekt-bez-haosa',
    purpose: 'Организация ежедневных задач и фиксации факта на площадке.',
  },
  ptoWorkspace: {
    title: 'Что должно быть у ПТО в одной системе',
    href: '/blog/chto-dolzhno-byt-u-pto-v-odnoy-sisteme',
    purpose: 'Рабочее пространство ПТО для документов, статусов и замечаний.',
  },
  managerMorning: {
    title: 'Что руководитель строительства должен видеть каждое утро',
    href: '/blog/chto-rukovoditel-stroitelstva-dolzhen-videt-kazhdoe-utro',
    purpose: 'Набор данных для ежедневной управленческой проверки объектов.',
  },
  procurementChats: {
    title: 'Как снабженцу перестать собирать заявки из чатов',
    href: '/blog/kak-snabzhentsu-perestat-sobirat-zayavki-iz-chatov',
    purpose: 'Порядок обработки заявок на материалы вне разрозненной переписки.',
  },
  contractorControl: {
    title: 'Как контролировать подрядчиков на объекте без разборок',
    href: '/blog/kak-kontrolirovat-podryadchikov-na-obekte-bez-razborok',
    purpose: 'Фиксация объёмов, сроков и замечаний в работе подрядчиков.',
  },
} as const satisfies Readonly<Record<string, MarketingBlogArticleReference>>;

export type MarketingBlogArticleKey = keyof typeof marketingBlogArticles;

export const getMarketingBlogLink = (
  key: MarketingBlogArticleKey,
  description = marketingBlogArticles[key].purpose,
): MarketingContentLink => ({
  label: marketingBlogArticles[key].title,
  href: marketingBlogArticles[key].href,
  description,
});
