import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import {
  MarketingLink,
  PageHero,
} from "@/components/marketing/MarketingPrimitives";
import { marketingPaths, marketingSeo } from "@/data/marketingRegistry";
import { useSEO } from "@/hooks/useSEO";
import "@/styles/marketing-segments.css";

const operatingModel = [
  {
    title: "Объект относится к организации",
    description:
      "Работы, пользователи и документы сохраняют принадлежность к своей организации. Сотрудник выбирает доступную организацию и работает с её объектами.",
    result: "Основа: организация и её объекты.",
  },
  {
    title: "Сотрудник получает нужный доступ",
    description:
      "Права задают, какие данные и действия доступны участнику в организации и проекте. Обязанности руководителя, команды объекта и финансовой службы различаются.",
    result: "Для участника: роль, объект и разрешённые действия.",
  },
  {
    title: "Руководитель работает со сводными данными",
    description:
      "Управляющая команда рассматривает сведения доступных организаций. Состав показателей определяется данными объектов и подключёнными возможностями.",
    result: "Для управления: доступные объекты и их показатели.",
  },
];

const relatedLinks = [
  {
    label: "Объекты и ресурсы",
    href: marketingPaths.constructionErp,
    description: "Связь работ, финансовых данных и документов организации.",
  },
  {
    label: "Интеграции",
    href: marketingPaths.integrations,
    description: "Согласованный обмен данными с другими системами.",
  },
  {
    label: "Бюджет строительства",
    href: marketingPaths.constructionBudgetControl,
    description: "План, платёжные документы и финансовые показатели объекта.",
  },
  {
    label: "Безопасность и доступ",
    href: marketingPaths.security,
    description: "Роли участников и разграничение доступа к данным.",
  },
];

const EnterprisePage = () => {
  useSEO({ ...marketingSeo.enterprise, type: "website" });

  return (
    <div className="marketing-page-shell most-segment-page">
      <PageHero
        title="Одна группа компаний. У каждого объекта — своя команда."
        description="МОСТ связывает работу площадки и офиса внутри группы компаний. Организации сохраняют свои объекты и пользователей, а управляющая команда работает с разрешённой сводной информацией."
        actions={[
          {
            label: "Обсудить структуру группы",
            href: `${marketingPaths.contact}#contact-form`,
            primary: true,
          },
          { label: "Безопасность и доступ", href: marketingPaths.security },
        ]}
        nav={[
          { label: "Организации и роли", href: "#operating-model" },
          { label: "Подключение", href: "#enterprise-capabilities" },
        ]}
      />

      <section id="operating-model" className="most-segment-section">
        <div className="most-container most-segment-story">
          <div className="most-segment-scene">
            <h2>Общая работа начинается с понятных границ.</h2>
            <p>
              На площадке работают разные участники. Чтобы данные объекта были
              полезны группе компаний, нужно сохранить их принадлежность и
              определить, кто с ними работает.
            </p>
            <figure>
              <img
                src="/images/marketing/most-material-story-1440.webp"
                srcSet="/images/marketing/most-material-story-720.webp 720w, /images/marketing/most-material-story-1440.webp 1440w"
                sizes="(min-width: 1024px) 48vw, 100vw"
                width="1440"
                height="810"
                alt="Фундамент одного объекта и материалы на его площадке"
              />
            </figure>
            <dl className="most-segment-record">
              <div>
                <dt>Принадлежность данных</dt>
                <dd>Организация → объект</dd>
              </div>
              <div>
                <dt>Доступ сотрудника</dt>
                <dd>Роль → разрешённые действия</dd>
              </div>
            </dl>
          </div>
          <ol className="most-segment-steps">
            {operatingModel.map((step) => (
              <li key={step.title}>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                <p className="most-segment-result">{step.result}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="enterprise-capabilities" className="most-segment-section">
        <div className="most-container most-segment-split">
          <div>
            <h2>Сначала одна организация. Затем — остальные.</h2>
            <p>
              Начните с выбранной организации и её объектов. Проверьте работу
              ролей и нужные сведения, прежде чем расширять состав участников.
            </p>
          </div>
          <dl className="most-segment-facts">
            <div>
              <dt>Структура и ответственность</dt>
              <dd>
                На первом разговоре разберём состав организаций, объекты и роли.
                Отдельно определим, кому нужны сведения по одному проекту, а
                кому — по нескольким организациям.
              </dd>
            </div>
            <div>
              <dt>Работы, документы и финансы</dt>
              <dd>
                Выберите процессы для начала работы: задачи, документы,
                материалы или платёжные записи. Набор пакетов подбирается под
                задачи организации и не подключается автоматически.
              </dd>
            </div>
            <div>
              <dt>Обмен и корпоративные условия</dt>
              <dd>
                Состав обмена с 1С и другими системами обсуждается отдельно.
                Перенос данных, обучение и дополнительные условия поддержки
                согласуются для корпоративного проекта.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="most-segment-section">
        <div className="most-container">
          <h2>Уточните требования к своей системе.</h2>
          <div className="most-segment-links">
            {relatedLinks.map((item) => (
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
        <section id="enterprise-cta" className="most-segment-contact">
          <h2>Разберём вашу структуру на встрече.</h2>
          <div>
            <p>
              Расскажите, какие организации входят в группу и кто отвечает за
              объекты. Покажем разделение данных и обсудим сведения, которые
              нужны управляющей команде.
            </p>
            <div className="most-page-actions">
              <MarketingLink
                href={`${marketingPaths.contact}#contact-form`}
                className="most-button most-button-orange"
              >
                Связаться с командой МОСТ
                <ArrowUpRightIcon className="most-icon" aria-hidden="true" />
              </MarketingLink>
              <MarketingLink
                href={marketingPaths.about}
                className="most-text-link"
              >
                О компании
                <ArrowUpRightIcon className="most-icon" aria-hidden="true" />
              </MarketingLink>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EnterprisePage;
