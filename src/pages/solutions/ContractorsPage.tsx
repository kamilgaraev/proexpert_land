import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import {
  MarketingLink,
  PageHero,
} from "@/components/marketing/MarketingPrimitives";
import { marketingPaths, marketingSeo } from "@/data/marketingRegistry";
import { useSEO } from "@/hooks/useSEO";
import "@/styles/marketing-segments.css";

const workflow = [
  {
    title: "Руководитель задаёт работу",
    description:
      "В объекте появляются этапы, плановые даты, задачи и ответственные. Бригада понимает, какой объём ей предстоит выполнить.",
    result: "В работе: задача, срок и исполнитель.",
  },
  {
    title: "Прораб передаёт потребность",
    description:
      "Прораб указывает материал, количество и срок. Снабженец связывает потребность с закупочной заявкой и организует заказ; после подтверждённой приёмки отражается приход на складе.",
    result: "По объекту: заявка, заказ и принятый материал.",
  },
  {
    title: "Площадка фиксирует выполнение",
    description:
      "Команда вносит фактический объём и прикладывает фотографии. Замечания и исправления остаются связаны с работой и ответственным.",
    result: "Для проверки: объём, фотографии и замечания.",
  },
  {
    title: "ПТО готовит документы",
    description:
      "Сотрудник с доступом выбирает подтверждённые работы для акта. Финансовая команда ведёт связанные платёжные документы; решение об оплате принимают ответственные.",
    result: "К закрытию этапа: проверенные работы и документы.",
  },
];

const relatedSolutions = [
  {
    label: "Работа прораба",
    href: marketingPaths.foremanSoftware,
    description: "Задачи, фотографии и производственный факт с площадки.",
  },
  {
    label: "Контроль подрядчиков",
    href: marketingPaths.contractorControl,
    description: "Ответственные, сроки, объёмы и замечания по работам.",
  },
  {
    label: "Материалы и склад",
    href: marketingPaths.materialAccounting,
    description: "От потребности объекта до приёмки и складского учёта.",
  },
  {
    label: "Исполнительная документация",
    href: marketingPaths.constructionDocuments,
    description: "Работы, акты и комплект документов по объекту.",
  },
];

const ContractorsPage = () => {
  useSEO({ ...marketingSeo.contractors, type: "website" });

  return (
    <div className="marketing-page-shell most-segment-page">
      <PageHero
        title="Подрядчик ведёт работу. МОСТ связывает её с результатом."
        description="Система управления строительством для подрядной организации: задачи бригад, материалы, выполненные объёмы и документы по каждому объекту. Площадка передаёт факт, офис готовит закрытие этапа."
        actions={[
          {
            label: "Обсудить свой объект",
            href: `${marketingPaths.contact}#contact-form`,
            primary: true,
          },
          { label: "Все решения", href: marketingPaths.solutions },
        ]}
        nav={[
          { label: "От задания до акта", href: "#workflow" },
          { label: "Начало работы", href: "#result" },
        ]}
      />

      <section id="focus" className="most-segment-section">
        <div className="most-container most-segment-story">
          <div className="most-segment-scene">
            <h2>Объём выполнен. Его нужно подтвердить.</h2>
            <p>
              Здание растёт по этапам. В МОСТ за каждым этапом остаются работа,
              исполнитель и записи, к которым можно вернуться при проверке.
            </p>
            <figure className="most-segment-photo">
              <img
                src="/images/marketing/most-contractors-report-branded-v1.webp"
                width="1536"
                height="1024"
                loading="lazy"
                decoding="async"
                alt="Прораб фотографирует смонтированные воздуховоды для отчёта о выполненной работе"
              />
            </figure>
            <dl className="most-segment-record">
              <div>
                <dt>Основа записи</dt>
                <dd>Объект, этап, работа</dd>
              </div>
              <div>
                <dt>Подтверждение</dt>
                <dd>Объём, фото, акт</dd>
              </div>
            </dl>
          </div>
          <ol id="workflow" className="most-segment-steps">
            {workflow.map((step) => (
              <li key={step.title}>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                <p className="most-segment-result">{step.result}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="result" className="most-segment-section">
        <div className="most-container most-segment-split">
          <div>
            <h2>Начните с одного рабочего этапа.</h2>
            <p>
              Выберите объект и работу, которую команда уже ведёт. На ней удобно
              разобрать роли, нужные данные и состав возможностей МОСТ.
            </p>
          </div>
          <dl className="most-segment-facts">
            <div>
              <dt>Кто передаёт факт</dt>
              <dd>
                Определите ответственных на площадке и сотрудников, которые
                проверяют объём, замечания и документы в офисе.
              </dd>
            </div>
            <div>
              <dt>Что требуется для закрытия</dt>
              <dd>
                Согласуйте, какие работы, фотографии и документы команда
                собирает по этапу. Проверка и решение о приёмке остаются за
                участниками.
              </dd>
            </div>
            <div>
              <dt>Какие возможности подключить</dt>
              <dd>
                Состав пакетов выбирается под задачи организации. Доступ
                сотрудников зависит от их прав и подключённых возможностей.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section id="related" className="most-segment-section">
        <div className="most-container">
          <h2>Разберите свою часть работы.</h2>
          <div className="most-segment-links">
            {relatedSolutions.map((item) => (
              <MarketingLink key={item.href} href={item.href}>
                <span>{item.label}</span>
                <ArrowUpRightIcon className="most-icon" aria-hidden="true" />
                <p>{item.description}</p>
              </MarketingLink>
            ))}
          </div>
        </div>
      </section>

      <div className="most-container">
        <section className="most-segment-contact">
          <h2>Покажем путь от задания до документов.</h2>
          <div>
            <p>
              Расскажите, какие работы выполняет ваша организация и где сейчас
              теряются сведения между площадкой и офисом.
            </p>
            <div className="most-page-actions">
              <MarketingLink
                href={`${marketingPaths.contact}#contact-form`}
                className="most-button most-button-orange"
              >
                Обсудить работу команды
                <ArrowUpRightIcon className="most-icon" aria-hidden="true" />
              </MarketingLink>
              <MarketingLink
                href={marketingPaths.pricing}
                className="most-text-link"
              >
                Состав и стоимость
                <ArrowUpRightIcon className="most-icon" aria-hidden="true" />
              </MarketingLink>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ContractorsPage;
