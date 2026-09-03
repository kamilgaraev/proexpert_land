import { useEffect } from "react";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import ContactForm from "@/components/landing/ContactForm";
import {
  MarketingLink,
  PageHero,
} from "@/components/marketing/MarketingPrimitives";
import { marketingPaths, marketingSeo } from "@/data/marketingRegistry";
import useAnalytics from "@/hooks/useAnalytics";
import { useSEO } from "@/hooks/useSEO";
import "@/styles/marketing-product-story.css";

const companySolutions = [
  {
    id: "contractor",
    title: "Подрядчику",
    description:
      "Ведите работы, заявки на материалы и расчёты по каждому объекту. Прораб фиксирует выполненные объёмы, офис готовит документы, руководитель видит, что осталось сделать.",
    href: marketingPaths.contractors,
    link: "МОСТ для подрядчика",
  },
  {
    id: "general-contractor",
    title: "Генподрядчику",
    description:
      "Соберите график, обязательства субподрядчиков и замечания по качеству в одном проекте. Сопоставляйте выполненные работы с актами и оплатами.",
    href: marketingPaths.contractorControl,
    link: "Контроль субподрядчиков",
  },
  {
    id: "developer-holding",
    title: "Девелоперу и группе компаний",
    description:
      "Сравнивайте сроки и финансовые показатели объектов. Разделяйте доступ между организациями, сохраняя общую отчётность для управляющей команды.",
    href: marketingPaths.developers,
    link: "МОСТ для девелопера",
  },
  {
    id: "technical-customer",
    title: "Техническому заказчику",
    description:
      "Проверяйте ход работ, фиксируйте замечания и контролируйте их устранение. Документы и история приёмки остаются привязаны к объекту и ответственным.",
    href: marketingPaths.handoverAcceptance,
    link: "Приёмка и сдача объекта",
  },
];

const teamSolutions = [
  {
    id: "foreman",
    title: "Прораб",
    description:
      "Задачи бригадам, выполненные объёмы, фотографии и заявки с площадки.",
    href: marketingPaths.foremanSoftware,
  },
  {
    id: "engineering",
    title: "Инженер ПТО",
    description:
      "Версии проектных документов, замечания и комплекты для сдачи работ.",
    href: marketingPaths.ptoSoftware,
  },
  {
    id: "procurement",
    title: "Снабженец",
    description:
      "Потребности объектов, закупки, поставки и остатки материалов.",
    href: marketingPaths.constructionProcurement,
  },
  {
    id: "management",
    title: "Руководитель строительства",
    description:
      "План и факт по срокам, затратам и обязательствам участников проекта.",
    href: marketingPaths.constructionBudgetControl,
  },
  {
    id: "quality-handover",
    title: "Специалист стройконтроля",
    description: "Инспекции, дефекты, ответственные и повторные проверки.",
    href: marketingPaths.constructionQualityControl,
  },
  {
    id: "safety",
    title: "Специалист по охране труда",
    description:
      "Инструктажи, допуски, нарушения и сроки устранения предписаний.",
    href: marketingPaths.constructionSafety,
  },
  {
    id: "resources",
    title: "Руководитель участка",
    description:
      "Смены техники, простои, наряды и фактическая выработка бригад.",
    href: marketingPaths.machineryAndLabor,
  },
  {
    id: "changes",
    title: "Руководитель проекта",
    description:
      "Запросы заказчику, дополнительные работы и согласованные изменения.",
    href: marketingPaths.changeControl,
  },
];

const SolutionsPage = () => {
  useSEO({ ...marketingSeo.solutions, type: "website" });
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView("marketing_solutions");
  }, [trackPageView]);

  return (
    <div className="marketing-page-shell">
      <PageHero
        eyebrow="Решения"
        title="У каждого своя работа. Объект — общий."
        description="МОСТ объединяет участников строительства: от прораба на площадке до руководителя группы компаний. Выберите задачи, которые хотите вести в системе."
        actions={[
          { label: "Подобрать решение", href: "#contact-form", primary: true },
          { label: "Возможности МОСТ", href: marketingPaths.features },
        ]}
        nav={[
          { label: "Для компании", href: "#solutions" },
          { label: "Для сотрудников", href: "#team" },
          { label: "С чего начать", href: "#start" },
        ]}
      />

      <section id="solutions" className="most-content-section">
        <div className="most-container">
          <div className="most-content-lead">
            <h2>Какая у вас компания?</h2>
            <p>
              У подрядчика и заказчика разные обязанности. Выбирайте решение по
              тому, за какие работы, документы и расчёты отвечаете вы.
            </p>
          </div>
          <div className="most-solution-list">
            {companySolutions.map((item) => (
              <article
                id={item.id}
                key={item.id}
                className="most-solution-item"
              >
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <MarketingLink href={item.href} className="most-text-link">
                  {item.link}{" "}
                  <span aria-hidden="true">
                    <ArrowUpRightIcon className="most-icon" />
                  </span>
                </MarketingLink>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="team" className="most-content-section">
        <div className="most-container most-product-story">
          <div className="most-product-story-scene">
            <div className="most-content-lead">
              <h2>Что нужно вашей команде?</h2>
              <p>
                Сотрудники работают с данными своего участка. Коллегам доступны
                сведения, на которые у них есть права: заявки, документы,
                статусы и результаты работ.
              </p>
            </div>
            <figure>
              <img
                src="/images/marketing/most-frame-story-1440.webp"
                srcSet="/images/marketing/most-frame-story-720.webp 720w, /images/marketing/most-frame-story-1440.webp 1440w"
                sizes="(max-width: 1080px) 100vw, 48vw"
                width={1440}
                height={810}
                loading="lazy"
                decoding="async"
                alt=""
              />
              <figcaption>
                Один объект объединяет работу разных специалистов.
              </figcaption>
            </figure>
          </div>
          <div className="most-solution-list">
            {teamSolutions.map((item) => (
              <article
                id={item.id}
                key={item.id}
                className="most-solution-item"
              >
                <h3>
                  <MarketingLink href={item.href} className="most-text-link">
                    {item.title}{" "}
                    <span aria-hidden="true">
                      <ArrowUpRightIcon className="most-icon" />
                    </span>
                  </MarketingLink>
                </h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="start" className="most-content-section">
        <div className="most-container most-content-columns">
          <div>
            <h2>Начните с одного объекта и одной задачи.</h2>
            <p>
              Например, с заявок на материалы. Прораб создаёт заявку, снабженец
              готовит закупку, склад фиксирует поступление. Так команда
              осваивает систему на знакомой работе.
            </p>
          </div>
          <div>
            <h3>Подключайте остальные функции по мере необходимости.</h3>
            <p>
              В МОСТ есть бесплатная основа для организации, команды и проектов.
              Пакеты для работ, снабжения, финансов и других задач выбираются
              отдельно. Условия и стоимость доступны до подключения.
            </p>
            <MarketingLink
              href={marketingPaths.pricing}
              className="most-text-link"
            >
              Тарифы и состав пакетов{" "}
              <span aria-hidden="true">
                <ArrowUpRightIcon className="most-icon" />
              </span>
            </MarketingLink>
          </div>
        </div>
      </section>

      <section id="contact" className="most-content-section most-content-tint">
        <div className="most-container most-content-columns">
          <div>
            <h2>Покажем МОСТ на задачах вашей команды.</h2>
            <p>
              Напишите, чем занимается компания и что хотите упорядочить: работу
              на объектах, снабжение, документы или расчёты. Это поможет
              подготовить демонстрацию.
            </p>
          </div>
          <div id="contact-form" className="most-solutions-form-anchor">
            <ContactForm variant="compact" className="most-contact-form" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default SolutionsPage;
