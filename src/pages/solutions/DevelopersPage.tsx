import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import {
  MarketingLink,
  PageHero,
} from "@/components/marketing/MarketingPrimitives";
import { marketingPaths, marketingSeo } from "@/data/marketingRegistry";
import { useSEO } from "@/hooks/useSEO";
import "@/styles/marketing-segments.css";

const projectChecks = [
  {
    title: "Команда ведёт сроки и факт",
    description:
      "Плановые даты, задачи и выполненные объёмы относятся к объекту. Руководитель сопоставляет ход работ с планом и разбирает отклонения с ответственными.",
    result: "На проверке: этап, срок и фактический прогресс.",
  },
  {
    title: "Замечание получает ответственного",
    description:
      "Проектная команда фиксирует замечания и следит за исправлениями. При повторной проверке участник принимает решение, можно ли закрыть вопрос.",
    result: "По вопросу: ответственный, статус и результат проверки.",
  },
  {
    title: "Документы собираются по объекту",
    description:
      "Команда ведёт работы, акты и комплект документов. Готовность к сдаче проверяют по фактическим данным и открытым замечаниям; решение о приёмке принимает уполномоченный участник.",
    result: "К сдаче: документы, подтверждённые работы и открытые вопросы.",
  },
];

const relatedScenarios = [
  {
    label: "Объекты и ресурсы",
    href: marketingPaths.constructionErp,
    description: "Работы, документы, снабжение и финансовые данные объекта.",
  },
  {
    label: "Бюджет строительства",
    href: marketingPaths.constructionBudgetControl,
    description: "План, платёжные документы и отклонения по бюджету.",
  },
  {
    label: "Контроль подрядчиков",
    href: marketingPaths.contractorControl,
    description: "Сроки, исполнители, объёмы и замечания по работам.",
  },
  {
    label: "Обмен с другими системами",
    href: marketingPaths.integrations,
    description: "Состав и условия обмена данными для вашего процесса.",
  },
];

const DevelopersPage = () => {
  useSEO({ ...marketingSeo.developers, type: "website" });

  return (
    <div className="marketing-page-shell most-segment-page">
      <PageHero
        title="Застройщику — видеть объект за цифрами отчёта."
        description="МОСТ помогает застройщику и техническому заказчику вести сроки, замечания и документы по объектам. Команда фиксирует ход строительства, руководитель работает с доступными данными проектов."
        actions={[
          {
            label: "Обсудить свои объекты",
            href: `${marketingPaths.contact}#contact-form`,
            primary: true,
          },
          { label: "Для группы компаний", href: marketingPaths.enterprise },
        ]}
        nav={[
          { label: "Готовность объекта", href: "#capabilities" },
          { label: "Работа с портфелем", href: "#model" },
        ]}
      />

      <section id="capabilities" className="most-segment-section">
        <div className="most-container most-segment-story">
          <div className="most-segment-scene">
            <h2>За готовым зданием — проверенные работы.</h2>
            <p>
              Фасад уже может быть завершён, а вопросы по работам и документам —
              ещё открыты. МОСТ помогает рассматривать их вместе с ходом
              проекта.
            </p>
            <figure className="most-segment-photo">
              <img
                src="/images/marketing/most-developers-handover-branded-v1.webp"
                width="1536"
                height="1024"
                loading="lazy"
                decoding="async"
                alt="Специалист отмечает участок облицовки, который нужно проверить перед приёмкой"
              />
            </figure>
            <dl className="most-segment-record">
              <div>
                <dt>По объекту</dt>
                <dd>Сроки и выполненные работы</dd>
              </div>
              <div>
                <dt>Перед приёмкой</dt>
                <dd>Замечания и документы</dd>
              </div>
            </dl>
          </div>
          <ol className="most-segment-steps">
            {projectChecks.map((step) => (
              <li key={step.title}>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                <p className="most-segment-result">{step.result}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="model" className="most-segment-section">
        <div className="most-container most-segment-split">
          <div>
            <h2>От одного объекта — к портфелю.</h2>
            <p>
              Определите, какие сведения проектная команда ведёт на объекте, а
              какие нужны руководителю для сравнения проектов.
            </p>
          </div>
          <dl id="trust" className="most-segment-facts">
            <div>
              <dt>Общие правила работы</dt>
              <dd>
                Согласуйте статусы, плановые даты и порядок работы с
                замечаниями. Так команда понимает, какие сведения готовить по
                каждому объекту.
              </dd>
            </div>
            <div>
              <dt>Финансовые данные рядом с проектом</dt>
              <dd>
                Рассматривайте бюджет, обязательства и платёжные документы по
                объекту. Состав отчётности определяется доступными данными и
                подключёнными возможностями.
              </dd>
            </div>
            <div>
              <dt>Доступ по обязанностям</dt>
              <dd>
                Команда проекта и руководители получают права на нужные
                организации и объекты. Наличие объекта в портфеле не открывает
                его данные всем сотрудникам.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section id="related" className="most-segment-section">
        <div className="most-container">
          <h2>Что важно проверить в вашем проекте?</h2>
          <div className="most-segment-links">
            {relatedScenarios.map((item) => (
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
          <h2>Разберём данные одного объекта.</h2>
          <div>
            <p>
              Расскажите, какие сроки, замечания и документы команда собирает
              сейчас. Покажем соответствующие возможности МОСТ и обсудим
              отчётность для руководителя.
            </p>
            <div className="most-page-actions">
              <MarketingLink
                href={`${marketingPaths.contact}#contact-form`}
                className="most-button most-button-orange"
              >
                Обсудить задачи заказчика
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

export default DevelopersPage;
