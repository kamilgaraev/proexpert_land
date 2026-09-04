import { useEffect } from "react";
import { ArrowUpRightIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import CtaBand from "@/components/marketing/blocks/CtaBand";
import { PageHero } from "@/components/marketing/MarketingPrimitives";
import {
  marketingCapabilityMatrix,
  marketingPaths,
  marketingSeo,
} from "@/data/marketingRegistry";
import useAnalytics from "@/hooks/useAnalytics";
import { useSEO } from "@/hooks/useSEO";
import { useFittingSticky } from "@/hooks/useFittingSticky";
import "@/styles/marketing-product-story.css";

const dailyWork = [
  {
    id: "general-work-journal",
    title: "Электронный общий журнал работ",
    description:
      "Фиксируйте каждый рабочий день на объекте: выполненные объёмы, людей, технику, материалы, условия и замечания. Запись остаётся связана со сметой, графиком и исполнительными документами.",
    points: [
      "Ежедневные записи и фактические объёмы по участкам работ.",
      "Согласование записей с ответственными и историей решений.",
      "Связь со сметой, графиком, актами скрытых работ и экспортом.",
    ],
    href: marketingPaths.generalWorkJournal,
    link: "Как устроен общий журнал",
  },
  {
    id: "supply-chain",
    title: "Материалы и снабжение",
    description:
      "Собирайте потребности площадок и ведите закупки. Проверяйте остатки и движение материалов до следующей поставки.",
    points: [
      "Заявки с объекта с потребностью и сроком.",
      "Закупки, поставки и ответственные за снабжение.",
      "Остатки, поступления и перемещения на складах.",
    ],
    href: marketingPaths.constructionProcurement,
    link: "Как устроено снабжение",
  },
  {
    id: "finance-control",
    title: "Платежи и обязательства",
    description:
      "Связывайте финансовые документы с объектами, контрагентами и этапами работ. Проверяйте суммы, сроки и состояние платежей.",
    points: [
      "Платёжные документы по проектам и контрагентам.",
      "Акты, авансы и обязательства по объекту.",
      "Контроль бюджета и зафиксированных отклонений.",
    ],
    href: marketingPaths.constructionPayments,
    link: "Платежи в строительстве",
  },
];

const otherCapabilities = marketingCapabilityMatrix.filter(
  (item) => !dailyWork.some((workflow) => workflow.id === item.id),
);

const FeaturesPage = () => {
  useSEO({ ...marketingSeo.features, type: "website" });
  const { trackPageView } = useAnalytics();
  const story = useFittingSticky();
  useEffect(() => {
    trackPageView("marketing_features");
  }, [trackPageView]);

  return (
    <div className="marketing-page-shell">
      <PageHero
        eyebrow="Возможности МОСТ"
        title="Работы, материалы и деньги — по каждому объекту."
        description="Система управления строительством для ежедневной работы площадки и офиса. Ведите проект от первых задач и заявок до актов, платежей и приёмки."
        actions={[
          {
            label: "Посмотреть демо",
            href: marketingPaths.contact,
            primary: true,
          },
          { label: "Состав и стоимость", href: marketingPaths.pricing },
        ]}
        nav={[
          { label: "Ежедневная работа", href: "#work" },
          { label: "Другие направления", href: "#capabilities" },
          { label: "Доступ сотрудников", href: "#access" },
        ]}
      />

      <section id="work" className="most-content-section most-container">
        <div className="most-product-story">
          <div
            ref={story.ref}
            data-sticky={story.fits}
            className="most-product-story-scene"
          >
            <h2>От задачи на площадке до решения в офисе.</h2>
            <p className="most-content-lead">
              Команда вносит данные по ходу работы. Руководитель и смежные
              службы используют эти же записи — с учётом своих прав доступа.
            </p>
            <figure className="most-product-photo">
              <img
                src="/images/marketing/most-office-site-branded-v1.webp"
                width={1536}
                height={1024}
                loading="lazy"
                decoding="async"
                alt="Рабочее место координатора проекта в офисе рядом со строительной площадкой"
              />
              <figcaption>
                График, поставки и расчёты относятся к одному объекту.
              </figcaption>
            </figure>
          </div>
          <div className="most-feature-list">
            {dailyWork.map((item) => (
              <article key={item.id} className="most-feature-row">
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <Link to={item.href} className="most-text-link">
                    {item.link}{" "}
                    <span aria-hidden="true">
                      <ArrowUpRightIcon className="most-icon" />
                    </span>
                  </Link>
                </div>
                <ul>
                  {item.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="capabilities"
        className="most-content-section most-content-tint"
      >
        <div className="most-container most-capabilities-layout">
          <div>
            <h2>Подключайте то, что нужно вашей команде.</h2>
            <p className="most-content-lead">
              ПТО, стройконтроль, охрана труда и другие службы работают со
              своими разделами. Возможности подключаются пакетами по
              направлениям.
            </p>
            <Link to={marketingPaths.pricing} className="most-text-link">
              Выбрать пакеты{" "}
              <span aria-hidden="true">
                <ArrowUpRightIcon className="most-icon" />
              </span>
            </Link>
          </div>
          <div className="most-capability-details">
            {otherCapabilities.map((item) => (
              <details key={item.id}>
                <summary>
                  {item.title}
                  <span aria-hidden="true">
                    <PlusIcon className="most-icon" />
                  </span>
                </summary>
                {item.maturity !== "stable" ? (
                  <p className="most-availability">
                    Подключение по согласованию
                  </p>
                ) : null}
                <p>{item.summary}</p>
                <ul>
                  {item.outcomes.map((outcome) => (
                    <li key={outcome}>{outcome}</li>
                  ))}
                </ul>
                {item.maturity !== "stable" ? (
                  <Link to={marketingPaths.contact} className="most-text-link">
                    Обсудить подключение{" "}
                    <span aria-hidden="true">
                      <ArrowUpRightIcon className="most-icon" />
                    </span>
                  </Link>
                ) : null}
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="access" className="most-content-section most-container">
        <div className="most-content-columns">
          <div>
            <h2>Каждому сотруднику — свой доступ.</h2>
            <p>
              Прорабу нужны задачи и заявки его площадки. Финансовой службе —
              платежи и документы. Руководителю — данные по доступным объектам.
              Права определяют, что человек может просматривать и изменять.
            </p>
            <Link to={marketingPaths.security} className="most-text-link">
              Доступ и безопасность{" "}
              <span aria-hidden="true">
                <ArrowUpRightIcon className="most-icon" />
              </span>
            </Link>
          </div>
          <div>
            <h3>Начать можно с одного процесса.</h3>
            <p>
              Например, перенести заявки на материалы с одного объекта.
              Пригласить прораба и снабженца, определить правила работы, затем
              подключить остальные площадки и службы.
            </p>
            <Link to={marketingPaths.solutions} className="most-text-link">
              Решения для вашей команды{" "}
              <span aria-hidden="true">
                <ArrowUpRightIcon className="most-icon" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <div className="most-container most-page-closing">
        <CtaBand
          eyebrow="Демонстрация"
          title="Покажем работу нужных разделов."
          description="Расскажите о вашей компании и задаче. На демонстрации разберём процесс, роли сотрудников и данные для начала работы."
          actions={[
            {
              label: "Запросить демонстрацию",
              href: marketingPaths.contact,
              primary: true,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default FeaturesPage;
