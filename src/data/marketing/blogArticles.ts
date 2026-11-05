import type {
  MarketingBlogArticleReference,
  MarketingContentLink,
} from "../../types/marketing";

export const marketingBlogArticles = {
  foremanOrder: {
    title: "Общий журнал работ: образцы заполнения и ведение в 2026 году",
    href: "/blog/obshchiy-zhurnal-rabot-v-stroitelstve",
    purpose: "Три примера записей и порядок подготовки данных с площадки.",
  },
  ptoWorkspace: {
    title:
      "Исполнительная документация в строительстве: состав, реестр и ведение в 2026 году",
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
  foremanAi: {
    title:
      "ИИ для прораба: отчёт за день, заявка на материалы и план работ",
    href: "/blog/ii-dlya-proraba",
    purpose:
      "Как ИИ помогает прорабу готовить отчёт за день, заявку и план работ.",
  },
  estimateFromPdf: {
    title:
      "Как нейросеть составляет смету по PDF и как проверить результат",
    href: "/blog/neyroset-dlya-smety-po-pdf",
    purpose:
      "Как нейросеть разбирает смету по PDF и как проверить результат.",
  },
  rfiRequests: {
    title:
      "RFI в строительстве: что это, как оформить запрос и не сорвать сроки",
    href: "/blog/rfi-v-stroitelstve",
    purpose:
      "Как оформить запрос на разъяснение и вести реестр RFI по объекту.",
  },
  contractorOversight: {
    title:
      "Контроль подрядчиков в строительстве: что проверять и как не потерять сроки и деньги",
    href: "/blog/kontrol-podryadchikov-v-stroitelstve",
    purpose:
      "Что проверять у подрядчика по срокам, объёмам, качеству и оплате.",
  },
  procurementProcess: {
    title:
      "Снабжение в строительстве: как организовать процесс и выбрать программу",
    href: "/blog/snabzhenie-v-stroitelstve",
    purpose:
      "Как выстроить снабжение от заявки до поставки и выбрать программу.",
  },
  materialAccountingM29: {
    title:
      "Учёт материалов на строительном объекте: М-29, остатки и списание",
    href: "/blog/uchet-materialov-na-obekte-stroitelstva",
    purpose:
      "Как вести учёт материалов на объекте и отчёт М-29 о расходе.",
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
