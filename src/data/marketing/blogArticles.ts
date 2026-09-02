import type {
  MarketingBlogArticleReference,
  MarketingContentLink,
} from "../../types/marketing";

export const marketingBlogArticles = {
  foremanOrder: {
    title:
      "Общий журнал работ в строительстве: как вести и заполнять в 2026 году",
    href: "/blog/obshchiy-zhurnal-rabot-v-stroitelstve",
    purpose: "Как фиксировать выполненные работы и вести записи с площадки.",
  },
  ptoWorkspace: {
    title:
      "Исполнительная документация в строительстве: состав, ведение и электронный формат в 2026 году",
    href: "/blog/ispolnitelnaya-dokumentaciya-v-stroitelstve",
    purpose:
      "Как собирать исполнительную документацию по мере выполнения работ.",
  },
  managerMorning: {
    title:
      "План-факт в строительстве: как контролировать сроки, объемы и бюджет",
    href: "/blog/plan-fakt-v-stroitelstve",
    purpose:
      "Какие отклонения по срокам, объёмам и бюджету проверять руководителю.",
  },
  procurementChats: {
    title:
      "Заявка на материалы в строительстве: образец, обязательные поля и маршрут согласования",
    href: "/blog/zayavka-na-materialy-v-stroitelstve",
    purpose:
      "Что указать в заявке и как провести её от потребности до поставки.",
  },
  contractorControl: {
    title:
      "График производства работ в строительстве: как составить, вести и обновлять по факту",
    href: "/blog/grafik-proizvodstva-rabot-v-stroitelstve",
    purpose:
      "Как связать последовательность работ, ответственность и фактические сроки.",
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
