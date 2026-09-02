import { useEffect } from "react";
import { Link } from "react-router-dom";
import ContactForm from "@/components/landing/ContactForm";
import {
  marketingFaqs,
  marketingPaths,
  marketingSeo,
} from "@/data/marketingRegistry";
import useAnalytics from "@/hooks/useAnalytics";
import { useSEO } from "@/hooks/useSEO";

const workflows = [
  {
    title: "Прораб сообщает, что нужно",
    text: "Создаёт заявку на материалы, указывает объект и нужный срок. Прикладывает фотографии и описание.",
    href: marketingPaths.siteRequests,
    link: "Заявки с объекта",
  },
  {
    title: "Снабжение организует поставку",
    text: "Работает с заявками, закупками и поставками. Видит, для какого объекта нужны материалы.",
    href: marketingPaths.constructionProcurement,
    link: "Снабжение строительства",
  },
  {
    title: "Руководитель видит ход работ",
    text: "Проверяет сроки, задачи и платежи по объекту. Разбирает отклонения вместе с ответственными.",
    href: marketingPaths.projectPulse,
    link: "Сводка по объектам",
  },
];

const roles = [
  {
    name: "Руководителю",
    text: "Сроки и деньги по каждому объекту.",
    href: marketingPaths.constructionBudgetControl,
  },
  {
    name: "Прорабу",
    text: "Задания, фото и заявки с площадки.",
    href: marketingPaths.foremanSoftware,
  },
  {
    name: "Инженеру ПТО",
    text: "Работы и документы по проекту.",
    href: marketingPaths.ptoSoftware,
  },
  {
    name: "Снабженцу",
    text: "Потребности объектов и поставки.",
    href: marketingPaths.constructionProcurement,
  },
];

const HomePage = () => {
  useSEO({ ...marketingSeo.home, type: "website" });
  const { trackPageView } = useAnalytics();
  useEffect(() => {
    trackPageView("marketing_home");
  }, [trackPageView]);

  return (
    <div className="most-home">
      <section className="most-hero" aria-labelledby="most-home-title">
        <div className="most-container most-hero-heading">
          <h1 id="most-home-title">
            Между офисом
            <br />и стройкой — <span>МОСТ.</span>
          </h1>
          <div className="most-hero-intro">
            <p>
              Управление строительством: задачи, материалы, документы и финансы.
              Офис и площадка работают с одними данными по объекту.
            </p>
            <a href="#contact" className="most-button most-button-orange">
              Посмотреть МОСТ в работе <span aria-hidden="true">↗</span>
            </a>
            <Link to="/register" className="most-text-link">
              Или начать бесплатно <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <div className="most-bridge-scene">
          <img
            src="/images/marketing/most-bridge-1774.webp"
            srcSet="/images/marketing/most-bridge-640.webp 640w, /images/marketing/most-bridge-1024.webp 1024w, /images/marketing/most-bridge-1774.webp 1774w"
            sizes="100vw"
            width={1774}
            height={887}
            alt="Мост с опорами в форме буквы М соединяет строительную площадку и офис"
            loading="eager"
            fetchPriority="high"
          />
        </div>
        <div className="most-container most-hero-caption">
          <span>Стройка и офис. Одна команда.</span>
          <a href="#workflow">
            Как это работает <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      <section
        id="workflow"
        className="most-section most-container"
        aria-labelledby="most-workflow-title"
      >
        <div className="most-section-heading">
          <h2 id="most-workflow-title">
            У заявки есть объект.
            <br />У задачи — ответственный.
          </h2>
          <p>
            Когда информация остаётся в переписке, её приходится искать и
            уточнять. В МОСТ она связана с конкретным объектом и доступна
            участникам работы.
          </p>
        </div>
        <ol className="most-workflow">
          {workflows.map((item, index) => (
            <li key={item.title}>
              <span className="most-step-number">0{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <Link to={item.href} className="most-text-link">
                {item.link} <span aria-hidden="true">↗</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section
        id="product"
        className="most-product-section"
        aria-labelledby="most-product-title"
      >
        <div className="most-container">
          <div className="most-section-heading">
            <h2 id="most-product-title">
              Видеть объект целиком.
              <br />
              Разбираться в деталях.
            </h2>
            <div>
              <p>
                От графика работ — к задачам, материалам и платежам. Проверяйте
                план и факт, уточняйте сроки, находите ответственных.
              </p>
              <Link to={marketingPaths.features} className="most-text-link">
                Все возможности МОСТ <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
          <figure className="most-product-figure">
            <div className="most-product-image">
              <img
                src="/images/marketing/most-project-schedule.webp"
                width={2200}
                height={1420}
                loading="lazy"
                alt="График строительного проекта в МОСТ: этапы работ, задачи и сроки на диаграмме Ганта"
              />
            </div>
            <figcaption>
              <strong>График работ</strong>
              <span>
                Задачи, зависимости и план-факт по срокам в одном представлении.
              </span>
            </figcaption>
          </figure>
          <div className="most-product-links">
            <Link to={marketingPaths.materialAccounting}>
              Материалы и склад <span aria-hidden="true">↗</span>
            </Link>
            <Link to={marketingPaths.constructionBudgetControl}>
              Бюджет и платежи <span aria-hidden="true">↗</span>
            </Link>
            <Link to={marketingPaths.ptoSoftware}>
              Работы и документы <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      <section
        className="most-section most-container most-roles"
        aria-labelledby="most-roles-title"
      >
        <div>
          <h2 id="most-roles-title">
            Своя работа.
            <br />
            Общий результат.
          </h2>
          <p>
            Каждому сотруднику — нужные разделы и права. Команде — общий порядок
            работы с объектом.
          </p>
          <Link to={marketingPaths.solutions} className="most-text-link">
            Решение для вашей компании <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="most-role-list">
          {roles.map((role) => (
            <Link key={role.name} to={role.href}>
              <div>
                <h3>{role.name}</h3>
                <p>{role.text}</p>
              </div>
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section
        className="most-start-section"
        aria-labelledby="most-start-title"
      >
        <div className="most-container most-start-layout">
          <div>
            <h2 id="most-start-title">Начните с одного объекта.</h2>
            <p>
              Создайте организацию, пригласите команду и заведите первый проект.
              Подключайте платные возможности по мере необходимости.
            </p>
            <div className="most-inline-actions">
              <Link to="/register" className="most-button most-button-orange">
                Начать бесплатно <span aria-hidden="true">↗</span>
              </Link>
              <Link to={marketingPaths.pricing} className="most-text-link">
                Состав и стоимость пакетов <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <div className="most-free-price">
            <strong>
              0 <span>₽</span>
            </strong>
            <p>
              Организация, команда
              <br />и первые проекты
            </p>
          </div>
        </div>
      </section>

      <section
        className="most-section most-container most-faq"
        aria-labelledby="most-faq-title"
      >
        <h2 id="most-faq-title">До начала работы</h2>
        <div>
          {marketingFaqs.map((item) => (
            <details key={item.question}>
              <summary>
                {item.question}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section
        id="contact"
        className="most-contact-section"
        aria-labelledby="most-contact-title"
      >
        <div className="most-container most-contact-layout">
          <div>
            <h2 id="most-contact-title">
              Покажем МОСТ
              <br />
              на вашей задаче.
            </h2>
            <p>
              Расскажите, как устроена работа вашей компании и что хотите
              изменить. Разберём нужные разделы, доступ сотрудников и первые
              шаги.
            </p>
            <a
              className="most-contact-email"
              href="mailto:info@xn--1-xtbgmf.xn--p1ai"
            >
              info@1мост.рф <span aria-hidden="true">↗</span>
            </a>
          </div>
          <ContactForm variant="compact" className="most-contact-form" />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
