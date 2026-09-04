import type { CSSProperties } from "react";
import { ArrowUpRightIcon, PlusIcon } from "@heroicons/react/24/outline";
import ContactForm from "@/components/landing/ContactForm";
import {
  MarketingLink,
  PageHero,
  SectionHeader,
} from "@/components/marketing/MarketingPrimitives";
import {
  marketingSeoLandingPages,
  marketingSeo,
  marketingPaths,
} from "@/data/marketingRegistry";
import { useSEO } from "@/hooks/useSEO";
import "@/styles/marketing-scenarios.css";

type SeoClusterPageProps = {
  pageKey: keyof typeof marketingSeoLandingPages;
};

const materialScenarios = new Set([
  "material-accounting",
  "construction-procurement",
  "site-requests",
  "ai-estimates",
  "construction-budget-control",
  "construction-payments",
]);
const completedScenarios = new Set([
  "pto-software",
  "construction-documents",
  "pir-project-documentation",
  "handover-acceptance",
  "1c-integration",
]);

const editorialScenes: Partial<
  Record<
    keyof typeof marketingSeoLandingPages,
    { src: string; smallSrc: string; alt: string }
  >
> = {
  "construction-orders": {
    src: "/images/marketing/most-order-discussion-branded-v1.webp",
    smallSrc: "/images/marketing/most-order-discussion-branded-v1-720.webp",
    alt: "Заказчица и подрядчик обсуждают строительные работы по плану объекта",
  },
  subcontracting: {
    src: "/images/marketing/most-subcontract-walkthrough-branded-v1.webp",
    smallSrc: "/images/marketing/most-subcontract-walkthrough-branded-v1-720.webp",
    alt: "Руководитель проекта и субподрядчик осматривают участок электромонтажных работ",
  },
  "project-pulse": {
    src: "/images/marketing/most-project-observation-branded-v1.webp",
    smallSrc: "/images/marketing/most-project-observation-branded-v1-720.webp",
    alt: "Руководитель фотографирует ход фасадных работ на строительном объекте",
  },
  "construction-crm": {
    src: "/images/marketing/most-client-project-branded-v1.webp",
    smallSrc: "/images/marketing/most-client-project-branded-v1-720.webp",
    alt: "Менеджер и заказчик обсуждают план будущего объекта",
  },
  "construction-erp": {
    src: "/images/marketing/most-resource-planning-branded-v1.webp",
    smallSrc: "/images/marketing/most-resource-planning-branded-v1-720.webp",
    alt: "Руководители сверяют план работ, документы и образцы материалов",
  },
  "1c-integration": {
    src: "/images/marketing/most-accounting-reconciliation-branded-v1.webp",
    smallSrc:
      "/images/marketing/most-accounting-reconciliation-branded-v1-720.webp",
    alt: "Специалист сверяет строки двух учётных документов",
  },
  "contractor-marketplace": {
    src: "/images/marketing/most-contractor-portfolios-branded-v1.webp",
    smallSrc:
      "/images/marketing/most-contractor-portfolios-branded-v1-720.webp",
    alt: "Менеджеры сравнивают портфолио подрядчиков и образцы отделочных материалов",
  },
  "construction-tenders": {
    src: "/images/marketing/most-tender-review-branded-v1.webp",
    smallSrc: "/images/marketing/most-tender-review-branded-v1-720.webp",
    alt: "Тендерная комиссия сверяет предложения и образцы строительных материалов",
  },
  "find-contractor": {
    src: "/images/marketing/most-contractor-shortlist-branded-v1.webp",
    smallSrc: "/images/marketing/most-contractor-shortlist-branded-v1-720.webp",
    alt: "Специалисты выбирают подрядчика по плану участка и фотографиям выполненных работ",
  },
  "construction-brigades": {
    src: "/images/marketing/most-crew-scope-branded-v1.webp",
    smallSrc: "/images/marketing/most-crew-scope-branded-v1-720.webp",
    alt: "Прораб и бригада сверяют участок отделочных работ с планом помещения",
  },
  "renovation-orders": {
    src: "/images/marketing/most-renovation-scope-branded-v1.webp",
    smallSrc: "/images/marketing/most-renovation-scope-branded-v1-720.webp",
    alt: "Заказчица и подрядчик обсуждают отделочные материалы и план ремонта",
  },
  "material-accounting": {
    src: "/images/marketing/most-stock-count-branded-v2.webp",
    smallSrc: "/images/marketing/most-stock-count-branded-v2-720.webp",
    alt: "Кладовщик сверяет количество блоков на напольных паллетах",
  },
  "pir-project-documentation": {
    src: "/images/marketing/most-design-review-branded-v1.webp",
    smallSrc: "/images/marketing/most-design-review-branded-v1-720.webp",
    alt: "Проектировщик проверяет чертежи и отмечает детали для уточнения",
  },
  "change-control": {
    src: "/images/marketing/most-change-discussion-branded-v1.webp",
    smallSrc: "/images/marketing/most-change-discussion-branded-v1-720.webp",
    alt: "Инженеры обсуждают расположение проёма и сверяют его с чертежом",
  },
  "machinery-and-labor": {
    src: "/images/marketing/most-machinery-shift-branded-v1.webp",
    smallSrc: "/images/marketing/most-machinery-shift-branded-v1-720.webp",
    alt: "Сотрудник проверяет сменный лист рядом с припаркованным экскаватором",
  },
  "construction-safety": {
    src: "/images/marketing/most-safety-walkway-branded-v1.webp",
    smallSrc: "/images/marketing/most-safety-walkway-branded-v1-720.webp",
    alt: "Специалист по охране труда осматривает проход и ограждение на площадке",
  },
  "handover-acceptance": {
    src: "/images/marketing/most-handover-window-branded-v3.webp",
    smallSrc: "/images/marketing/most-handover-window-branded-v3-720.webp",
    alt: "Специалисты проверяют окно и документы в готовом помещении перед сдачей",
  },
  "foreman-software": {
    src: "/images/marketing/most-foreman-planning-branded-v1.webp",
    smallSrc: "/images/marketing/most-foreman-planning-branded-v1-720.webp",
    alt: "Прораб сверяет задание на закреплённом чертеже с участком работ",
  },
  "mobile-app": {
    src: "/images/marketing/most-mobile-photo-branded-v2.webp",
    smallSrc: "/images/marketing/most-mobile-photo-branded-v2-720.webp",
    alt: "Инженер фотографирует участок строительства с телефона",
  },
  "workforce-management": {
    src: "/images/marketing/most-workforce-briefing-branded-v2.webp",
    smallSrc: "/images/marketing/most-workforce-briefing-branded-v2-720.webp",
    alt: "Прораб и бригада обсуждают задание по плану перед началом смены",
  },
  "construction-budget-control": {
    src: "/images/marketing/most-budget-review-branded-v1.webp",
    smallSrc: "/images/marketing/most-budget-review-branded-v1-720.webp",
    alt: "Финансовый специалист и руководитель проекта проверяют бюджет в офисе у стройплощадки",
  },
  "construction-payments": {
    src: "/images/marketing/most-payment-review-branded-v2.webp",
    smallSrc: "/images/marketing/most-payment-review-branded-v2-720.webp",
    alt: "Специалист сверяет счёт с накладной перед согласованием оплаты",
  },
  "ai-estimates": {
    src: "/images/marketing/most-estimate-review-branded-v1.webp",
    smallSrc: "/images/marketing/most-estimate-review-branded-v1-720.webp",
    alt: "Сметчик сверяет исходный чертёж и рабочие записи за столом",
  },
  "pto-software": {
    src: "/images/marketing/most-pto-inspection-v2.webp",
    smallSrc: "/images/marketing/most-pto-inspection-v2-720.webp",
    alt: "Инженер сопоставляет чертёж на закреплённом планшете с бетонной конструкцией на объекте",
  },
  "construction-procurement": {
    src: "/images/marketing/most-procurement-receiving-v1.webp",
    smallSrc: "/images/marketing/most-procurement-receiving-v1-720.webp",
    alt: "Сотрудник сверяет поставку арматуры и кладочных блоков на площадке",
  },
  "contractor-control": {
    src: "/images/marketing/most-contractor-inspection-v2.webp",
    smallSrc: "/images/marketing/most-contractor-inspection-v2-720.webp",
    alt: "Специалист проверяет вертикальность кладки строительным уровнем",
  },
  "construction-documents": {
    src: "/images/marketing/most-document-versions-branded-v1.webp",
    smallSrc: "/images/marketing/most-document-versions-branded-v1-720.webp",
    alt: "Специалист сравнивает рабочие чертежи рядом с папкой МОСТ",
  },
  "site-requests": {
    src: "/images/marketing/most-site-request-branded-v3.webp",
    smallSrc: "/images/marketing/most-site-request-branded-v3-720.webp",
    alt: "Прораб с планшетом проверяет наличие материалов на площадке",
  },
  "construction-quality-control": {
    src: "/images/marketing/most-quality-defect-branded-v1.webp",
    smallSrc: "/images/marketing/most-quality-defect-branded-v1-720.webp",
    alt: "Инженер осматривает отмеченный скол бетонной ступени",
  },
};

const SeoClusterPage = ({ pageKey }: SeoClusterPageProps) => {
  const page = marketingSeoLandingPages[pageKey];
  const editorialScene = editorialScenes[pageKey];
  const scene = materialScenarios.has(pageKey)
    ? "material"
    : completedScenarios.has(pageKey)
      ? "completed"
      : "frame";
  const stageStyle = {
    "--scenario-stage-count": page.workflow?.stages.length ?? 1,
  } as CSSProperties;

  useSEO({ ...marketingSeo[pageKey], type: "website" });

  return (
    <div className="marketing-page-shell most-scenario">
      <PageHero
        title={page.title}
        description={page.description}
        actions={[
          {
            label: "Запросить демонстрацию",
            href: "#contact-form",
            primary: true,
          },
          { label: "Смотреть все решения", href: marketingPaths.solutions },
        ]}
        nav={[
          { label: "Задачи команды", href: "#audience" },
          {
            label: "Порядок работы",
            href: page.workflow ? "#workflow" : "#process-comparison",
          },
          { label: "Возможности", href: "#automation" },
          { label: "Вопросы и условия", href: "#faq" },
        ]}
        aside={
          <figure
            className={`most-scenario-scene${editorialScene ? " most-scenario-photo" : ""}`}
            aria-hidden={editorialScene ? undefined : true}
          >
            <img
              src={
                editorialScene?.src ??
                `/images/marketing/most-${scene}-story-1440.webp`
              }
              srcSet={
                editorialScene
                  ? `${editorialScene.smallSrc} 720w, ${editorialScene.src} 1536w`
                  : `/images/marketing/most-${scene}-story-720.webp 720w, /images/marketing/most-${scene}-story-1440.webp 1440w`
              }
              sizes="(max-width: 1079px) calc(100vw - 40px), 48vw"
              width={editorialScene ? 1536 : 1672}
              height={editorialScene ? 1024 : 941}
              alt={editorialScene?.alt ?? ""}
              fetchPriority="high"
              decoding="async"
            />
          </figure>
        }
      />

      <section id="audience" className="most-scenario-section">
        <div className="most-container most-scenario-context">
          <div>
            <SectionHeader
              title={page.audienceTitle}
              description={page.audienceDescription}
            />
            <ul className="most-scenario-lines">
              {page.audiences.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div id="problems">
            <SectionHeader
              title={page.problemTitle}
              description={page.problemDescription}
            />
            <ul className="most-scenario-lines">
              {page.problems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="most-scenario-section most-scenario-workflow">
        <div className="most-container">
          {page.workflow ? (
            <div id="workflow">
              <SectionHeader
                title={page.workflow.title}
                description={page.workflow.description}
              />
              <ol className="most-scenario-stages" style={stageStyle}>
                {page.workflow.stages.map((stage, index) => (
                  <li key={stage.label}>
                    <span className="most-scenario-step" aria-hidden="true">
                      {index + 1}
                    </span>
                    <h3>{stage.label}</h3>
                    <p>{stage.description}</p>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          <div id="process-comparison" className="most-scenario-records">
            <div>
              <h2 className="most-scenario-record-title">
                {page.processComparison.title}
              </h2>
              <p className="most-scenario-record-description">
                {page.processComparison.description}
              </p>
            </div>
            <dl className="most-scenario-facts">
              {page.processComparison.metrics.map((metric) => (
                <div key={metric.label}>
                  <dt>{metric.label}</dt>
                  <dd>
                    <h3>{metric.value}</h3>
                    <p>{metric.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
            {page.processComparison.note ? (
              <p className="most-scenario-record-note">
                {page.processComparison.note}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section id="automation" className="most-scenario-section">
        <div className="most-container most-scenario-context">
          <div>
            <SectionHeader
              title={page.visibilityTitle}
              description={page.visibilityDescription}
            />
            <div className="most-scenario-faq-list most-scenario-operation-detail">
              <details>
                <summary>
                  <span>{page.automationTitle}</span>
                  <PlusIcon className="most-icon" aria-hidden="true" />
                </summary>
                <p>{page.automationDescription}</p>
                <ul className="most-scenario-lines">
                  {page.automations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </details>
            </div>
          </div>
          <div>
            <dl className="most-scenario-roles">
              {page.roleViews.map((item) => (
                <div key={item.role}>
                  <dt>{item.role}</dt>
                  <dd>{item.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section id="trust" className="most-scenario-section">
        <div className="most-container">
          {page.trust ? (
            <div className="most-scenario-conditions">
              <SectionHeader
                title={page.trust.title}
                description={page.trust.description}
              />
              <div className="most-scenario-context">
                {[
                  { title: page.trust.fitForTitle, items: page.trust.fitFor },
                  { title: page.trust.cautionTitle, items: page.trust.caution },
                  {
                    title: page.trust.firstStepTitle,
                    items: page.trust.firstStep,
                  },
                ].map((group) => (
                  <div key={group.title}>
                    <h3>{group.title}</h3>
                    <ul className="most-scenario-lines">
                      {group.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <div id="faq" className="most-scenario-faq">
            <SectionHeader title="Что важно перед началом работы" />
            <div className="most-scenario-faq-list">
              {page.faq.map((item) => (
                <details key={item.question}>
                  <summary>
                    <span>{item.question}</span>
                    <PlusIcon className="most-icon" aria-hidden="true" />
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="most-scenario-section most-scenario-contact"
      >
        <div className="most-container most-scenario-contact-layout">
          <div>
            <SectionHeader
              title="Покажем МОСТ на вашей задаче"
              description="Расскажите, как организована работа сейчас и что хотите изменить."
            />
            <ul className="most-scenario-lines">
              {page.contactHighlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div id="contact-form">
            <ContactForm
              variant="compact"
              className="most-contact-form most-scenario-form"
            />
          </div>
        </div>
      </section>

      <section className="most-scenario-section most-scenario-related">
        <div className="most-container most-scenario-context">
          <div>
            <h2>Связанные задачи</h2>
            <div className="most-scenario-links">
              {page.relatedLinks.map((link) => (
                <MarketingLink key={link.href + link.label} href={link.href}>
                  <span>
                    <strong>{link.label}</strong>
                    <span>{link.description}</span>
                  </span>
                  <ArrowUpRightIcon className="most-icon" aria-hidden="true" />
                </MarketingLink>
              ))}
            </div>
          </div>
          <div>
            <h2>По теме</h2>
            <div className="most-scenario-links">
              {page.blogLinks.map((link) => (
                <MarketingLink key={link.href + link.label} href={link.href}>
                  <span>
                    <strong>{link.label}</strong>
                    <span>{link.description}</span>
                  </span>
                  <ArrowUpRightIcon className="most-icon" aria-hidden="true" />
                </MarketingLink>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SeoClusterPage;
